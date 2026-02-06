# Graphics Specifications

> Complete specs for creating on-brand graphics across all platforms.

---

## Avatar Exports

Export the halftone pop-art portrait at these sizes:

| Export Name | Size | Format | Use |
|-------------|------|--------|-----|
| `avatar-1000.png` | 1000x1000 | PNG | Master / Bluesky |
| `avatar-800.png` | 800x800 | PNG | YouTube |
| `avatar-500.png` | 500x500 | PNG | Medium / GitHub |
| `avatar-400.png` | 400x400 | PNG | X / LinkedIn / Mastodon / Farcaster / Lens |
| `avatar-320.png` | 320x320 | PNG | Instagram / Threads |
| `avatar-170.png` | 170x170 | PNG | Facebook |
| `avatar-circle-1000.png` | 1000x1000 | PNG | Pre-cropped circular version |

**Export notes:**
- All exports should have white background (not transparent)
- Circle-cropped version useful for platforms that don't auto-crop
- Keep the original PDF as the master source file

---

## Header/Banner Designs

### Design Principles

All headers follow this structure:
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  [Halftone dot pattern background]                  │
│                                                     │
│          wonderwomancode                            │
│          [tagline in Instrument Serif Italic]       │
│                                                     │
│  [Star accents in brand colors]                     │
│  [Gradient: Magenta -> Yellow or Cyan -> Blue]      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Color Treatments

**Option A: Pop Gradient (Primary)**
- Background: `linear-gradient(135deg, #E91E63 0%, #FFD600 100%)`
- Text: White with subtle shadow
- Halftone overlay: White dots at 10% opacity
- Stars: White and Cyan

**Option B: Tech Gradient (For technical contexts)**
- Background: `linear-gradient(135deg, #00BCD4 0%, #3D5AFE 100%)`
- Text: White
- Halftone overlay: White dots at 8% opacity
- Stars: Yellow and Magenta

**Option C: Dark Mode**
- Background: `linear-gradient(135deg, #1A1A2E 0%, #3D5AFE 100%)`
- Text: White
- Halftone overlay: Magenta dots at 5% opacity
- Stars: Cyan and Yellow

### Platform-Specific Headers

See SVG templates in `templates/` directory.

| Platform | File | Size |
|----------|------|------|
| X/Twitter | `twitter-header.svg` | 1500x500 |
| LinkedIn | `linkedin-banner.svg` | 1584x396 |
| Facebook | `facebook-cover.svg` | 820x312 |
| YouTube | `youtube-banner.svg` | 2560x1440 |
| Bluesky | `bluesky-banner.svg` | 3000x1000 |
| Mastodon | `mastodon-header.svg` | 1500x500 |
| GitHub | `github-social.svg` | 1280x640 |

---

## Social Post Graphics

### Quote Card

```
Dimensions: 1080x1080 (Instagram) or 1200x675 (Twitter/LinkedIn)

┌────────────────────────────────────┐
│  [Solid brand color background]    │
│                                    │
│  "The quote text goes here         │
│   in Instrument Serif Italic"      │
│                                    │
│  — wonderwomancode                 │
│    CEO/CTO, Alternate Futures      │
│                                    │
│  [Small star accents in corners]   │
│  [Halftone dot texture overlay]    │
└────────────────────────────────────┘
```

**Colors by mood:**
- Inspirational: Pop Gradient background
- Technical: Rich Black background, Cyan text
- Announcement: Golden Yellow background, Black text

### Carousel Slide (Instagram)

```
Dimensions: 1080x1350 (4:5 ratio)

Slide 1 (Cover):
┌────────────────────────────────────┐
│                                    │
│  [Pop gradient background]         │
│                                    │
│     TITLE TEXT                     │
│     in Instrument Sans Bold        │
│                                    │
│     Subtitle in Serif Italic       │
│                                    │
│  @wonderwomancode                  │
│  [Star accents]                    │
└────────────────────────────────────┘

Slide 2-8 (Content):
┌────────────────────────────────────┐
│  [Warm Cream background #FFF8F0]   │
│                                    │
│  ## Section Title                  │
│  Instrument Sans SemiBold          │
│  Color: Rich Black                 │
│                                    │
│  Body text in Instrument Sans      │
│  Regular. Color: Rich Black.       │
│                                    │
│  [Code blocks in JetBrains Mono    │
│   on #1A1A2E background]           │
│                                    │
│  [Magenta accent line on left]     │
│  [Page number bottom right]        │
└────────────────────────────────────┘

Final Slide (CTA):
┌────────────────────────────────────┐
│  [Pop gradient background]         │
│                                    │
│     Follow for more                │
│     @wonderwomancode               │
│                                    │
│     [Star accents]                 │
│     alternatefutures.ai            │
└────────────────────────────────────┘
```

### Announcement Graphic

```
Dimensions: 1200x675 (landscape) or 1080x1080 (square)

┌────────────────────────────────────┐
│                                    │
│  [Dark gradient background]        │
│                                    │
│  NEW: Feature Name                 │
│  Instrument Sans Bold, White       │
│                                    │
│  Brief description                 │
│  Instrument Sans Regular, #B2EBF2  │
│                                    │
│  [Comic burst shape in Yellow      │
│   with "NEW!" or "SHIPPED!"]       │
│                                    │
│  @wonderwomancode                  │
│  @AlternateFutures                 │
└────────────────────────────────────┘
```

---

## Video Thumbnails

```
Dimensions: 1280x720

┌──────────────────────────────────────┐
│                                      │
│  [3-5 WORD TITLE]    [Face/reaction] │
│  Instrument Sans      photo with     │
│  Bold, 80-100px      pop-art filter  │
│  White with black                    │
│  outline/shadow      [Halftone       │
│                       overlay]       │
│  [Brand color bar                    │
│   at bottom: 6px]                    │
└──────────────────────────────────────┘
```

**Rules:**
- Max 5 words on thumbnail
- Face should show expression/reaction
- Apply halftone dot filter to face photo for brand consistency
- Use brand colors for background gradient
- High contrast: readable at 120x67px (search result size)

---

## Halftone Dot Pattern (CSS/SVG)

### CSS Background Pattern
```css
.halftone-bg {
  background-image:
    radial-gradient(circle, #E91E63 1px, transparent 1px),
    radial-gradient(circle, #00BCD4 1px, transparent 1px);
  background-size: 20px 20px;
  background-position: 0 0, 10px 10px;
  opacity: 0.1;
}
```

### SVG Pattern Definition
```svg
<pattern id="halftone" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
  <circle cx="5" cy="5" r="1.5" fill="#E91E63" opacity="0.15"/>
</pattern>
```

### Ben-Day Dots (Comic Book Style)
```css
.benday-dots {
  background-image: radial-gradient(#E91E63 20%, transparent 20%);
  background-size: 8px 8px;
}
```

---

## Design Tools Recommendations

| Tool | Use Case | Notes |
|------|----------|-------|
| **Figma** | Headers, social graphics, templates | Primary design tool, share with collaborators |
| **Canva** | Quick social posts, stories | Use brand kit feature for consistency |
| **CSS/SVG** | Programmatic graphics generation | For automated/agent-created graphics |
| **Sharp (Node.js)** | Image processing in scripts | For automation pipeline |
| **GIMP** | Halftone filter on photos | For extending the pop-art treatment |

---

## Design Token Reference (CSS Variables)

```css
:root {
  /* Personal Brand Colors */
  --wwc-magenta: #E91E63;
  --wwc-cyan: #00BCD4;
  --wwc-yellow: #FFD600;
  --wwc-black: #1A1A2E;
  --wwc-cream: #FFF8F0;
  --wwc-soft-magenta: #F8BBD0;
  --wwc-light-cyan: #B2EBF2;
  --wwc-bridge-blue: #3D5AFE;

  /* AF Brand Colors (reference only) */
  --af-brand-blue: #000AFF;
  --af-dark-blue: #0000AF;
  --af-cream: #F9F5EE;
  --af-terracotta: #BE4200;

  /* Typography */
  --font-primary: 'Instrument Sans', system-ui, sans-serif;
  --font-display: 'Instrument Serif', Georgia, serif;
  --font-code: 'JetBrains Mono', monospace;

  /* Gradients */
  --gradient-pop: linear-gradient(135deg, #E91E63 0%, #FFD600 100%);
  --gradient-tech: linear-gradient(135deg, #00BCD4 0%, #3D5AFE 100%);
  --gradient-dark: linear-gradient(135deg, #1A1A2E 0%, #3D5AFE 100%);
  --gradient-warm: linear-gradient(135deg, #FFD600 0%, #E91E63 100%);
}
```
