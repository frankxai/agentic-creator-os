---
name: game-development
description: ACOS game development intelligence for high-quality browser game design and implementation.
---

# ACOS Game Development Skill v1.0

## Purpose

Intelligence layer for FrankX's Games Lab (frankx.ai/games). Encodes world-class browser game design principles — animation choreography, feedback systems, quality gates, and per-genre templates. Any agent loading this skill produces games at AAA studio quality, not "indie jam" quality.

## Activation

Auto-activates when session involves: game development, Canvas2D rendering, game feel tuning, particle effects, game loop optimization, or any `/games/` route work.

**Triggers**: `game`, `canvas`, `particle`, `collision`, `sprite`, `dungeon`, `puzzle game`, `roguelike`, `game loop`, `game feel`

---

## Game Registry (7 Games)

### 1. Crystal Match
- **Slug**: `crystal-match`
- **Engine**: React DOM (CSS animations)
- **Genre**: Puzzle (match-3)
- **Quality Baseline**: Bejeweled 3, Candy Crush Saga
- **Key Feel**: Satisfying cascades, escalating combos, gems feel alive
- **File**: `app/games/crystal-match/page.tsx`

### 2. Neon Depths
- **Slug**: `neon-depths`
- **Engine**: Canvas2D
- **Genre**: Roguelike (turn-based dungeon crawler)
- **Quality Baseline**: Brogue, Hoplite, Into the Breach
- **Key Feel**: Tense exploration, impactful combat, atmospheric dungeon
- **File**: `app/games/neon-depths/page.tsx`

### 3. Neon Runner
- **Slug**: `neon-runner`
- **Engine**: Canvas2D
- **Genre**: Action (endless runner)
- **Quality Baseline**: Subway Surfers, Alto's Odyssey
- **Key Feel**: Speed sensation, near-miss drama, fluid lane changes
- **File**: `app/games/neon-runner/page.tsx`

### 4. Snake Neon
- **Slug**: `snake-neon`
- **Engine**: Canvas2D
- **Genre**: Arcade (snake)
- **Quality Baseline**: Snake.io, Slither.io
- **Key Feel**: Fluid movement, satisfying growth, dramatic death
- **File**: `app/games/snake-neon/page.tsx`

### 5. 2048 Neon
- **Slug**: `neon-2048`
- **Engine**: React DOM (CSS animations)
- **Genre**: Puzzle (sliding tiles)
- **Quality Baseline**: Original 2048, Threes!
- **Key Feel**: Satisfying merges, tile weight, big-merge celebration
- **File**: `app/games/neon-2048/page.tsx`

### 6. Word Forge
- **Slug**: `word-forge`
- **Engine**: React DOM (CSS animations)
- **Genre**: Word (Wordle-style)
- **Quality Baseline**: Wordle, Spelling Bee
- **Key Feel**: Letter reveal drama, keyboard feedback, win celebration
- **File**: `app/games/word-forge/page.tsx`

### 7. Memory Match
- **Slug**: `memory-match`
- **Engine**: React DOM (Framer Motion)
- **Genre**: Puzzle (card matching)
- **Quality Baseline**: Concentration, Memrise
- **Key Feel**: Card flip satisfaction, match celebration, mismatch clarity
- **File**: `app/games/memory-match/page.tsx`

---

## 10 Quality Gates (MANDATORY)

Every game MUST pass ALL gates before deploy. No exceptions.

### Gate 1: No Instant State Changes
Every visual change must be animated. Position changes use eased interpolation. Color changes use transitions. Size changes use scale animations. If a value snaps from A to B without interpolation, the game fails this gate.

### Gate 2: Three-Stage Feedback
Every primary player action has: anticipation (50-100ms buildup) → action (the actual change) → follow-through (100-300ms settle/overshoot). A swap in Crystal Match: gems lean toward target → cross positions → bounce into place. A move in Neon Depths: player leans → slides → settles.

### Gate 3: Idle Animations
Nothing is ever static. Every visible entity has subtle movement when idle:
- Player characters: breathing glow, gentle scale oscillation (0.97-1.03, 2-3s)
- Items: floating hover (±2px, 2s sine), glow pulse
- Enemies: slow sway, faint glow flicker
- UI elements: subtle shimmer, particle drift
- Board/background: ambient dust motes, gradient shift

### Gate 4: Environmental Depth
The world feels alive beyond the player's actions:
- Ambient particles (dust, energy motes, sparkles) — 1-3 per frame, capped at 30
- Background has subtle movement (gradient shift, star drift, grid pulse)
- Lighting responds to events (flash on impact, dim on death, warm on reward)

### Gate 5: Impact Feedback (Hitstop + Layered Effects)
Every collision or significant event uses layered feedback:
- Hitstop: 2-5 frame freeze to emphasize the moment
- Particles: burst from impact point in relevant colors
- Screen shake: intensity proportional to significance
- Flash: brief color overlay (red=damage, gold=reward, white=hit)
- Sound hook: even if muted, the code path exists for future audio

### Gate 6: Eased Movement (NEVER Linear)
All movement uses easing functions from effects.ts:
- Position changes: outCubic (smooth deceleration)
- Bouncy effects: outElastic or outBounce
- UI transitions: inOutCubic
- Decay effects: outQuad
- NEVER `transition: all` — always specify exact properties
- NEVER `animation: linear` — always use cubic-bezier or named easings

### Gate 7: Death/Failure Sequence
Failure is NEVER just a text overlay. Every game has a multi-stage death sequence:
1. Freeze frame / hitstop (50-100ms)
2. Dramatic visual (explosion, shatter, dim, collapse)
3. Screen response (shake, flash, zoom)
4. Particle aftermath (debris, fade, dissolve)
5. Score/stats reveal with dramatic timing
6. Retry prompt with clear call-to-action

### Gate 8: Victory/Win Celebration
Winning is NEVER just a score display. Every game has:
1. Moment of recognition (brief pause, glow)
2. Celebration burst (confetti, particles, flash)
3. Score dramatic count-up (not instant display)
4. Achievement/stats with satisfying reveal timing
5. Play-again prompt that feels inviting

### Gate 9: Color Storytelling
Colors communicate game state consistently:
- **Cyan/Blue** (#43BFE3): Player, safe, neutral, UI
- **Gold/Amber** (#F59E0B): Reward, score, items, positive
- **Red/Rose** (#F43F5E): Danger, damage, error, negative
- **Green/Emerald** (#10B981): Health, success, growth
- **Purple/Violet** (#8B5CF6): Special, rare, magic, combo
- **White/Silver** (#E2E8F0): Impact, flash, emphasis
Color intensity scales with significance (bigger combo = brighter).

### Gate 10: Mobile-First Input
Touch controls must feel as good as keyboard:
- Touch targets minimum 48px (WCAG)
- Swipe dead zone 30px (prevent accidental)
- Visual feedback on touch (ripple, press state) within 16ms
- D-pad buttons for games needing directional input
- Input buffering (2 frames) — never drop player input

---

## Animation Principles (Disney's 12, Adapted)

### From Disney
1. **Squash & Stretch**: Gems compress on impact, tiles stretch on fast moves
2. **Anticipation**: Brief windup before every action (lean, glow, scale down)
3. **Follow-Through**: Overshoot + settle after movement completes
4. **Slow In, Slow Out**: Ease into and out of all movement (outCubic default)
5. **Arcs**: Natural curved motion paths, not straight lines
6. **Secondary Action**: Supporting animations reinforce primary (particles on move, glow on select)
7. **Staging**: Draw player attention to what matters (dim background during key events)
8. **Appeal**: Everything should look good. Clean shapes, consistent sizes, brand colors.

### Game-Specific
9. **Hitstop**: 2-5 frame pause on significant impacts. Makes hits feel powerful.
10. **Juice Escalation**: Effects intensify with combos/streaks. 1x normal → 2x particles → 3x shake + flash.
11. **Telegraph**: Enemies/hazards signal intent before acting. Red pulse = about to attack. Glow = about to move.
12. **Weight**: Heavy objects move slowly with strong follow-through. Light objects move fast with minimal overshoot.

---

## Genre Templates

### Puzzle (Crystal Match, 2048)
- **Primary loop**: Select → action → cascade → score
- **Key animation**: Match celebration must escalate with chain length
- **Idle**: Board should ripple subtly, individual pieces shimmer
- **Signature moment**: Long cascade with escalating particles + screen shake
- **Anti-pattern**: Instant gem removal without pop animation

### Action/Runner (Neon Runner)
- **Primary loop**: Dodge → collect → speed up → survive
- **Key animation**: Speed sensation through FOV, speed lines, ground acceleration
- **Idle**: N/A (always moving), but player character has micro-animations
- **Signature moment**: Near-miss with slow-motion + dramatic zoom
- **Anti-pattern**: Flat perspective with no depth cues

### Roguelike (Neon Depths)
- **Primary loop**: Explore → encounter → combat → loot → descend
- **Key animation**: Combat hitstop is the most important single animation
- **Idle**: Dungeon atmosphere — dust, flicker, enemy sway
- **Signature moment**: Room reveal with radial light expansion
- **Anti-pattern**: Instant teleport between tiles, instant damage numbers

### Word (Word Forge)
- **Primary loop**: Type → submit → reveal → learn
- **Key animation**: Sequential letter reveal with staggered timing
- **Idle**: Gentle keyboard glow, submitted rows have subtle shimmer
- **Signature moment**: Winning guess with all-green cascade + celebration
- **Anti-pattern**: All letters revealed simultaneously

### Arcade (Snake)
- **Primary loop**: Move → grow → avoid → survive
- **Key animation**: Fluid interpolated movement (never grid-snap)
- **Idle**: Body segments sway slightly, head has directional lean
- **Signature moment**: Death sequence rippling from head to tail
- **Anti-pattern**: Stepped movement where snake teleports between cells

---

## Technical Standards

### Canvas Games (Neon Depths, Neon Runner, Snake)
- **Game loop**: `requestAnimationFrame` with delta-time tracking
- **Rendering**: Clear → draw background → draw entities → draw effects → draw HUD
- **Effects pipeline**: `ctx.save()` → apply shake offset → draw scene → `ctx.restore()` → draw flash overlay
- **Particle budget**: Mobile 100 max, desktop 200 max (enforced by ParticleSystem)
- **State**: Game state in `useRef` (not `useState`) to avoid React re-renders in loop
- **Resolution**: Canvas sized to container, CSS handles responsive scaling

### DOM Games (Crystal Match, 2048, Word Forge, Memory Match)
- **Animations**: CSS `@keyframes` injected via `<style>` tag, or Framer Motion
- **Timing**: CSS `cubic-bezier(0.33, 1, 0.68, 1)` = outCubic, `cubic-bezier(0.34, 1.56, 0.64, 1)` = outBack
- **Stagger**: CSS custom property `--delay` with `animation-delay: var(--delay)` for sequential reveals
- **State management**: React useState for UI state, useRef for animation state
- **Performance**: `will-change: transform` on animated elements, `transform` over `top/left`

### Shared Engine (`lib/games/effects.ts`)
- ParticleSystem: burst, sparkle, floatingText
- ScreenShake: intensity decay via outQuad
- FlashEffect: color overlay with fade
- AnimatedValue: smooth numeric transitions
- GameTimer: frame-based callbacks and sequences
- Hitstop: freeze-frame for impact emphasis
- GameAudio: Web Audio API oscillator stubs
- Easing: outQuad, outCubic, outElastic, outBounce, inOutCubic
- Colors: NEON brand palette, hexToRGBA, lerpColor, pulseAlpha

---

## Anti-Patterns (NEVER DO)

| Anti-Pattern | Why It's Bad | Do This Instead |
|---|---|---|
| Instant state change | Feels like a bug, not a game | Animate everything with easing |
| `transition: all 0.3s` | Transitions wrong properties, looks sloppy | Specify exact properties and durations |
| `animation: linear` | Robotic, unnatural movement | Use cubic-bezier easing curves |
| Static entities | Dead, lifeless world | Add idle animations to everything |
| Text-only game over | Anticlimactic, cheap feeling | Multi-stage death sequence with effects |
| Score instant display | No satisfaction, no drama | Score count-up with accelerating pace |
| Uniform particle bursts | Looks like a default particle emitter | Vary size, speed, color, gravity per context |
| Grid-snap movement | Characters teleport, feels jarring | Interpolate position over 60-80% of tick |
| Same shake for everything | Loses meaning, becomes noise | Scale shake intensity to event significance |
| Ignoring mobile | Half the audience can't play | Touch-first, keyboard-enhanced |

---

## Shared Resources

- **Effects Engine**: `lib/games/effects.ts` — import { ParticleSystem, ScreenShake, FlashEffect, AnimatedValue, GameTimer, Hitstop, GameAudio, ease, NEON, NEON_BURST }
- **Game Registry**: `lib/games/registry.ts` — GameEntry, GameQualityMetrics, getGameBySlug, getQualityReport
- **Brand Colors**: NEON object (cyan, violet, purple, amber, emerald, rose, fuchsia, lime, white)
- **Production Path**: `.worktrees/vercel-ui-ux/app/games/`

---

*Every frame is a chance to delight. Build like Supergiant, polish like Nintendo.*
