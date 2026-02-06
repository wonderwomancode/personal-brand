#!/usr/bin/env tsx
/**
 * Cross-Post Script
 *
 * Takes content and posts it to all configured platforms with
 * platform-specific adaptation.
 *
 * Usage:
 *   pnpm run cross-post --text "Your post content here"
 *   pnpm run cross-post --text "..." --url "https://link.com" --platforms twitter,linkedin
 *   pnpm run cross-post --text "..." --hashtags "BuildInPublic,WebDev" --dry-run
 *   pnpm run cross-post --file ./post.md
 */

import { readFileSync } from "fs";
import { program } from "commander";
import { config, getEnabledPlatforms, type Platform } from "./config.js";
import { adaptContent, type SourceContent } from "./content-adapter.js";
import { postToAll } from "./platforms.js";

async function main() {
  program
    .name("cross-post")
    .description("Cross-post content to all configured social platforms")
    .option("--text <text>", "Text content to post")
    .option("--file <path>", "Read content from a file")
    .option("--title <title>", "Title (for article-style posts)")
    .option("--url <url>", "URL to include with the post")
    .option("--hashtags <tags>", "Comma-separated hashtags")
    .option("--platforms <platforms>", "Comma-separated target platforms (default: all enabled)")
    .option("--dry-run", "Preview posts without publishing")
    .option("--skip <platforms>", "Comma-separated platforms to skip")
    .parse();

  const opts = program.opts();

  if (opts.dryRun) {
    process.env.DRY_RUN = "true";
  }

  // Get content
  let text: string;
  if (opts.file) {
    text = readFileSync(opts.file, "utf-8");
  } else if (opts.text) {
    text = opts.text;
  } else {
    console.error("Error: Provide --text or --file");
    process.exit(1);
  }

  // Build source content
  const source: SourceContent = {
    text,
    title: opts.title,
    url: opts.url,
    hashtags: opts.hashtags?.split(",").map((h: string) => h.trim()),
  };

  // Determine platforms
  let platforms: Platform[];
  if (opts.platforms) {
    platforms = opts.platforms.split(",").map((p: string) => p.trim() as Platform);
  } else {
    platforms = getEnabledPlatforms();
  }

  // Apply skip filter
  if (opts.skip) {
    const skip = new Set(opts.skip.split(",").map((p: string) => p.trim()));
    platforms = platforms.filter((p) => !skip.has(p));
  }

  if (platforms.length === 0) {
    console.error("Error: No platforms configured or selected. Check your .env file.");
    process.exit(1);
  }

  console.log(`\nCross-posting to: ${platforms.join(", ")}\n`);

  // Adapt content
  const adapted = adaptContent(source, platforms);

  // Preview
  console.log("=== ADAPTED POSTS ===\n");
  for (const platform of platforms) {
    const content = adapted[platform];
    console.log(`--- ${platform.toUpperCase()} (${content.length} chars) ---`);
    console.log(content);
    console.log();
  }

  if (config.dryRun) {
    console.log("Dry run complete. Remove --dry-run to publish.\n");
    return;
  }

  // Confirm before posting
  console.log("Publishing in 3 seconds... (Ctrl+C to cancel)\n");
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Post
  const results = await postToAll(adapted, platforms, { url: source.url });

  // Report
  console.log("\n=== RESULTS ===\n");
  let successCount = 0;
  let failCount = 0;

  for (const result of results) {
    if (result.success) {
      successCount++;
      console.log(`  [OK]   ${result.platform}: ${result.postUrl ?? result.postId}`);
    } else {
      failCount++;
      console.log(`  [FAIL] ${result.platform}: ${result.error}`);
    }
  }

  console.log(`\nSummary: ${successCount} succeeded, ${failCount} failed\n`);
}

main().catch(console.error);
