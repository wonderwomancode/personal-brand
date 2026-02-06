# Social MCP Integration Guide

> Detailed instructions for connecting each social platform for automated management.

---

## Platform API Credential Setup

### X/Twitter API

**Prerequisites**: Twitter Developer account with at least Basic tier ($100/month for posting)

1. Go to https://developer.x.com/en/portal/dashboard
2. Create a new Project and App
3. Under "User authentication settings":
   - Enable OAuth 1.0a
   - Set App permissions to **Read and Write**
   - Set callback URL to `http://localhost:3000/callback`
4. Under "Keys and tokens":
   - Copy **API Key and Secret** -> `TWITTER_API_KEY`, `TWITTER_API_SECRET`
   - Generate **Access Token and Secret** -> `TWITTER_ACCESS_TOKEN`, `TWITTER_ACCESS_SECRET`
   - Copy **Bearer Token** -> `TWITTER_BEARER_TOKEN`

**Note**: For production, use the `twitter-api-v2` npm package which handles OAuth 1.0a signing properly. The automation scripts include the structure but need this package for actual authenticated posting.

```bash
cd automation && pnpm add twitter-api-v2
```

---

### LinkedIn API

**Prerequisites**: LinkedIn Page admin access

1. Go to https://www.linkedin.com/developers/
2. Create a new app
3. Under Products, request access to:
   - **Share on LinkedIn** (for posting)
   - **Sign In with LinkedIn using OpenID Connect**
4. Under Auth:
   - Copy **Client ID** and **Client Secret**
   - Add redirect URL: `http://localhost:3000/callback`
5. Generate OAuth 2.0 token with `w_member_social` scope
6. Get your Person URN:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" https://api.linkedin.com/v2/userinfo
   ```
   Your URN is: `urn:li:person:YOUR_SUB_VALUE`

**Token refresh**: LinkedIn tokens expire in 60 days. Set a calendar reminder to refresh.

---

### Facebook / Instagram / Threads

**Prerequisites**: Facebook Page, Instagram Business account linked to Page

1. Go to https://developers.facebook.com/
2. Create a new app (Business type)
3. Add products: **Facebook Login**, **Instagram Graph API**, **Threads API**
4. Under Facebook Login settings, add `pages_manage_posts`, `instagram_basic`, `instagram_content_publish`
5. Generate a long-lived Page Access Token:
   ```bash
   # Step 1: Get user token from Graph API Explorer
   # Step 2: Exchange for long-lived token
   curl "https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=APP_ID&client_secret=APP_SECRET&fb_exchange_token=SHORT_TOKEN"
   # Step 3: Get page token
   curl "https://graph.facebook.com/v19.0/me/accounts?access_token=LONG_LIVED_USER_TOKEN"
   ```
6. Get Instagram Business Account ID:
   ```bash
   curl "https://graph.facebook.com/v19.0/PAGE_ID?fields=instagram_business_account&access_token=PAGE_TOKEN"
   ```

**For Threads**: Use the same token with the Threads API endpoints. Get your Threads user ID from the API.

---

### Bluesky (AT Protocol)

**Prerequisites**: Bluesky account

1. Log into Bluesky (bsky.app)
2. Go to Settings > App Passwords
3. Create a new app password
4. Set in `.env`:
   ```
   BLUESKY_HANDLE=wonderwomancode.bsky.social
   BLUESKY_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
   ```

That's it. Bluesky is the simplest to set up.

**Custom domain handle** (optional):
1. Go to Settings > Handle > "I have my own domain"
2. Add DNS TXT record: `_atproto.wonderwomancode.com` -> `did=did:plc:YOUR_DID`
3. Your handle becomes `@wonderwomancode.com`

---

### Mastodon

**Prerequisites**: Mastodon account (recommended: hachyderm.io)

1. Log into your Mastodon instance
2. Go to Preferences > Development > New Application
3. Set:
   - Application name: `wonderwomancode-automation`
   - Redirect URI: `urn:ietf:wg:oauth:2.0:oob`
   - Scopes: `read`, `write:statuses`, `write:media`
4. Submit and copy the **Access Token**
5. Set in `.env`:
   ```
   MASTODON_INSTANCE=https://hachyderm.io
   MASTODON_ACCESS_TOKEN=your_token_here
   ```

---

### Farcaster (via Neynar)

**Prerequisites**: Farcaster account, Neynar API key

1. Sign up at https://neynar.com/
2. Create a new app and get your API key
3. Create a signer (allows posting on your behalf):
   ```bash
   curl -X POST https://api.neynar.com/v2/farcaster/signer \
     -H "api_key: YOUR_API_KEY" \
     -H "Content-Type: application/json"
   ```
4. Approve the signer in Warpcast (scan QR code)
5. Set in `.env`:
   ```
   NEYNAR_API_KEY=your_api_key
   FARCASTER_SIGNER_UUID=your_signer_uuid
   ```

---

### Lens Protocol

**Prerequisites**: Lens profile, Ethereum wallet

Lens requires onchain transactions for posting. For automation:

1. **Option A: Lens Dispatcher** (gasless posting)
   - Enable dispatcher mode via Hey.xyz Settings
   - Use Lens SDK with dispatcher for signless posting

2. **Option B: Momoka** (L2 posting)
   - Posts to Lens DA layer (cheaper, no gas)
   - Requires wallet integration

3. **Option C: API with wallet signing**
   - Full control but requires wallet key management

**Recommended**: Start with Option A (dispatcher mode) and use the `@lens-protocol/client` SDK.

```bash
pnpm add @lens-protocol/client @lens-protocol/metadata
```

---

### Medium

**Prerequisites**: Medium account

Medium's API is read-only for most operations. For monitoring:

1. Get integration token: Medium > Settings > Security > Integration tokens
2. Or just use RSS: `https://medium.com/feed/@wonderwomancode`

The post monitor script uses RSS (more reliable than the API).

---

## Building a Custom Unified MCP Server

For a fully integrated experience, you can build a single MCP server that wraps all platforms.

### Architecture

```
Claude Code
    │
    ▼
┌─────────────────────┐
│  Social MCP Server   │
│  (Node.js + MCP SDK) │
├─────────────────────┤
│  Tools:              │
│  - post(platform,    │
│    content)          │
│  - cross_post(       │
│    content, opts)    │
│  - get_mentions()    │
│  - get_analytics()   │
│  - draft_reply(      │
│    platform, postId) │
│  - schedule_post(    │
│    content, time)    │
├─────────────────────┤
│  Platform Adapters:  │
│  ├── Twitter         │
│  ├── LinkedIn        │
│  ├── Bluesky         │
│  ├── Mastodon        │
│  ├── Farcaster       │
│  ├── Facebook        │
│  ├── Threads         │
│  └── Lens            │
└─────────────────────┘
```

### MCP Server Configuration

Add to `.claude/mcp.json`:
```json
{
  "mcpServers": {
    "social": {
      "command": "node",
      "args": ["path/to/social-mcp-server/dist/index.js"],
      "env": {
        "SOCIAL_CONFIG_PATH": "/path/to/personal-brand/automation/.env"
      }
    }
  }
}
```

### Implementation Skeleton

```typescript
// social-mcp-server/src/index.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "social-media",
  version: "1.0.0",
});

server.tool(
  "cross_post",
  "Cross-post content to multiple social platforms",
  {
    content: z.string().describe("The content to post"),
    platforms: z.array(z.string()).optional().describe("Target platforms (default: all)"),
    url: z.string().optional().describe("URL to include"),
    dryRun: z.boolean().optional().describe("Preview without posting"),
  },
  async ({ content, platforms, url, dryRun }) => {
    // Implementation: call the cross-post automation
    // ...
    return { content: [{ type: "text", text: "Posted successfully" }] };
  }
);

server.tool(
  "preview_post",
  "Preview how content will look on each platform",
  {
    content: z.string().describe("The content to preview"),
  },
  async ({ content }) => {
    // Implementation: call the preview tool
    // ...
    return { content: [{ type: "text", text: "Preview output" }] };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

This MCP server would let you say things like:
- "Cross-post my latest article to all platforms"
- "What are my recent mentions on Twitter and Bluesky?"
- "Draft a reply to that thread on Farcaster"
- "Preview this post for all platforms"
