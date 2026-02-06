# @wonderwomancode Personal Brand System

A comprehensive personal brand management system for **@wonderwomancode** (CEO/CTO & Co-founder of [Alternate Futures](https://alternatefutures.ai)).

This repo contains everything needed to maintain a consistent, professional, and whimsical personal brand across 13+ social platforms -- including brand guidelines, social media profiles, cross-posting automation, graphics templates, and AI agent definitions.

## What's Inside

### Brand Guide (`brand-guide/`)
- **[Brand Guide](brand-guide/brand-guide.md)** - Complete identity: colors, typography, visual elements, content pillars
- **[Voice & Tone](brand-guide/voice-and-tone.md)** - How to sound on every platform and in every context
- **[AF Brand Bridge](brand-guide/af-brand-bridge.md)** - How personal brand connects to Alternate Futures

### Social Media Profiles (`social-media/`)
- **[Platform Specs](social-media/platform-specs.md)** - Dimensions, character limits, posting specs for all platforms
- **Platform profiles** with bio copy, content strategy, and posting guidelines for:
  - X/Twitter, LinkedIn, Bluesky, Farcaster, Lens Protocol
  - Instagram, Facebook, Threads, Mastodon
  - Medium, YouTube, GitHub, Dev.to

### Automation (`automation/`)
- **Cross-poster** - Post to all platforms with automatic content adaptation
- **Medium-to-social converter** - Turn articles into platform-optimized social posts
- **Post monitor** - Auto-detect new Medium articles and cross-post them
- **Preview tool** - See how content looks on each platform before posting

### Graphics (`graphics/`)
- **[Specifications](graphics/specifications.md)** - Complete graphic specs for all platforms
- **SVG header templates** for X/Twitter, LinkedIn, Facebook, YouTube

### MCP Setup (`mcp-setup/`)
- **[Setup Guide](mcp-setup/README.md)** - How to connect AI agents to social platforms
- **[Social MCP Guide](mcp-setup/social-mcp-guide.md)** - API credential setup for every platform

### AI Agents (`.claude/agents/`)
- **Personal Brand Guardian** - Voice consistency and brand integrity
- **Content Adapter** - Platform-specific content transformation
- **Social Manager** - Engagement strategy and content calendar

## Quick Start

### 1. Set Up Automation
```bash
cd automation
cp .env.example .env
# Edit .env with your platform API credentials
pnpm install
```

### 2. Preview a Post
```bash
pnpm run preview --content "Your post content here" --url "https://your-link.com"
```

### 3. Cross-Post
```bash
# Dry run first
pnpm run cross-post --text "Your post" --dry-run

# Post for real
pnpm run cross-post --text "Your post" --url "https://link.com"
```

### 4. Convert Medium Article
```bash
pnpm run medium-to-social --url "https://medium.com/@wonderwomancode/article" --dry-run
```

### 5. Start Post Monitor
```bash
pnpm run monitor  # Watches for new Medium articles and auto-cross-posts
```

## Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Hot Magenta | `#E91E63` | Primary brand color |
| Electric Cyan | `#00BCD4` | Secondary / technical |
| Golden Yellow | `#FFD600` | Accent / energy |
| Rich Black | `#1A1A2E` | Dark backgrounds / text |
| Warm Cream | `#FFF8F0` | Light backgrounds |
| Electric Blue | `#3D5AFE` | AF brand bridge |

## Platforms

| Platform | Handle | Status |
|----------|--------|--------|
| X/Twitter | @wonderwomancode | Active |
| LinkedIn | /in/wonderwomancode | Active |
| Bluesky | @wonderwomancode.bsky.social | Active |
| Instagram | @wonderwomancode | Active |
| Facebook | wonderwomancode | Active |
| Mastodon | @wonderwomancode@hachyderm.io | Active |
| Farcaster | @wonderwomancode | Active |
| Lens Protocol | @wonderwomancode.lens | Active |
| Medium | @wonderwomancode | Active |
| Threads | @wonderwomancode | Active |
| YouTube | @wonderwomancode | Active |
| GitHub | wonderwomancode | Active |
| Dev.to | @wonderwomancode | Active |

## Using with Claude Code

This repo includes agent definitions that work with Claude Code's agent system. From within this project:

```bash
# Review a draft post for brand compliance
# Use the personal-brand-guardian agent

# Adapt content for all platforms
# Use the content-adapter agent

# Plan this week's social calendar
# Use the social-manager agent
```

---

*Code is my superpower.*
