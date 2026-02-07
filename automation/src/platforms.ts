/**
 * Platform posting adapters.
 *
 * Each adapter handles authentication and posting for one platform.
 * All adapters follow the same interface: post(content, options) => result.
 */

import { config, type Platform, PLATFORM_CHAR_LIMITS } from "./config.js";
import { checkRateLimit, recordPost, rateLimitSummary } from "./rate-limiter.js";

export interface PostOptions {
  /** URL to link to (for platforms that support link previews) */
  url?: string;
  /** Image URLs or local paths to attach */
  images?: string[];
  /** Alt text for images */
  imageAlts?: string[];
  /** Hashtags to append (will be formatted per platform) */
  hashtags?: string[];
  /** Whether this is a thread/continuation */
  isThread?: boolean;
  /** Thread ID to reply to (for continuations) */
  threadId?: string;
}

export interface PostResult {
  platform: Platform;
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}

// ─── Adapters ────────────────────────────────────────

export async function postToTwitter(content: string, opts: PostOptions = {}): Promise<PostResult> {
  const { apiKey, apiSecret, accessToken, accessSecret } = config.twitter;
  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    return { platform: "twitter", success: false, error: "Twitter not configured" };
  }

  try {
    // Twitter API v2 - Create Tweet
    const url = "https://api.twitter.com/2/tweets";
    const body: Record<string, unknown> = { text: truncate(content, PLATFORM_CHAR_LIMITS.twitter) };

    if (opts.threadId) {
      body.reply = { in_reply_to_tweet_id: opts.threadId };
    }

    // OAuth 1.0a signing is complex -- in production use a library like 'twitter-api-v2'
    // This is the structure; you'll need the twitter-api-v2 package for proper OAuth
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.twitter.bearerToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = (await response.json()) as { data?: { id: string } };

    if (data.data?.id) {
      return {
        platform: "twitter",
        success: true,
        postId: data.data.id,
        postUrl: `https://x.com/wonderwomancode/status/${data.data.id}`,
      };
    }

    return { platform: "twitter", success: false, error: JSON.stringify(data) };
  } catch (err) {
    return { platform: "twitter", success: false, error: String(err) };
  }
}

export async function postToBluesky(content: string, opts: PostOptions = {}): Promise<PostResult> {
  if (!config.bluesky.enabled) {
    return { platform: "bluesky", success: false, error: "Bluesky not configured" };
  }

  try {
    const { BskyAgent } = await import("@atproto/api");
    const agent = new BskyAgent({ service: "https://bsky.social" });
    await agent.login({
      identifier: config.bluesky.handle!,
      password: config.bluesky.appPassword!,
    });

    const text = truncate(content, PLATFORM_CHAR_LIMITS.bluesky);

    // Detect URLs and create facets for link cards
    const facets = detectUrlFacets(text);

    const post: Record<string, unknown> = {
      $type: "app.bsky.feed.post",
      text,
      createdAt: new Date().toISOString(),
    };

    if (facets.length > 0) {
      post.facets = facets;
    }

    // Add link card if URL provided
    if (opts.url) {
      post.embed = {
        $type: "app.bsky.embed.external",
        external: {
          uri: opts.url,
          title: "",
          description: "",
        },
      };
    }

    const response = await agent.post(post as Parameters<typeof agent.post>[0]);

    return {
      platform: "bluesky",
      success: true,
      postId: response.uri,
      postUrl: `https://bsky.app/profile/${config.bluesky.handle}/post/${response.uri.split("/").pop()}`,
    };
  } catch (err) {
    return { platform: "bluesky", success: false, error: String(err) };
  }
}

export async function postToMastodon(content: string, opts: PostOptions = {}): Promise<PostResult> {
  if (!config.mastodon.enabled) {
    return { platform: "mastodon", success: false, error: "Mastodon not configured" };
  }

  try {
    const url = `${config.mastodon.instance}/api/v1/statuses`;
    const text = truncate(content, PLATFORM_CHAR_LIMITS.mastodon);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.mastodon.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: text }),
    });

    const data = (await response.json()) as { id?: string; url?: string; error?: string };

    if (data.id) {
      return {
        platform: "mastodon",
        success: true,
        postId: data.id,
        postUrl: data.url,
      };
    }

    return { platform: "mastodon", success: false, error: data.error ?? "Unknown error" };
  } catch (err) {
    return { platform: "mastodon", success: false, error: String(err) };
  }
}

export async function postToLinkedIn(content: string, opts: PostOptions = {}): Promise<PostResult> {
  if (!config.linkedin.enabled) {
    return { platform: "linkedin", success: false, error: "LinkedIn not configured" };
  }

  try {
    const url = "https://api.linkedin.com/v2/ugcPosts";
    const text = truncate(content, PLATFORM_CHAR_LIMITS.linkedin);

    const body = {
      author: config.linkedin.personUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text },
          shareMediaCategory: opts.url ? "ARTICLE" : "NONE",
          ...(opts.url
            ? {
                media: [
                  {
                    status: "READY",
                    originalUrl: opts.url,
                  },
                ],
              }
            : {}),
        },
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.linkedin.accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(body),
    });

    const data = (await response.json()) as { id?: string };

    if (data.id) {
      return { platform: "linkedin", success: true, postId: data.id };
    }

    return { platform: "linkedin", success: false, error: JSON.stringify(data) };
  } catch (err) {
    return { platform: "linkedin", success: false, error: String(err) };
  }
}

export async function postToFacebook(content: string, opts: PostOptions = {}): Promise<PostResult> {
  if (!config.facebook.enabled) {
    return { platform: "facebook", success: false, error: "Facebook not configured" };
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${config.facebook.pageId}/feed`;
    const params = new URLSearchParams({
      message: content,
      access_token: config.facebook.pageAccessToken!,
    });

    if (opts.url) {
      params.set("link", opts.url);
    }

    const response = await fetch(`${url}?${params}`, { method: "POST" });
    const data = (await response.json()) as { id?: string; error?: { message: string } };

    if (data.id) {
      return {
        platform: "facebook",
        success: true,
        postId: data.id,
        postUrl: `https://facebook.com/${data.id}`,
      };
    }

    return { platform: "facebook", success: false, error: data.error?.message ?? "Unknown error" };
  } catch (err) {
    return { platform: "facebook", success: false, error: String(err) };
  }
}

export async function postToFarcaster(content: string, opts: PostOptions = {}): Promise<PostResult> {
  if (!config.farcaster.enabled) {
    return { platform: "farcaster", success: false, error: "Farcaster not configured" };
  }

  try {
    const url = "https://api.neynar.com/v2/farcaster/cast";
    const text = truncate(content, PLATFORM_CHAR_LIMITS.farcaster);

    const body: Record<string, unknown> = {
      signer_uuid: config.farcaster.signerUuid,
      text,
    };

    if (opts.url) {
      body.embeds = [{ url: opts.url }];
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        accept: "application/json",
        api_key: config.farcaster.neynarApiKey!,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = (await response.json()) as { cast?: { hash: string } };

    if (data.cast?.hash) {
      return {
        platform: "farcaster",
        success: true,
        postId: data.cast.hash,
        postUrl: `https://warpcast.com/wonderwomancode/${data.cast.hash.slice(0, 10)}`,
      };
    }

    return { platform: "farcaster", success: false, error: JSON.stringify(data) };
  } catch (err) {
    return { platform: "farcaster", success: false, error: String(err) };
  }
}

export async function postToLens(content: string, opts: PostOptions = {}): Promise<PostResult> {
  if (!config.lens.enabled) {
    return { platform: "lens", success: false, error: "Lens not configured" };
  }

  try {
    // Lens API v2 - Create Post via GraphQL
    const url = "https://api-v2.lens.dev/";
    const text = truncate(content, PLATFORM_CHAR_LIMITS.lens);

    const mutation = `
      mutation CreateOnchainPostTypedData($request: OnchainPostRequest!) {
        createOnchainPostTypedData(request: $request) {
          id
          typedData {
            value {
              nonce
              deadline
            }
          }
        }
      }
    `;

    // Note: Full Lens posting requires wallet signing.
    // For automation, use Lens's dispatcher/signless mode or Momoka.
    // This is a simplified structure -- see Lens SDK docs for full implementation.

    return {
      platform: "lens",
      success: false,
      error: "Lens requires wallet signing. Use the Lens SDK with dispatcher mode for automation. See mcp-setup/social-mcp-guide.md",
    };
  } catch (err) {
    return { platform: "lens", success: false, error: String(err) };
  }
}

export async function postToThreads(content: string, opts: PostOptions = {}): Promise<PostResult> {
  if (!config.threads.enabled) {
    return { platform: "threads", success: false, error: "Threads not configured" };
  }

  try {
    // Step 1: Create media container
    const createUrl = `https://graph.threads.net/v1.0/${config.threads.userId}/threads`;
    const text = truncate(content, PLATFORM_CHAR_LIMITS.threads);

    const createParams = new URLSearchParams({
      media_type: "TEXT",
      text,
      access_token: config.threads.accessToken!,
    });

    const createResponse = await fetch(`${createUrl}?${createParams}`, { method: "POST" });
    const createData = (await createResponse.json()) as { id?: string };

    if (!createData.id) {
      return { platform: "threads", success: false, error: "Failed to create container" };
    }

    // Step 2: Publish
    const publishUrl = `https://graph.threads.net/v1.0/${config.threads.userId}/threads_publish`;
    const publishParams = new URLSearchParams({
      creation_id: createData.id,
      access_token: config.threads.accessToken!,
    });

    const publishResponse = await fetch(`${publishUrl}?${publishParams}`, { method: "POST" });
    const publishData = (await publishResponse.json()) as { id?: string };

    if (publishData.id) {
      return { platform: "threads", success: true, postId: publishData.id };
    }

    return { platform: "threads", success: false, error: JSON.stringify(publishData) };
  } catch (err) {
    return { platform: "threads", success: false, error: String(err) };
  }
}

export async function postToReddit(content: string, opts: PostOptions = {}): Promise<PostResult> {
  if (!config.reddit.enabled) {
    return { platform: "reddit", success: false, error: "Reddit not configured" };
  }

  try {
    // Step 1: Get OAuth token
    const authResponse = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${config.reddit.clientId}:${config.reddit.clientSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "password",
        username: config.reddit.username!,
        password: config.reddit.password!,
      }),
    });

    const authData = (await authResponse.json()) as { access_token?: string };
    if (!authData.access_token) {
      return { platform: "reddit", success: false, error: "Reddit auth failed" };
    }

    // Step 2: Submit post to user profile (u/wonderwomancode)
    const text = truncate(content, PLATFORM_CHAR_LIMITS.reddit);
    const submitBody: Record<string, string> = {
      api_type: "json",
      kind: opts.url ? "link" : "self",
      sr: `u_${config.reddit.username}`,
      title: text.split("\n")[0]?.slice(0, 300) ?? text.slice(0, 300),
    };

    if (opts.url) {
      submitBody.url = opts.url;
    } else {
      submitBody.text = text;
    }

    const response = await fetch("https://oauth.reddit.com/api/submit", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authData.access_token}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "wonderwomancode-automation/1.0",
      },
      body: new URLSearchParams(submitBody),
    });

    const data = (await response.json()) as { json?: { data?: { url?: string; id?: string } } };

    if (data.json?.data?.url) {
      return {
        platform: "reddit",
        success: true,
        postId: data.json.data.id,
        postUrl: data.json.data.url,
      };
    }

    return { platform: "reddit", success: false, error: JSON.stringify(data) };
  } catch (err) {
    return { platform: "reddit", success: false, error: String(err) };
  }
}

export async function postToTikTok(content: string, opts: PostOptions = {}): Promise<PostResult> {
  if (!config.tiktok.enabled) {
    return { platform: "tiktok", success: false, error: "TikTok not configured" };
  }

  // TikTok's Content Posting API is video-only.
  // Text posts are not supported via API.
  // For cross-posting, generate a video (e.g. text-on-brand-background)
  // or use TikTok's photo carousel feature.
  return {
    platform: "tiktok",
    success: false,
    error: "TikTok API requires video content. Use TikTok app directly for text posts, or generate a short video/carousel from your content first.",
  };
}

// ─── Helpers ─────────────────────────────────────────

function truncate(text: string, limit: number): string {
  if (text.length <= limit) return text;
  return text.slice(0, limit - 3) + "...";
}

interface Facet {
  index: { byteStart: number; byteEnd: number };
  features: Array<{ $type: string; uri: string }>;
}

function detectUrlFacets(text: string): Facet[] {
  const urlRegex = /https?:\/\/[^\s)]+/g;
  const facets: Facet[] = [];
  let match;
  const encoder = new TextEncoder();

  while ((match = urlRegex.exec(text)) !== null) {
    const beforeBytes = encoder.encode(text.slice(0, match.index));
    const matchBytes = encoder.encode(match[0]);
    facets.push({
      index: {
        byteStart: beforeBytes.length,
        byteEnd: beforeBytes.length + matchBytes.length,
      },
      features: [
        {
          $type: "app.bsky.richtext.facet#link",
          uri: match[0],
        },
      ],
    });
  }

  return facets;
}

// ─── Dispatcher ──────────────────────────────────────

const platformPosters: Record<Platform, (content: string, opts: PostOptions) => Promise<PostResult>> = {
  twitter: postToTwitter,
  linkedin: postToLinkedIn,
  facebook: postToFacebook,
  instagram: async (content, opts) => ({
    platform: "instagram" as const,
    success: false,
    error: "Instagram requires image posts via Meta Graph API. Use the graphics pipeline to create an image first.",
  }),
  bluesky: postToBluesky,
  mastodon: postToMastodon,
  farcaster: postToFarcaster,
  lens: postToLens,
  threads: postToThreads,
  reddit: postToReddit,
  tiktok: postToTikTok,
};

export async function postToAll(
  adaptedContent: Record<Platform, string>,
  platforms: Platform[],
  opts: PostOptions = {}
): Promise<PostResult[]> {
  if (config.dryRun) {
    console.log("\n=== DRY RUN - No posts will be published ===\n");
    for (const p of platforms) {
      console.log(`[${p.toUpperCase()}] ${adaptedContent[p] ?? "No content adapted"}\n`);
    }
    return platforms.map((p) => ({ platform: p, success: true, postId: "dry-run" }));
  }

  const results = await Promise.allSettled(
    platforms.map(async (platform) => {
      const content = adaptedContent[platform];
      if (!content) {
        return { platform, success: false, error: "No adapted content" } as PostResult;
      }

      // Check rate limits before posting
      const limit = checkRateLimit(platform);
      if (!limit.allowed) {
        return {
          platform,
          success: false,
          error: `Rate limit reached: ${limit.used}/${limit.limit} posts this month. Post manually instead.`,
        } as PostResult;
      }

      if (limit.remaining <= 10 && limit.remaining > 0) {
        console.log(`  [WARN] ${platform}: ${limit.remaining} posts remaining this month`);
      }

      const result = await platformPosters[platform](content, opts);

      // Track successful posts
      if (result.success) {
        recordPost(platform);
      }

      return result;
    })
  );

  return results.map((r) =>
    r.status === "fulfilled"
      ? r.value
      : { platform: "twitter" as Platform, success: false, error: String(r.reason) }
  );
}
