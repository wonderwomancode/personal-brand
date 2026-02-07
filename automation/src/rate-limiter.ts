/**
 * Rate Limiter
 *
 * Tracks API usage per platform to stay within free tier limits.
 * Persists counts to disk so they survive restarts.
 *
 * Limits:
 *   - X/Twitter free tier: 50 posts per user per month
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import type { Platform } from "./config.js";

const USAGE_PATH = resolve(import.meta.dirname, "../.rate-usage.json");

interface MonthlyUsage {
  [platform: string]: {
    count: number;
    month: string; // "YYYY-MM"
  };
}

const PLATFORM_LIMITS: Partial<Record<Platform, number>> = {
  twitter: 50, // X free tier: 50 tweets/month per user
};

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function loadUsage(): MonthlyUsage {
  if (existsSync(USAGE_PATH)) {
    return JSON.parse(readFileSync(USAGE_PATH, "utf-8"));
  }
  return {};
}

function saveUsage(usage: MonthlyUsage): void {
  writeFileSync(USAGE_PATH, JSON.stringify(usage, null, 2));
}

/**
 * Check if posting to a platform is allowed within rate limits.
 * Returns { allowed, remaining, limit } or { allowed: true } if no limit.
 */
export function checkRateLimit(platform: Platform): {
  allowed: boolean;
  remaining: number;
  limit: number;
  used: number;
} {
  const limit = PLATFORM_LIMITS[platform];
  if (!limit) {
    return { allowed: true, remaining: Infinity, limit: Infinity, used: 0 };
  }

  const usage = loadUsage();
  const month = currentMonth();
  const entry = usage[platform];

  // Reset if new month
  if (!entry || entry.month !== month) {
    return { allowed: true, remaining: limit, limit, used: 0 };
  }

  const remaining = limit - entry.count;
  return {
    allowed: remaining > 0,
    remaining: Math.max(0, remaining),
    limit,
    used: entry.count,
  };
}

/**
 * Record a successful post, incrementing the counter.
 */
export function recordPost(platform: Platform): void {
  const limit = PLATFORM_LIMITS[platform];
  if (!limit) return;

  const usage = loadUsage();
  const month = currentMonth();

  if (!usage[platform] || usage[platform].month !== month) {
    usage[platform] = { count: 1, month };
  } else {
    usage[platform].count++;
  }

  saveUsage(usage);
}

/**
 * Get a summary of all rate-limited platforms.
 */
export function rateLimitSummary(): string {
  const lines: string[] = ["Platform Rate Limits:"];

  for (const [platform, limit] of Object.entries(PLATFORM_LIMITS)) {
    const { used, remaining } = checkRateLimit(platform as Platform);
    const bar = "█".repeat(used) + "░".repeat(remaining);
    lines.push(`  ${platform}: ${used}/${limit} used (${remaining} remaining) ${bar}`);
  }

  return lines.join("\n");
}
