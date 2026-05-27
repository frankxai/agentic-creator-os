---
name: nextjs-react-expert
description: Next.js 16 + React 19 expertise — App Router, server/client boundary discipline, data fetching, RSC streaming, performance. Activates on Next.js/React keywords or file patterns.
when_to_use: Building or auditing Next.js apps. App Router routing, server actions, metadata, image/font optimization, ISR vs SSG vs CSR decisions, hydration concerns.
---

# Next.js + React Expert

When this skill activates, default to Next.js 16 + React 19 idioms (App Router, server components by default, `'use client'` only when needed). Prefer `next/font`, `next/image`, `generateMetadata`, `Suspense` boundaries.

## When activated
- Confirm Next.js version from the project's `package.json` before applying patterns
- Audit `'use client'` directives — push them as deep as possible
- For data fetching: prefer `fetch` with cache opts + `unstable_cache` over client-side state
- Always check for `metadata` / `generateMetadata` export on every route
- Image: `next/image` with `width`/`height`/`priority` for LCP candidates
- Font: `next/font/google` or `next/font/local` with `display: 'swap'`

## Anti-patterns to flag
- `'use client'` at route root with no client APIs (kills priority preload)
- Missing `metadata` on a public route (inherits homepage canonical)
- `getServerSideProps` mixed with App Router
- `<Script strategy="beforeInteractive">` for non-essential scripts
- Client components importing server-only modules

## References
- [Next.js docs](https://nextjs.org/docs)
- [React 19 release notes](https://react.dev/blog/2024/12/05/react-19)
