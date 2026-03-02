

## Plan: Vercel SPA Routing Fix + White-Label Cleanup + Production Optimization

### Problem Analysis

1. **SPA Routing on Vercel**: No `vercel.json` exists. Vercel serves 404 for any route other than `/` on refresh because it tries to find actual files. All routes need to rewrite to `index.html`.

2. **Lovable Branding**: Found in `index.html` (OG/Twitter meta tags reference `lovable.dev`), `vite.config.ts` (lovable-tagger plugin), and `package.json` (lovable-tagger dependency). The footer is clean (PropFirm Tracker branding only).

3. **Favicon**: Currently uses default `public/favicon.ico`. User hasn't provided a custom one, so will keep as-is but remove Lovable OG image references.

---

### 1. Create `vercel.json` for SPA Routing

Create a `vercel.json` at project root with rewrite rules so all routes fall back to `index.html`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This ensures `/dashboard`, `/firms`, `/approvals`, etc. all work on direct access and refresh.

---

### 2. Clean `index.html` Meta Tags

- Update `<meta property="og:title">` from `"prop-feed-pulse"` to `"PropFirm Payout Tracker"`
- Update `<meta property="og:description">` from `"Lovable Generated Project"` to match the existing `<meta name="description">` content
- Replace `og:image` URL from `lovable.dev/opengraph-image-p98pqg.png` to remove Lovable reference (set to empty or a placeholder)
- Replace `twitter:site` from `@lovable_dev` to `@PropFirmTracker` (or remove)
- Replace `twitter:image` similarly
- Keep existing `<title>` and `<meta name="description">` as they're already branded

---

### 3. Remove lovable-tagger from Production

- In `vite.config.ts`: The `componentTagger` only runs in development mode (already gated by `mode === "development"`), so it won't appear in production builds. No change needed here -- it's a dev-only tool.
- The `lovable-tagger` package is already in `devDependencies`, so it won't be in the production bundle.

---

### 4. Production Optimizations

- No unused dependencies that need removal (all are actively used by UI components)
- Auth session persistence is already handled via `localStorage` + `autoRefreshToken` in the Supabase client
- Environment variables use `VITE_` prefix correctly for Vite builds

---

### Files to Create/Modify

| File | Action |
|------|--------|
| `vercel.json` | **Create** -- SPA rewrite rules |
| `index.html` | **Modify** -- Remove Lovable branding from meta tags |

No UI or design changes. Only deployment config and metadata cleanup.

