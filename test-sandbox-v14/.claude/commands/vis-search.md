# VIS Search — Visual Intelligence System Registry Search

Search the visual registry for images matching tags, mood, category, suitability, or size.

## Usage

```bash
# Positional search — words match against tags, mood, category, filename (AND logic)
node /mnt/c/Users/Frank/visual-intelligence/bin/vis.mjs search music atmospheric

# Structured flags
node /mnt/c/Users/Frank/visual-intelligence/bin/vis.mjs search --tag music --mood atmospheric --theme dark

# Find by suitability
node /mnt/c/Users/Frank/visual-intelligence/bin/vis.mjs search --suitable homepage-showcase

# Filter by category
node /mnt/c/Users/Frank/visual-intelligence/bin/vis.mjs search --category blog

# Size range (KB)
node /mnt/c/Users/Frank/visual-intelligence/bin/vis.mjs search --min-size 100 --max-size 500

# Combine positional + flags
node /mnt/c/Users/Frank/visual-intelligence/bin/vis.mjs search hero --category acos --max-size 1000
```

## Run against FrankX registry

The FrankX project root is auto-detected. From the FrankX directory:

```bash
node /mnt/c/Users/Frank/visual-intelligence/bin/vis.mjs search <query>
```

## Flags

| Flag | Description |
|------|-------------|
| `--tag <tag>` | Match against image tags |
| `--mood <mood>` | Match against mood field |
| `--theme <theme>` | Match against theme field |
| `--suitable <use>` | Match against suitableFor array |
| `--category <cat>` | Match against category field |
| `--min-size <KB>` | Minimum file size in KB |
| `--max-size <KB>` | Maximum file size in KB |

Positional words (no flag prefix) match against tags, mood, category, and filename simultaneously. All words/flags use AND logic — every condition must match.
