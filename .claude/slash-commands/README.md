# Agentic Creator OS - Slash Commands

This directory contains slash command scripts for OpenCode.

## Available Commands

| Command | Description |
|---------|-------------|
| `/content-strategy` | Develop comprehensive content strategy |
| `/content-calendar` | Plan and manage content calendar |
| `/linkedin-content-article` | Create long-form LinkedIn articles |
| `/linkedin-content` | Create short LinkedIn posts |
| `/x-content` | Create tweets and Twitter threads |
| `/meta-content` | Create Facebook/Instagram content |
| `/farcaster-content` | Create FarCaster/Warpcast casts |
| `/mirror-content` | Create Mirror/Paragraph essays |

## Usage

In OpenCode, type `/` followed by any command:
- `/content-strategy`
- `/linkedin-content`
- `/x-content`
- etc.

## Alternative Usage

If slash commands don't appear, use skill triggers:
- `skill:content, create content strategy`
- `skill:content, create linkedin post about [topic]`
- `skill:content, write a twitter thread about [topic]`

## Requirements

- Agentic Creator OS must be installed at:
  `C:/Users/Frank/FrankX/FrankX.AI - Vercel Website/agentic-creator-os/`

- MCP servers must be configured in OpenCode settings

## Troubleshooting

If commands don't appear:
1. Restart OpenCode
2. Check `~/.claude/settings.json` for MCP configuration
3. Run `bash setup.sh` in the agentic-creator-os directory
