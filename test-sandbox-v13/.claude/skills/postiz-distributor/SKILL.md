---
name: postiz-distributor
description: Formats, schedules, and distributes creator assets across social platforms (X, LinkedIn, Threads, YouTube Shorts) via Postiz, Buffer, or Blotato. Activates on: distribute, schedule post, queue thread, postiz, blotato, buffer.
---

# Postiz & Blotato Distributor

This skill handles multi-channel content syndication and scheduling directly from written drafts.

## Core Directives
1. **Thread Generation**: Convert long-form articles into high-hook X (Twitter) and LinkedIn threads. Wrap text at 240/280 characters and format with numbering and spacing.
2. **Shorts Adaptation**: Extract key takeaways and write a 60-second video script (hook, body, transition loop) for TikTok/Shorts.
3. **Queue Mapping**: Format output payloads for direct API import into Postiz, Blotato, or Buffer calendars, specifying release delay offsets (e.g. +0h, +4h, +24h).

## Platform Rules
- **X (Twitter)**: No hashtags, first tweet must be a high-engagement hook, end with a link to the main asset.
- **LinkedIn**: Spaced blocks, include a personal reflection or call-to-action in the footer.
- **Blotato**: Direct Markdown syndication.
- **Postiz**: Standard webhook format.
