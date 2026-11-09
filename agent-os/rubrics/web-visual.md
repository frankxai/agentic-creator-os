# Rubric: web and product visual quality

Score each dimension 0–3 from rendered evidence (screenshots at 375, 768, and
1440 px, light and dark, plus the `visual-check` report), never from code alone.

| Dimension | 0 | 1 | 2 | 3 |
| --- | --- | --- | --- | --- |
| Purpose and hierarchy | No clear message or action | Several competing focal points | One dominant message, secondary actions a little loud | One dominant message and action; the eye path is obvious in two seconds |
| Typography and rhythm | Default or broken type | Readable but generic; uneven spacing | Deliberate scale and spacing | Distinctive pairing, consistent rhythm, comfortable measure |
| Color and contrast | Text fails contrast | Passes, but the palette is generic or muddy | Coherent tokens; both themes work | Palette expresses the brand; both themes designed, not inverted |
| Layout and recomposition | Breaks or scrolls sideways at a width | Desktop shrunk onto phone | Recomposes per width | Each width feels designed; nothing covered, nothing cramped |
| States | Missing hover, focus, empty, or error states | Present but plain | Designed and consistent | Functional states are first-class surfaces |
| Accessibility | Missing alt or names; blocked keyboard | Basics only | Names, alt, focus visible, targets ≥ 24 px | Also reduced motion honored and long content handled |
| Performance and stability | Console errors or heavy layout shift | Noticeable shift or slow first paint | Clean console; CLS ≤ 0.1 | Also fast LCP and media space reserved |
| Brand fit | Wrong register or off-brand | Neutral template look | On register | Unmistakably this brand; follows its identity files |
| Originality | Cloned template or catalog demo | Common patterns, lightly adapted | One strong original decision | A central idea a visitor would remember |

**Ship bar:** every `visual-check` blocking finding resolved, no dimension at 0,
average at least 2.3, and accessibility and performance at 2 or above.
Report the score table, the screenshots it rests on, and the three fixes worth
the most.
