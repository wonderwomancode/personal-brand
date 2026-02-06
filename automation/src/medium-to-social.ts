#!/usr/bin/env tsx
/**
 * Medium-to-Social Converter
 *
 * Takes a Medium article URL and converts it into adapted social posts
 * for all configured platforms.
 *
 * Usage:
 *   pnpm run medium-to-social --url "https://medium.com/@wonderwomancode/my-article"
 *   pnpm run medium-to-social --url "..." --platforms twitter,linkedin,bluesky
 *   pnpm run medium-to-social --url "..." --dry-run
 */

import { program } from "commander";
import Parser from "rss-parser";
import TurndownService from "turndown";
import { config, getEnabledPlatforms, type Platform } from "./config.js";
import { adaptContent, type SourceContent } from "./content-adapter.js";
import { postToAll } from "./platforms.js";

const parser = new Parser();
const turndown = new TurndownService();

interface MediumArticle {
  title: string;
  link: string;
  content: string;
  contentSnippet: string;
  pubDate: string;
  categories: string[];
}

async function fetchMediumArticle(articleUrl: string): Promise<MediumArticle> {
  // Medium's RSS feed for a user
  const username = config.medium.username;
  const feedUrl = `https://medium.com/feed/@${username}`;

  console.log(`Fetching RSS feed for @${username}...`);
  const feed = await parser.parseURL(feedUrl);

  // Find the article in the feed
  const article = feed.items.find(
    (item) => item.link === articleUrl || item.guid === articleUrl
  );

  if (!article) {
    // Try fetching the article directly via URL
    console.log("Article not found in RSS feed. Attempting direct fetch...");
    const response = await fetch(articleUrl);
    const html = await response.text();

    // Extract basic info from HTML
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const descMatch = html.match(/<meta name="description" content="(.*?)"/);

    return {
      title: titleMatch?.[1]?.replace(/ \| by .* \| .* \| Medium$/, "") ?? "Untitled",
      link: articleUrl,
      content: html,
      contentSnippet: descMatch?.[1] ?? "",
      pubDate: new Date().toISOString(),
      categories: [],
    };
  }

  return {
    title: article.title ?? "Untitled",
    link: article.link ?? articleUrl,
    content: article["content:encoded"] ?? article.content ?? "",
    contentSnippet: article.contentSnippet ?? "",
    pubDate: article.pubDate ?? new Date().toISOString(),
    categories: (article.categories ?? []) as string[],
  };
}

function articleToSource(article: MediumArticle): SourceContent {
  // Convert HTML content to plain text for summarization
  const markdown = turndown.turndown(article.content);

  // Extract first meaningful paragraph as summary
  const paragraphs = markdown
    .split("\n\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 50 && !p.startsWith("#") && !p.startsWith("!["));

  const summary = paragraphs[0] ?? article.contentSnippet;

  // Build hashtags from categories
  const hashtags = [
    "wonderwomancode",
    "BuildInPublic",
    ...article.categories.map((c) => c.replace(/\s+/g, "")),
  ];

  return {
    title: article.title,
    text: summary,
    url: article.link,
    summary: article.contentSnippet || summary.slice(0, 200),
    sourcePlatform: "medium",
    hashtags,
  };
}

function generateTwitterThread(article: MediumArticle): string[] {
  const markdown = turndown.turndown(article.content);
  const tweets: string[] = [];

  // Tweet 1: Hook
  tweets.push(`New post: ${article.title}\n\nThread with the key takeaways ->`);

  // Extract headers and their content for the thread
  const sections = markdown.split(/^## /m).filter((s) => s.trim());

  for (const section of sections.slice(0, 6)) {
    const lines = section.split("\n").filter((l) => l.trim());
    const header = lines[0]?.trim();
    const content = lines
      .slice(1)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (header && content) {
      const tweet = `${header}\n\n${content}`;
      tweets.push(tweet.length > 277 ? tweet.slice(0, 274) + "..." : tweet);
    }
  }

  // Final tweet: CTA
  tweets.push(
    `Full article: ${article.link}\n\nIf this was useful, follow along -- I write about building decentralized infrastructure and the real journey of a technical founder.\n\n#wonderwomancode #BuildInPublic`
  );

  return tweets;
}

async function main() {
  program
    .name("medium-to-social")
    .description("Convert a Medium article into platform-adapted social posts")
    .requiredOption("--url <url>", "Medium article URL")
    .option("--platforms <platforms>", "Comma-separated platforms (default: all enabled)")
    .option("--dry-run", "Preview posts without publishing")
    .option("--thread", "Generate a Twitter thread instead of single post")
    .parse();

  const opts = program.opts();

  if (opts.dryRun) {
    process.env.DRY_RUN = "true";
  }

  console.log(`\nFetching article: ${opts.url}\n`);

  const article = await fetchMediumArticle(opts.url);
  console.log(`Title: ${article.title}`);
  console.log(`Published: ${article.pubDate}\n`);

  const source = articleToSource(article);

  // Determine platforms
  let platforms: Platform[];
  if (opts.platforms) {
    platforms = opts.platforms.split(",").map((p: string) => p.trim() as Platform);
  } else {
    platforms = getEnabledPlatforms();
  }

  console.log(`Target platforms: ${platforms.join(", ")}\n`);

  // Generate thread if requested
  if (opts.thread) {
    console.log("=== TWITTER THREAD ===\n");
    const thread = generateTwitterThread(article);
    thread.forEach((tweet, i) => {
      console.log(`[${i + 1}/${thread.length}] ${tweet}\n`);
    });
    console.log("======================\n");
  }

  // Adapt content for each platform
  const adapted = adaptContent(source, platforms);

  // Preview
  console.log("=== ADAPTED POSTS ===\n");
  for (const [platform, content] of Object.entries(adapted)) {
    console.log(`--- ${platform.toUpperCase()} (${content.length} chars) ---`);
    console.log(content);
    console.log();
  }

  // Post
  if (config.dryRun) {
    console.log("Dry run complete. Set DRY_RUN=false to publish.\n");
    return;
  }

  console.log("Publishing to all platforms...\n");
  const results = await postToAll(adapted, platforms, { url: source.url });

  console.log("=== RESULTS ===\n");
  for (const result of results) {
    const status = result.success ? "OK" : "FAIL";
    console.log(`[${status}] ${result.platform}: ${result.postUrl ?? result.error ?? "Done"}`);
  }
}

main().catch(console.error);
