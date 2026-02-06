# Social Media Platform Specifications

> Image dimensions, character limits, and posting specs for all platforms.

---

## Profile Picture (Avatar) Dimensions

| Platform | Size (px) | Shape | Format | Notes |
|----------|-----------|-------|--------|-------|
| X/Twitter | 400x400 | Circle | JPG/PNG | Displays at 200x200 on profile |
| LinkedIn | 400x400 | Circle | JPG/PNG | Displays at various sizes |
| Facebook | 170x170 | Circle | JPG/PNG | Displays at 170x170 on desktop |
| Instagram | 320x320 | Circle | JPG/PNG | Displays at 110x110 |
| Bluesky | 1000x1000 | Circle | JPG/PNG | Square upload, displayed as circle |
| Mastodon | 400x400 | Circle/Rounded | JPG/PNG/GIF | Instance-dependent display |
| Farcaster | 400x400 | Circle | JPG/PNG | Via Warpcast |
| Lens Protocol | 400x400 | Circle | JPG/PNG | Via Hey.xyz or Orb |
| Medium | 500x500 | Circle | JPG/PNG | |
| Threads | 320x320 | Circle | JPG/PNG | Shared with Instagram |
| YouTube | 800x800 | Circle | JPG/PNG | Displays at 98x98 in comments |
| GitHub | 500x500 | Circle | JPG/PNG | Displays at various sizes |
| Dev.to | 400x400 | Circle | JPG/PNG | |

**Recommendation**: Export avatar at **1000x1000px** as PNG with transparent or white background. This single file works everywhere after platform-specific cropping.

---

## Header/Banner Dimensions

| Platform | Size (px) | Safe Zone | Notes |
|----------|-----------|-----------|-------|
| X/Twitter | 1500x500 | Center 60% | Mobile crops top/bottom significantly |
| LinkedIn | 1584x396 | Center 70% | Profile photo overlaps bottom-left |
| Facebook | 820x312 | Center 640x312 | Mobile displays at 640x360 |
| YouTube | 2560x1440 | 1546x423 center | Safe area for all devices |
| Bluesky | 3000x1000 | Center 60% | High-res recommended |
| Mastodon | 1500x500 | Center 60% | Instance-dependent |
| Threads | None | N/A | No header image |
| Farcaster | 1500x500 | Center 60% | Via Warpcast |
| GitHub | 1280x640 | Full | Social preview for repos |

---

## Character Limits

| Platform | Post Limit | Bio Limit | Notes |
|----------|-----------|-----------|-------|
| X/Twitter | 280 (free) / 25,000 (premium) | 160 | Threads unlimited |
| LinkedIn | 3,000 (post) / 120,000 (article) | 2,600 (summary) | First 140 chars visible |
| Facebook | 63,206 | 101 | First 477 chars before "See more" |
| Instagram | 2,200 | 150 | First 125 chars before "...more" |
| Bluesky | 300 | 256 | Threads supported |
| Mastodon | 500 (default) | 500 (bio) | Instance-configurable |
| Farcaster | 1024 | 256 | Casts |
| Lens Protocol | 5,000 | 256 | Posts/mirrors |
| Medium | No limit | 160 | Articles, no post limit |
| Threads | 500 | 150 | Shared with Instagram bio |
| YouTube | 5,000 (description) | 1,000 (about) | Titles: 100 chars |
| Dev.to | No limit | No limit | Markdown articles |

---

## Post Format Support

| Platform | Text | Images | Video | Links | Polls | Code |
|----------|------|--------|-------|-------|-------|------|
| X/Twitter | Y | 4 max | 140s free | Y (preview) | Y | N |
| LinkedIn | Y | 9 max (carousel) | 10min | Y (preview) | Y | N |
| Facebook | Y | Multi | Long | Y (preview) | Y | N |
| Instagram | Y | 10 carousel | 90s Reels | Stories only | Y (stories) | N |
| Bluesky | Y | 4 max | N (yet) | Y (card) | N | N |
| Mastodon | Y | 4 max | Varies | Y | Y | N |
| Farcaster | Y | 2 max | N | Y | Y (frames) | N |
| Lens Protocol | Y | Multi | Y | Y | N | N |
| Medium | Y | Multi | Embed | Y | N | Y (blocks) |
| Threads | Y | 10 carousel | 5min | Y | Y | N |
| YouTube | Y (desc) | Thumbnails | Primary | Y (desc) | Y (community) | N |
| Dev.to | Y | Multi | Embed | Y | N | Y (markdown) |

---

## Optimal Posting Times (EST)

| Platform | Best Times | Best Days | Avoid |
|----------|-----------|-----------|-------|
| X/Twitter | 9am, 12pm, 5pm | Tue-Thu | Late night, weekends |
| LinkedIn | 8am, 12pm, 5:30pm | Tue-Thu | Weekends, late night |
| Facebook | 9am, 1pm | Wed-Fri | Mondays, late night |
| Instagram | 11am, 2pm, 7pm | Tue, Wed | Sundays |
| Bluesky | 10am, 2pm | Tue-Thu | Weekends |
| Mastodon | 10am, 3pm | Mon-Fri | Weekends |
| Farcaster | 10am, 3pm | Tue-Thu | Weekends |
| Medium | Morning publish | Tue, Wed | Fri-Sun |
| Threads | 12pm, 6pm | Mon-Wed | Weekends |

**Note**: These are starting points. Track your own analytics and adjust.

---

## Link Behavior

| Platform | Link in Bio | Links in Posts | Link Preview |
|----------|------------|----------------|--------------|
| X/Twitter | 1 URL | Yes | Card preview |
| LinkedIn | Custom URL | Yes | Card preview |
| Facebook | Website field | Yes | Card preview |
| Instagram | 1 link (or Linktree) | No (stories with 10k+) | N/A |
| Bluesky | N/A | Yes | Card preview |
| Mastodon | Multiple fields | Yes | Card preview |
| Farcaster | N/A | Yes | Frame/card |
| Lens Protocol | N/A | Yes | Card preview |
| Medium | Profile URL | Yes | Embedded |
| Threads | 1 URL | Yes | No preview |

---

## Link in Bio Recommendation

Use a **Linktree alternative** or custom link page with these links:

1. alternatefutures.ai (AF main site)
2. Latest Medium article
3. GitHub profile
4. LinkedIn profile
5. Current project/campaign
6. Newsletter signup (if applicable)

**Recommended tool**: Build a custom one-page site on Alternate Clouds (dog-food your own product) at `wonderwomancode.alternatefutures.ai` or use `links.wonderwomancode.com` if you own the domain.
