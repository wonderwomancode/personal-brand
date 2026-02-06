# MCP Setup for Social Media Automation

> How to connect AI agents to manage your social media presence via Model Context Protocol (MCP) servers.

---

## Overview

MCP (Model Context Protocol) allows Claude Code and other AI tools to interact with external services. For social media management, there are two approaches:

1. **MCP Servers** - Connect Claude Code directly to social platforms
2. **Automation Scripts** - The TypeScript scripts in `../automation/` (can be triggered by Claude)
3. **Hybrid** - Use MCP for reading/monitoring, scripts for posting

---

## Available MCP Approaches

### Option 1: Claude Code + Automation Scripts (Recommended Start)

The simplest path. Claude Code runs your automation scripts via Bash.

**Setup:**
1. Configure `.env` in the `automation/` directory (see `.env.example`)
2. Install dependencies: `cd automation && pnpm install`
3. Claude Code can then run scripts directly:

```
> Cross-post this to all platforms: "Just shipped custom domains on Alternate Clouds..."
> [Claude runs: pnpm run cross-post --text "..." --dry-run]
> [Claude reviews output, then runs without --dry-run]
```

**Pros**: Simple, works today, full control
**Cons**: Manual trigger (you ask Claude to post)

### Option 2: Community MCP Social Servers

Several community-built MCP servers exist for social platforms:

| Platform | MCP Server | Status | Notes |
|----------|-----------|--------|-------|
| **X/Twitter** | `@mcp/twitter` | Community | Read/write tweets via API v2 |
| **Bluesky** | `@mcp/bluesky` | Community | Full AT Protocol access |
| **Mastodon** | `@mcp/mastodon` | Community | Read/write toots |
| **GitHub** | `@modelcontextprotocol/server-github` | Official | Already configured in your setup |
| **LinkedIn** | None yet | - | Use automation scripts |
| **Facebook** | None yet | - | Use automation scripts |
| **Farcaster** | Community | Experimental | Via Neynar API |

**Setup (example for Bluesky):**

Add to `.claude/mcp.json`:
```json
{
  "mcpServers": {
    "bluesky": {
      "command": "npx",
      "args": ["@mcp/bluesky"],
      "env": {
        "BLUESKY_HANDLE": "wonderwomancode.bsky.social",
        "BLUESKY_APP_PASSWORD": "your-app-password"
      }
    }
  }
}
```

### Option 3: Custom MCP Server (Advanced)

Build a unified social media MCP server that wraps all platform APIs.

See `social-mcp-guide.md` for the full implementation guide.

---

## Recommended Setup Path

### Phase 1: Manual with Scripts
1. Set up `.env` with platform credentials
2. Use `pnpm run preview` to test content adaptation
3. Use `pnpm run cross-post` to post (Claude can run this)
4. Use `pnpm run medium-to-social` when you publish articles

### Phase 2: Semi-Automated
1. Start the post monitor: `pnpm run monitor`
2. New Medium articles auto-cross-post
3. Use Claude Code for ad-hoc cross-posting

### Phase 3: Full MCP Integration
1. Set up community MCP servers for supported platforms
2. Build custom MCP server for unified access
3. Claude can read mentions, draft replies, and manage presence

---

## Platform API Setup Instructions

See `social-mcp-guide.md` for detailed instructions on getting API credentials for each platform.

---

## Manual Update Instructions

If you prefer to update profiles manually (without automation):

### Avatar Update
1. Export avatar at required sizes (see `graphics/specifications.md`)
2. Upload to each platform's profile settings
3. Platforms: Settings > Profile > Change Photo

### Header/Banner Update
1. Export SVG templates as PNG (open in browser, screenshot, or use Figma)
2. Upload to each platform's profile settings
3. Reference `social-media/platform-specs.md` for exact dimensions

### Bio Update
1. Copy bio text from the relevant profile file in `social-media/profiles/`
2. Paste into each platform's bio/about field
3. Adjust formatting for platform-specific line break support

### Link in Bio Update
1. Update your Linktree or custom link page
2. Ensure the link is set in:
   - X/Twitter: Edit Profile > Website
   - Instagram: Edit Profile > Website
   - LinkedIn: Contact Info > Website
   - Bluesky: Edit Profile (no link field yet, put in bio)
   - GitHub: Profile > Website
