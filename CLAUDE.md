# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

This is the personal brand system for **@wonderwomancode** - the CEO/CTO Co-founder of Alternate Futures (alternatefutures.ai). It contains brand guidelines, social media automation, cross-posting tools, and AI agent definitions for managing a consistent multi-platform presence.

## Repository Structure

| Directory | Purpose |
|-----------|---------|
| `brand-guide/` | Comprehensive brand identity (colors, typography, voice, visuals) |
| `social-media/profiles/` | Platform-specific profile copy, bios, and settings |
| `automation/` | TypeScript cross-posting and content adaptation scripts |
| `graphics/` | Graphic specs, SVG templates for headers/banners |
| `mcp-setup/` | MCP server integration guides for automated social management |
| `.claude/agents/` | AI agent definitions for brand management |

## Key Relationships

- **Parent company brand**: Alternate Futures (see `brand-guide/af-brand-bridge.md`)
- **AF admin repo**: `/Users/wonderwomancode/Projects/alternatefutures/admin/` contains the company marketing agents
- **Personal brand is distinct but bridged** to AF through shared blue tones and Instrument Sans typography

## Common Commands

```bash
# Install automation dependencies
cd automation && pnpm install

# Run cross-poster
pnpm run cross-post --source medium --post-url "https://medium.com/..."

# Monitor for new posts and auto-cross-post
pnpm run monitor

# Convert a Medium article to social posts
pnpm run medium-to-social --url "https://medium.com/..."

# Preview social posts without publishing
pnpm run preview --content "Your post text here"
```

## Brand Quick Reference

| Element | Value |
|---------|-------|
| Handle | @wonderwomancode |
| Primary Color | Hot Magenta `#E91E63` |
| Secondary Color | Electric Cyan `#00BCD4` |
| Accent Color | Golden Yellow `#FFD600` |
| Dark Color | Rich Black `#1A1A2E` |
| Light Color | Warm Cream `#FFF8F0` |
| AF Bridge Color | Electric Blue `#3D5AFE` |
| Primary Font | Instrument Sans |
| Display Font | Instrument Serif |
| Tone | Technical + Whimsical |

## Agent Definitions

Agents in `.claude/agents/` follow the same patterns as the AF admin marketing swarm:
- `personal-brand-guardian.md` - Voice consistency and brand integrity
- `content-adapter.md` - Adapts content across platforms
- `social-manager.md` - Manages social presence and engagement

## Important Notes

- Always maintain the bridge between personal and AF brand without making them identical
- The pop-art halftone aesthetic is the signature visual - never replace with generic stock imagery
- Whimsy is encouraged but must remain professional - think "conference keynote speaker who makes you smile"
- When in doubt about brand voice, read `brand-guide/voice-and-tone.md`
