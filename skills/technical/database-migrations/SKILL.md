---
name: database-migrations
description: "Database schema migration patterns with Prisma and Drizzle ORM. Covers migration strategies, rollbacks, data migrations, and production deployment."
version: 1.0.0
triggers:
  - database migration
  - schema migration
  - prisma migrate
  - drizzle
  - database schema
---

# Database Migrations Skill

Manage database schema changes safely with migration tools and best practices.

## Prisma Migrations

### Initial Setup

```bash
# Initialize Prisma
npx prisma init

# Create migration from schema changes
npx prisma migrate dev --name init

# Apply migrations in production
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset
```

### Schema Definition

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  createdAt DateTime @default(now())

  @@index([authorId])
}
```

### Safe Migration Workflow

```bash
# 1. Make schema changes in schema.prisma

# 2. Create migration (development)
npx prisma migrate dev --name add_user_role

# 3. Review generated SQL
cat prisma/migrations/*/migration.sql

# 4. Test in staging
DATABASE_URL=$STAGING_URL npx prisma migrate deploy

# 5. Deploy to production
DATABASE_URL=$PROD_URL npx prisma migrate deploy
```

### Data Migrations

```typescript
// prisma/migrations/scripts/backfill-user-roles.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Backfill default role for existing users
  await prisma.user.updateMany({
    where: { role: null },
    data: { role: 'user' },
  });

  console.log('Backfill complete');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

## Drizzle ORM Migrations

### Setup

```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

### Schema Definition

```typescript
// src/db/schema.ts
import { pgTable, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  name: text('name'),
  role: text('role').default('user'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  emailIdx: index('email_idx').on(table.email),
}));

export const posts = pgTable('posts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  content: text('content'),
  published: boolean('published').default(false),
  authorId: text('author_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### Migration Commands

```bash
# Generate migration
npx drizzle-kit generate:pg

# Push schema (dev only, no migration files)
npx drizzle-kit push:pg

# Apply migrations
npx drizzle-kit migrate
```

## Migration Best Practices

### 1. Additive Changes First

```sql
-- SAFE: Add nullable column
ALTER TABLE users ADD COLUMN phone TEXT;

-- SAFE: Add column with default
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';

-- RISKY: Add NOT NULL without default (locks table, may fail)
-- ALTER TABLE users ADD COLUMN required_field TEXT NOT NULL;
```

### 2. Multi-Step Breaking Changes

```sql
-- Step 1: Add new column (nullable)
ALTER TABLE users ADD COLUMN new_email TEXT;

-- Step 2: Backfill data (separate migration)
UPDATE users SET new_email = email;

-- Step 3: Make non-null, add constraint
ALTER TABLE users ALTER COLUMN new_email SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT users_new_email_unique UNIQUE (new_email);

-- Step 4: Drop old column (after app updated)
ALTER TABLE users DROP COLUMN email;
ALTER TABLE users RENAME COLUMN new_email TO email;
```

### 3. Zero-Downtime Patterns

```typescript
// 1. Expand: Add new column/table
// 2. Migrate: Dual-write to old and new
// 3. Contract: Remove old column/table

// During expand phase - dual write
async function createUser(data: UserInput) {
  return prisma.user.create({
    data: {
      ...data,
      // Write to both old and new columns
      email: data.email,
      emailNew: data.email,
    },
  });
}
```

## Rollback Strategies

### Manual Rollback Script

```sql
-- prisma/migrations/rollback/20260123_add_role.sql
ALTER TABLE users DROP COLUMN IF EXISTS role;
```

### Prisma Rollback

```bash
# Mark migration as rolled back (doesn't run SQL)
npx prisma migrate resolve --rolled-back 20260123000000_add_role

# Then manually apply rollback SQL
psql $DATABASE_URL -f prisma/migrations/rollback/20260123_add_role.sql
```

## Production Deployment

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
deploy:
  steps:
    - name: Run migrations
      run: npx prisma migrate deploy
      env:
        DATABASE_URL: ${{ secrets.DATABASE_URL }}

    - name: Deploy app
      run: vercel --prod
```

### Pre-deployment Checklist

- [ ] Migration tested in staging
- [ ] Rollback script prepared
- [ ] Backup taken before migration
- [ ] Migration is additive (if possible)
- [ ] No table locks during peak hours
- [ ] Monitoring in place

## Anti-Patterns

❌ Running `migrate dev` in production
❌ Destructive changes without backup
❌ Large data migrations in single transaction
❌ Dropping columns before app update
❌ No rollback plan

✅ Use `migrate deploy` in production
✅ Always backup before migration
✅ Batch large data migrations
✅ Expand-migrate-contract pattern
✅ Test rollback procedure
