#!/usr/bin/env tsx
/**
 * Preview Tool
 *
 * Preview how content will look on each platform without posting.
 * Useful for reviewing adapted content before cross-posting.
 *
 * Usage:
 *   pnpm run preview --content "Your post content here"
 *   pnpm run preview --content "..." --url "https://link.com"
 *   pnpm run preview --file ./post.md
 */

import { readFileSync } from "fs";
import { program } from "commander";
import { PLATFORM_CHAR_LIMITS, type Platform } from "./config.js";
import { adaptContent, type SourceContent } from "./content-adapter.js";
import { checkRateLimit, rateLimitSummary } from "./rate-limiter.js";

const ALL_PLATFORMS: Platform[] = [
  "twitter",
  "linkedin",
  "bluesky",
  "mastodon",
  "farcaster",
  "facebook",
  "threads",
  "lens",
  "instagram",
];

function main() {
  program
    .name("preview")
    .description("Preview how content will appear on each platform")
    .option("--content <text>", "Text content to preview")
    .option("--file <path>", "Read content from a file")
    .option("--title <title>", "Title for the post")
    .option("--url <url>", "URL to include")
    .option("--hashtags <tags>", "Comma-separated hashtags")
    .option("--platforms <platforms>", "Comma-separated platforms (default: all)")
    .parse();

  const opts = program.opts();

  let text: string;
  if (opts.file) {
    text = readFileSync(opts.file, "utf-8");
  } else if (opts.content) {
    text = opts.content;
  } else {
    console.error("Error: Provide --content or --file");
    process.exit(1);
  }

  const source: SourceContent = {
    text,
    title: opts.title,
    url: opts.url,
    hashtags: opts.hashtags?.split(",").map((h: string) => h.trim()),
  };

  const platforms: Platform[] = opts.platforms
    ? opts.platforms.split(",").map((p: string) => p.trim() as Platform)
    : ALL_PLATFORMS;

  const adapted = adaptContent(source, platforms);

  console.log("\n" + "=".repeat(60));
  console.log("  CONTENT PREVIEW - All Platforms");
  console.log("=".repeat(60) + "\n");

  for (const platform of platforms) {
    const content = adapted[platform];
    const limit = PLATFORM_CHAR_LIMITS[platform];
    const usage = Math.round((content.length / limit) * 100);
    const status = content.length <= limit ? "OK" : "OVER LIMIT";

    const rate = checkRateLimit(platform);
    const rateStr = rate.limit === Infinity ? "" : ` | API: ${rate.used}/${rate.limit} this month`;
    const rateWarn = rate.allowed ? "" : " [RATE LIMIT HIT - post manually]";

    console.log(`--- ${platform.toUpperCase()} (${content.length}/${limit} chars, ${usage}%) [${status}]${rateStr}${rateWarn} ---`);
    console.log();
    console.log(content);
    console.log();
    console.log("-".repeat(60));
    console.log();
  }

  // Show rate limit summary
  console.log(rateLimitSummary());
  console.log();
}

main();
