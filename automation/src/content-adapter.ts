/**
 * Content Adapter
 *
 * Adapts a single piece of content for each platform, respecting
 * character limits, tone guidelines, and platform norms.
 */

import { type Platform, PLATFORM_CHAR_LIMITS } from "./config.js";

export interface SourceContent {
  /** The full text content */
  text: string;
  /** Title (for articles) */
  title?: string;
  /** URL to the original content */
  url?: string;
  /** Key takeaway or summary */
  summary?: string;
  /** Source platform where this was originally posted */
  sourcePlatform?: string;
  /** Hashtags to include */
  hashtags?: string[];
}

/**
 * Adapt content for all target platforms.
 *
 * This is a rule-based adapter. For more sophisticated adaptation,
 * pipe the content through an LLM (see the MCP setup guide for
 * using Claude as the adapter).
 */
export function adaptContent(
  source: SourceContent,
  targetPlatforms: Platform[]
): Record<Platform, string> {
  const adapted = {} as Record<Platform, string>;

  for (const platform of targetPlatforms) {
    adapted[platform] = adaptForPlatform(source, platform);
  }

  return adapted;
}

function adaptForPlatform(source: SourceContent, platform: Platform): string {
  const limit = PLATFORM_CHAR_LIMITS[platform];

  switch (platform) {
    case "twitter":
      return adaptForTwitter(source, limit);
    case "linkedin":
      return adaptForLinkedIn(source, limit);
    case "bluesky":
      return adaptForBluesky(source, limit);
    case "mastodon":
      return adaptForMastodon(source, limit);
    case "farcaster":
      return adaptForFarcaster(source, limit);
    case "facebook":
      return adaptForFacebook(source, limit);
    case "threads":
      return adaptForThreads(source, limit);
    case "lens":
      return adaptForLens(source, limit);
    case "instagram":
      return adaptForInstagram(source, limit);
    default:
      return truncateWithUrl(source.text, source.url, limit);
  }
}

function adaptForTwitter(source: SourceContent, limit: number): string {
  // Twitter: Punchy, direct, include URL, minimal hashtags
  const parts: string[] = [];

  if (source.title && source.summary) {
    parts.push(source.summary);
  } else if (source.title) {
    parts.push(source.title);
  } else {
    parts.push(source.text);
  }

  const hashtags = (source.hashtags ?? []).slice(0, 2);
  const hashtagStr = hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ");

  let post = parts.join("\n\n");

  // Reserve space for URL and hashtags
  const reserved = (source.url ? source.url.length + 2 : 0) + (hashtagStr ? hashtagStr.length + 2 : 0);
  const textLimit = limit - reserved;

  if (post.length > textLimit) {
    post = post.slice(0, textLimit - 3) + "...";
  }

  const finalParts = [post];
  if (source.url) finalParts.push(source.url);
  if (hashtagStr) finalParts.push(hashtagStr);

  return finalParts.join("\n\n");
}

function adaptForLinkedIn(source: SourceContent, limit: number): string {
  // LinkedIn: Professional framing, story-like, longer form, strategic line breaks
  const parts: string[] = [];

  if (source.title) {
    parts.push(source.title);
    parts.push("");
  }

  if (source.summary) {
    parts.push(source.summary);
    parts.push("");
  }

  // Use the full text but with line breaks for readability
  const text = source.text
    .split("\n")
    .map((line) => line.trim())
    .join("\n");
  parts.push(text);

  if (source.url) {
    parts.push("");
    parts.push(source.url);
  }

  const hashtags = (source.hashtags ?? []).slice(0, 5);
  if (hashtags.length > 0) {
    parts.push("");
    parts.push(hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" "));
  }

  let result = parts.join("\n");
  if (result.length > limit) {
    result = result.slice(0, limit - 3) + "...";
  }

  return result;
}

function adaptForBluesky(source: SourceContent, limit: number): string {
  // Bluesky: Conversational, shorter, no hashtags (they're not a thing yet)
  let post = source.summary ?? source.title ?? source.text;

  if (source.url) {
    const reserved = source.url.length + 2;
    if (post.length > limit - reserved) {
      post = post.slice(0, limit - reserved - 3) + "...";
    }
    post = `${post}\n\n${source.url}`;
  } else if (post.length > limit) {
    post = post.slice(0, limit - 3) + "...";
  }

  return post;
}

function adaptForMastodon(source: SourceContent, limit: number): string {
  // Mastodon: Include hashtags (important for discovery), alt text culture
  const parts: string[] = [];
  const text = source.summary ?? source.title ?? source.text;
  parts.push(text);

  if (source.url) {
    parts.push(source.url);
  }

  const hashtags = (source.hashtags ?? []).slice(0, 5);
  if (hashtags.length > 0) {
    parts.push(hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" "));
  }

  let result = parts.join("\n\n");
  if (result.length > limit) {
    // Trim text portion, keep URL and hashtags
    const urlLen = source.url ? source.url.length + 2 : 0;
    const hashLen = hashtags.length > 0 ? hashtags.join(" ").length + 2 : 0;
    const textLimit = limit - urlLen - hashLen - 3;
    const trimmedText = text.slice(0, textLimit) + "...";
    result = [trimmedText, source.url, hashtags.join(" ")].filter(Boolean).join("\n\n");
  }

  return result;
}

function adaptForFarcaster(source: SourceContent, limit: number): string {
  // Farcaster: Web3-native audience, technical, supports embeds
  let post = source.summary ?? source.title ?? source.text;

  if (source.url) {
    const reserved = source.url.length + 2;
    if (post.length > limit - reserved) {
      post = post.slice(0, limit - reserved - 3) + "...";
    }
    return `${post}\n\n${source.url}`;
  }

  return post.length > limit ? post.slice(0, limit - 3) + "..." : post;
}

function adaptForFacebook(source: SourceContent, limit: number): string {
  // Facebook: Narrative, warmer, fuller text
  const parts: string[] = [];

  if (source.title) {
    parts.push(source.title);
    parts.push("");
  }

  parts.push(source.text);

  if (source.url) {
    parts.push("");
    parts.push(source.url);
  }

  let result = parts.join("\n");
  if (result.length > limit) {
    result = result.slice(0, limit - 3) + "...";
  }

  return result;
}

function adaptForThreads(source: SourceContent, limit: number): string {
  // Threads: Casual, short, no hashtags needed
  let post = source.summary ?? source.title ?? source.text;

  // Make it more casual
  post = post.replace(/\.$/, "");

  if (source.url) {
    const reserved = source.url.length + 2;
    if (post.length > limit - reserved) {
      post = post.slice(0, limit - reserved - 3) + "...";
    }
    return `${post}\n\n${source.url}`;
  }

  return post.length > limit ? post.slice(0, limit - 3) + "..." : post;
}

function adaptForLens(source: SourceContent, limit: number): string {
  // Lens: Onchain-native, supports longer posts, technical
  const parts: string[] = [];

  if (source.title) {
    parts.push(source.title);
    parts.push("");
  }

  parts.push(source.text);

  if (source.url) {
    parts.push("");
    parts.push(source.url);
  }

  let result = parts.join("\n");
  if (result.length > limit) {
    result = result.slice(0, limit - 3) + "...";
  }

  return result;
}

function adaptForInstagram(source: SourceContent, limit: number): string {
  // Instagram: Caption for image post, hashtags in first comment
  const parts: string[] = [];

  if (source.title) {
    parts.push(source.title);
    parts.push("");
  }

  const text = source.summary ?? source.text;
  parts.push(text);

  // No URL in caption (Instagram doesn't make them clickable)
  // Hashtags go in first comment, not caption

  let result = parts.join("\n");
  if (result.length > limit) {
    result = result.slice(0, limit - 3) + "...";
  }

  return result;
}

function truncateWithUrl(text: string, url: string | undefined, limit: number): string {
  if (url) {
    const reserved = url.length + 2;
    const trimmed = text.length > limit - reserved ? text.slice(0, limit - reserved - 3) + "..." : text;
    return `${trimmed}\n\n${url}`;
  }
  return text.length > limit ? text.slice(0, limit - 3) + "..." : text;
}
