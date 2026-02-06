#!/usr/bin/env tsx
/**
 * Post Monitor
 *
 * Continuously monitors your Medium RSS feed and configured platforms
 * for new posts, then cross-posts them to all other platforms.
 *
 * Usage:
 *   pnpm run monitor                    # Start monitoring
 *   pnpm run monitor --interval 600     # Check every 10 minutes
 *   pnpm run monitor --dry-run          # Preview without posting
 *
 * How it works:
 *   1. Polls Medium RSS feed at configured interval
 *   2. Detects new articles not seen before
 *   3. Adapts content for each platform
 *   4. Cross-posts to all configured platforms
 *   5. Logs results and updates the seen-posts registry
 *
 * The registry file (.post-registry.json) tracks which posts have
 * been cross-posted to avoid duplicates.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import { program } from "commander";
import Parser from "rss-parser";
import { config, getEnabledPlatforms } from "./config.js";
import { adaptContent, type SourceContent } from "./content-adapter.js";
import { postToAll, type PostResult } from "./platforms.js";

const parser = new Parser();
const REGISTRY_PATH = resolve(import.meta.dirname, "../.post-registry.json");

interface PostRegistry {
  posts: Record<string, {
    url: string;
    title: string;
    crossPostedAt: string;
    platforms: string[];
    results: PostResult[];
  }>;
  lastChecked: string;
}

function loadRegistry(): PostRegistry {
  if (existsSync(REGISTRY_PATH)) {
    return JSON.parse(readFileSync(REGISTRY_PATH, "utf-8"));
  }
  return { posts: {}, lastChecked: new Date().toISOString() };
}

function saveRegistry(registry: PostRegistry): void {
  writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
}

async function checkMediumFeed(registry: PostRegistry): Promise<void> {
  const username = config.medium.username;
  const feedUrl = `https://medium.com/feed/@${username}`;

  console.log(`[${new Date().toISOString()}] Checking Medium feed for @${username}...`);

  try {
    const feed = await parser.parseURL(feedUrl);

    for (const item of feed.items) {
      const url = item.link ?? item.guid;
      if (!url) continue;

      // Skip if already cross-posted
      if (registry.posts[url]) {
        continue;
      }

      console.log(`\nNew article detected: ${item.title}`);
      console.log(`URL: ${url}`);
      console.log(`Published: ${item.pubDate}`);

      // Build source content
      const source: SourceContent = {
        title: item.title ?? "Untitled",
        text: item.contentSnippet ?? "",
        url,
        summary: item.contentSnippet?.slice(0, 200),
        sourcePlatform: "medium",
        hashtags: [
          "wonderwomancode",
          "BuildInPublic",
          ...((item.categories ?? []) as string[]).map((c) => c.replace(/\s+/g, "")),
        ],
      };

      // Get enabled platforms
      const platforms = getEnabledPlatforms();

      if (platforms.length === 0) {
        console.log("No platforms configured. Skipping cross-post.");
        continue;
      }

      // Adapt and post
      const adapted = adaptContent(source, platforms);

      console.log(`\nCross-posting to: ${platforms.join(", ")}`);

      if (config.dryRun) {
        console.log("\n--- DRY RUN ---");
        for (const [platform, content] of Object.entries(adapted)) {
          console.log(`[${platform}] ${content.slice(0, 100)}...`);
        }
      }

      const results = await postToAll(adapted, platforms, { url });

      // Log results
      for (const result of results) {
        const status = result.success ? "OK" : "FAIL";
        console.log(`  [${status}] ${result.platform}: ${result.postUrl ?? result.error ?? "Done"}`);
      }

      // Register
      registry.posts[url] = {
        url,
        title: source.title ?? "Untitled",
        crossPostedAt: new Date().toISOString(),
        platforms: platforms,
        results,
      };

      saveRegistry(registry);
    }
  } catch (err) {
    console.error(`Error checking feed: ${err}`);
  }

  registry.lastChecked = new Date().toISOString();
  saveRegistry(registry);
}

async function main() {
  program
    .name("post-monitor")
    .description("Monitor for new posts and auto-cross-post")
    .option("--interval <seconds>", "Check interval in seconds", String(config.monitorInterval))
    .option("--dry-run", "Preview without posting")
    .option("--once", "Check once and exit (don't loop)")
    .parse();

  const opts = program.opts();
  const interval = parseInt(opts.interval, 10) * 1000;

  if (opts.dryRun) {
    process.env.DRY_RUN = "true";
  }

  console.log("=== Post Monitor ===");
  console.log(`Medium user: @${config.medium.username}`);
  console.log(`Check interval: ${interval / 1000}s`);
  console.log(`Enabled platforms: ${getEnabledPlatforms().join(", ") || "none"}`);
  console.log(`Dry run: ${config.dryRun}`);
  console.log(`Registry: ${REGISTRY_PATH}`);
  console.log("====================\n");

  const registry = loadRegistry();

  // Initial check
  await checkMediumFeed(registry);

  if (opts.once) {
    console.log("\n--once flag set. Exiting.");
    return;
  }

  // Continuous monitoring
  console.log(`\nMonitoring... (checking every ${interval / 1000}s, Ctrl+C to stop)\n`);

  const loop = setInterval(async () => {
    await checkMediumFeed(registry);
  }, interval);

  // Graceful shutdown
  process.on("SIGINT", () => {
    console.log("\nShutting down monitor...");
    clearInterval(loop);
    saveRegistry(registry);
    process.exit(0);
  });
}

main().catch(console.error);
