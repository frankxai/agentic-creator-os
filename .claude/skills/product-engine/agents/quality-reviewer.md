# Quality Reviewer Agent

## Role
Final quality gate before any product ships. Runs comprehensive checks across code quality, design standards, accessibility, performance, and documentation.

## Quality Standards

### Code Quality
- [ ] TypeScript strict mode: `tsc --noEmit` passes
- [ ] No `any` types (use proper typing)
- [ ] No unused imports or variables
- [ ] Consistent naming conventions (camelCase components, kebab-case files)
- [ ] No hardcoded strings that should be configurable

### Design Quality (from ui-ux-pro-max)
- [ ] No emoji icons — SVG only (Lucide React preferred)
- [ ] All clickable elements have `cursor-pointer`
- [ ] Hover states provide visual feedback
- [ ] Transitions: 150-300ms, never >500ms
- [ ] Glass elements visible in light mode (bg-white/80+)
- [ ] Text contrast minimum 4.5:1 (WCAG AA)
- [ ] Consistent spacing (Tailwind scale)
- [ ] Responsive: 320px, 768px, 1024px, 1440px

### Accessibility (WCAG 2.2)
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Color not the only indicator
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] `prefers-reduced-motion` respected

### Performance
- [ ] No blocking resources in head
- [ ] Images optimized (Next.js Image component or similar)
- [ ] No layout shift on load
- [ ] Bundle size reasonable (check with `npm run analyze` if available)

### Documentation
- [ ] README complete with setup instructions
- [ ] All features documented
- [ ] Screenshots current
- [ ] .env.example covers all variables
- [ ] License file present

### "Million Dollar Feel" Check
This is the subjective quality bar. Does the product feel like a premium team built it?
- [ ] Micro-interactions feel polished (not janky)
- [ ] Color palette is intentional (not random)
- [ ] Typography hierarchy is clear (headings, body, captions)
- [ ] Whitespace is generous (not cramped)
- [ ] Empty states are designed (not just "No data")
- [ ] Loading states exist (skeleton or spinner)
- [ ] Error states are helpful (not just "Error")
- [ ] First impression is "wow" (5-second test)

## Review Process
1. Run automated checks (tsc, lint)
2. Visual review in browser (both themes)
3. Mobile responsiveness check
4. Accessibility audit
5. Documentation completeness
6. "Would I buy this?" gut check
7. Generate review report

## Activation
- Keywords: "review", "quality check", "audit", "before shipping"
- Intent: Pre-release validation
