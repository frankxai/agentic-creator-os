---
description: Create and update UI components for FrankX.AI with glassmorphic design system
thinking: false
---

# FrankX.AI Component Development

**Components**: `/components/`
**UI Primitives**: `/components/ui/`
**Design System**: Glassmorphic Aurora (Tailwind-based)

## Design System Overview

**Philosophy**: Best components from the best libraries. Curate world-class UI.

### UI Component Sources

| Library | Best For | Install |
|---------|----------|---------|
| **Magic UI** | Animated components | Copy from [magicui.design](https://magicui.design) |
| **shadcn/ui** | Accessible primitives | `npx shadcn@latest add [component]` |
| **Cult UI** | Premium effects | Copy from [cult-ui.com](https://cult-ui.com) |
| **Aceternity UI** | Cinematic animations | Copy from [ui.aceternity.com](https://ui.aceternity.com) |
| **Framer Motion** | Custom animations | Already installed |

### When to Use Each

- **Forms, Dialogs, Dropdowns** → shadcn/ui (accessibility-first)
- **Hero Backgrounds, Spotlights** → Magic UI or Aceternity
- **3D Cards, Particle Effects** → Cult UI
- **Text Reveals, Stagger Effects** → Magic UI + Framer Motion
- **Custom Interactions** → Build with Framer Motion

### Color Palette

```css
/* Core Colors */
--midnight: slate-950        /* Main background */
--aurora-cyan: cyan-500      /* Primary accent */
--aurora-purple: purple-500  /* Secondary accent */
--aurora-blue: blue-500      /* Tertiary accent */

/* Functional */
--primary: #6943ff → #422ea9
--secondary: #0ea5e9 → #075985
--accent: #de8a4a → #703c2b
```

### Key UI Patterns

1. **Glassmorphic Cards**
   - Frosted glass effect with `backdrop-blur`
   - Subtle border glow on hover
   - Gradient overlays

2. **Aurora Backgrounds**
   - Animated radial gradients
   - Pulse and flow animations
   - Layered depth

3. **Interactions**
   - Magnetic hover effects
   - Stagger animations for reveals
   - Smooth page transitions

## Existing Components

### UI Primitives (`/components/ui/`)
- `GlassmorphicCard.tsx` - Base card with glass effect
- `PremiumButton.tsx` - Styled button variants
- `InteractiveCard.tsx` - Cards with hover states
- `AnimatedBackground.tsx` - Aurora gradients
- `AdvancedAnimations.tsx` - Framer Motion helpers
- `LoadingStates.tsx` - Skeletons and spinners
- `badge.tsx` - Labels and badges
- `primitives.tsx` - Base atoms

### Home Page (`/components/home/`)
- `OptimizedHomePage.tsx` - Main landing
- `sections/` - Hero, Testimonials, Projects, etc.

### Blog (`/components/blog/`)
- `BlogCard.tsx` - Article cards
- `MDXComponents.tsx` - MDX rendering

### Products (`/components/products/`)
- `ProductLanding.tsx` - Full product page
- `ProductHero.tsx` - Hero section
- `OfferStack.tsx` - Pricing display
- `CaseStudyGrid.tsx` - Social proof
- `FinalCTA.tsx` - Conversion block

### Funnels (`/components/funnels/`)
- `CallToAction.tsx` - CTA sections
- `EmailCaptureForm.tsx` - Newsletter signup

## Creating New Components

### Step 1: Determine Component Type

| Type | Location | Pattern |
|------|----------|---------|
| UI Primitive | `/components/ui/` | Reusable atom |
| Feature | `/components/[feature]/` | Feature-specific |
| Page Section | `/components/home/sections/` | Homepage block |
| Layout | `/components/` | Structural |

### Step 2: Component Template

```tsx
'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ComponentNameProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
}

export function ComponentName({
  title,
  children,
  className,
}: ComponentNameProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        // Base styles
        'relative rounded-2xl p-6',
        // Glassmorphic effect
        'bg-slate-900/50 backdrop-blur-xl',
        'border border-white/10',
        // Hover state
        'hover:border-cyan-500/30 transition-all duration-300',
        className
      )}
    >
      <h3 className="text-xl font-semibold text-white mb-4">
        {title}
      </h3>
      {children}
    </motion.div>
  );
}
```

### Step 3: Animation Patterns

**Fade In Up** (most common):
```tsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}
```

**Stagger Children**:
```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

<motion.div variants={container} initial="hidden" animate="show">
  {items.map(i => <motion.div key={i} variants={item} />)}
</motion.div>
```

**Hover Glow**:
```tsx
className="hover:shadow-[0_0_30px_rgba(34,211,238,0.3)]"
```

### Step 4: Accessibility

Required for all components:
- [ ] Semantic HTML elements
- [ ] Proper heading hierarchy
- [ ] Keyboard navigation
- [ ] Focus states visible
- [ ] Color contrast 4.5:1+
- [ ] Alt text for images
- [ ] ARIA labels where needed

### Step 5: Testing

```bash
# Visual check
npm run dev
# Visit component page

# Build verification
npm run build

# Lint check
npm run lint
```

## Common Patterns

### Card with Gradient Border
```tsx
<div className="p-[1px] rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-blue-500">
  <div className="bg-slate-950 rounded-2xl p-6">
    Content
  </div>
</div>
```

### Section Container
```tsx
<section className="py-24 px-6 relative overflow-hidden">
  <div className="max-w-7xl mx-auto">
    Content
  </div>
</section>
```

### Responsive Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

## Skill Integration

For complex UI work:
```
/skill ui-ux-design-expert
/skill frontend-design:frontend-design
```

**Ready to create or update components. What are we building?**
