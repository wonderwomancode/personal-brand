import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";

dotenvConfig({ path: resolve(import.meta.dirname, "../.env") });

function env(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
}

function envOptional(key: string): string | undefined {
  return process.env[key] || undefined;
}

export const config = {
  dryRun: process.env.DRY_RUN === "true",
  logLevel: process.env.LOG_LEVEL ?? "info",
  monitorInterval: parseInt(process.env.MONITOR_INTERVAL ?? "300", 10),

  twitter: {
    apiKey: envOptional("TWITTER_API_KEY"),
    apiSecret: envOptional("TWITTER_API_SECRET"),
    accessToken: envOptional("TWITTER_ACCESS_TOKEN"),
    accessSecret: envOptional("TWITTER_ACCESS_SECRET"),
    bearerToken: envOptional("TWITTER_BEARER_TOKEN"),
    get enabled() {
      return !!(this.apiKey && this.apiSecret && this.accessToken && this.accessSecret);
    },
  },

  linkedin: {
    accessToken: envOptional("LINKEDIN_ACCESS_TOKEN"),
    personUrn: envOptional("LINKEDIN_PERSON_URN"),
    get enabled() {
      return !!(this.accessToken && this.personUrn);
    },
  },

  facebook: {
    pageId: envOptional("FACEBOOK_PAGE_ID"),
    pageAccessToken: envOptional("FACEBOOK_PAGE_ACCESS_TOKEN"),
    get enabled() {
      return !!(this.pageId && this.pageAccessToken);
    },
  },

  instagram: {
    businessAccountId: envOptional("INSTAGRAM_BUSINESS_ACCOUNT_ID"),
    get accessToken() {
      return envOptional("FACEBOOK_PAGE_ACCESS_TOKEN");
    },
    get enabled() {
      return !!(this.businessAccountId && this.accessToken);
    },
  },

  bluesky: {
    handle: envOptional("BLUESKY_HANDLE"),
    appPassword: envOptional("BLUESKY_APP_PASSWORD"),
    get enabled() {
      return !!(this.handle && this.appPassword);
    },
  },

  mastodon: {
    instance: envOptional("MASTODON_INSTANCE"),
    accessToken: envOptional("MASTODON_ACCESS_TOKEN"),
    get enabled() {
      return !!(this.instance && this.accessToken);
    },
  },

  farcaster: {
    neynarApiKey: envOptional("NEYNAR_API_KEY"),
    signerUuid: envOptional("FARCASTER_SIGNER_UUID"),
    get enabled() {
      return !!(this.neynarApiKey && this.signerUuid);
    },
  },

  lens: {
    profileId: envOptional("LENS_PROFILE_ID"),
    accessToken: envOptional("LENS_ACCESS_TOKEN"),
    get enabled() {
      return !!(this.profileId && this.accessToken);
    },
  },

  medium: {
    username: process.env.MEDIUM_USERNAME ?? "wonderwomancode",
    integrationToken: envOptional("MEDIUM_INTEGRATION_TOKEN"),
  },

  threads: {
    userId: envOptional("THREADS_USER_ID"),
    accessToken: envOptional("THREADS_ACCESS_TOKEN"),
    get enabled() {
      return !!(this.userId && this.accessToken);
    },
  },

  reddit: {
    clientId: envOptional("REDDIT_CLIENT_ID"),
    clientSecret: envOptional("REDDIT_CLIENT_SECRET"),
    username: envOptional("REDDIT_USERNAME"),
    password: envOptional("REDDIT_PASSWORD"),
    get enabled() {
      return !!(this.clientId && this.clientSecret && this.username && this.password);
    },
  },

  tiktok: {
    accessToken: envOptional("TIKTOK_ACCESS_TOKEN"),
    openId: envOptional("TIKTOK_OPEN_ID"),
    get enabled() {
      return !!(this.accessToken && this.openId);
    },
  },
} as const;

export type Platform =
  | "twitter"
  | "linkedin"
  | "facebook"
  | "instagram"
  | "bluesky"
  | "mastodon"
  | "farcaster"
  | "lens"
  | "threads"
  | "reddit"
  | "tiktok";

export const PLATFORM_CHAR_LIMITS: Record<Platform, number> = {
  twitter: 280,
  linkedin: 3000,
  facebook: 63206,
  instagram: 2200,
  bluesky: 300,
  mastodon: 500,
  farcaster: 1024,
  lens: 5000,
  threads: 500,
  reddit: 40000,
  tiktok: 2200,
};

export function getEnabledPlatforms(): Platform[] {
  const platforms: Platform[] = [];
  if (config.twitter.enabled) platforms.push("twitter");
  if (config.linkedin.enabled) platforms.push("linkedin");
  if (config.facebook.enabled) platforms.push("facebook");
  if (config.instagram.enabled) platforms.push("instagram");
  if (config.bluesky.enabled) platforms.push("bluesky");
  if (config.mastodon.enabled) platforms.push("mastodon");
  if (config.farcaster.enabled) platforms.push("farcaster");
  if (config.lens.enabled) platforms.push("lens");
  if (config.threads.enabled) platforms.push("threads");
  if (config.reddit.enabled) platforms.push("reddit");
  if (config.tiktok.enabled) platforms.push("tiktok");
  return platforms;
}
