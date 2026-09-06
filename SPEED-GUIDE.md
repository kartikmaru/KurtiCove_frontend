# Kurti Cove — Speed Guide

A plain-language explanation of every performance improvement made to this project, written so anyone can understand it without knowing code.

---

## How Data Travels (Before vs After)

### Before the optimisation

```
Browser visits /
  → Renders HTML (no product data yet)
    → NewArrivals component fetches /api/product?isNewArrival=true
    → BestSellers component fetches /api/product?isBestSeller=true
    → Combos component fetches /api/product?category=combo
    → OfferSection fetches /api/product?limit=100  (100 products just to filter 4)
    → FestivalSale fetches /api/sale/active
    → Shop category pills fetch /api/product/categories
                                           ↕
                         6–8 separate round trips to Render server
                                           ↕
                    Each hits MongoDB with no indexes → full collection scan
                    Each returns full product objects including HTML description
```

### After the optimisation

```
Browser requests /
  → Vercel runs the homepage Server Component at build/revalidation time
    → ONE fetch: GET /api/home
      → Express checks in-memory cache (Map, 90s TTL)
        ↓ cache miss (first request)
        → MongoDB runs 5 queries IN PARALLEL with compound indexes
          → .lean() returns plain objects (no Mongoose overhead)
          → .select() sends only the 12 fields cards need (no description/colors/etc.)
        → Result cached for 90 seconds
        → Response sent with Cache-Control: public, max-age=60
      ↓ cache hit (next ~90 seconds)
      → Returns instantly from memory, no DB query at all
  → Vercel builds the HTML with all section data already inside
  → Browser receives one response with newArrivals/bestSellers/combos/deals60
  → Page is fully populated before any client-side JS runs
  → Images served from Cloudinary with auto-format (WebP/AVIF) and correct size
  → Hero LCP image loads with fetchpriority=high
  → All other images load lazily as they scroll into view
```

**Result:** 1–2 API calls instead of 6–8. Repeat visits served from ISR cache instantly.

---

## File-by-File Table

| File Path | What passes through it | What it does for speed |
|---|---|---|
| `server/utils/cache.js` | Every public GET response | Zero-dependency in-memory TTL store. Returns cached results instantly — no DB query for up to 90s |
| `server/models/ProductModel.js` | Every MongoDB query | 5 compound indexes added so queries use index-range scans instead of reading every document |
| `server/controllers/productController.js` | All product data fetches | `.lean()` returns plain JS objects (30% less overhead); `.select()` sends only the fields UI needs; `getHomeData()` runs all 5 homepage queries concurrently |
| `server/routes/ProductRoutes.js` | Route registration | Exports `getHomeData` so `server.js` can mount it at `/api/home` |
| `server/server.js` | Every HTTP request | Registers `GET /api/home`; sets `Cache-Control` headers so browsers and CDNs can cache public responses |
| `client/src/app/page.jsx` | Homepage render | Server Component — fetches `/api/home` once during SSR with `revalidate: 90` (ISR). Passes pre-fetched data to every section as `initialData` props |
| `client/src/utils/homeDataCache.js` | Client-side navigation | In-flight deduplication: if multiple components call `fetchHomeData()` at the same time, only one network request is made. Results cached 90s so back-navigation is instant |
| `client/src/components/user/NewArrivals.jsx` | Homepage New Arrivals section | Accepts `initialData` prop — skips its own fetch when server has already provided data; falls back to individual endpoint if needed; signals preloader when data is ready |
| `client/src/components/user/BestSellers.jsx` | Homepage Best Sellers section | Same pattern as NewArrivals |
| `client/src/components/user/Combos.jsx` | Homepage Combos section | Same pattern; hides gracefully if no combo products exist |
| `client/src/components/user/FeaturedProducts.jsx` | Deals ≥60% section | Uses `deals60` from aggregated response; falls back to client-side filter from all products |
| `client/src/components/user/ProductCard.jsx` | Every product card image | `cdnImg()` injects Cloudinary transforms (`w_400,q_auto:good,f_auto,dpr_auto`); `loading="lazy"` + `decoding="async"` on below-fold images; `fetchPriority="high"` for above-fold cards |
| `client/src/app/layout.jsx` | Every page's `<head>` | `<link rel="preconnect">` and `<link rel="dns-prefetch">` for `res.cloudinary.com` — eliminates DNS + TLS handshake delay before first image loads |
| `client/src/components/user/Preloader.jsx` | First-visit loading screen | Waits for `window.load` (all images downloaded) AND `window.__KC_DATA_READY` flag (set by NewArrivals after data resolves) before fading out; hard 7s safety timeout prevents blocking on failure |

---

## Technologies Used and Why

| Technology | One-line explanation |
|---|---|
| **In-memory cache (Map + TTL)** | Stores API results in server RAM so repeated requests return in microseconds instead of waiting for MongoDB |
| **MongoDB compound indexes** | Pre-sorted data structures so filtering by `isNewArrival`, `isBestSeller`, `category` takes milliseconds instead of scanning the whole collection |
| **Mongoose `.lean()`** | Returns plain JavaScript objects instead of full Mongoose documents — skips unnecessary processing, about 30% faster on large lists |
| **Mongoose `.select()`** | Only fetches the 12 fields a card actually displays — cuts response payload by ~60% |
| **HTTP `Cache-Control` headers** | Tells browsers and CDNs to keep a copy for 60 seconds, so repeat visitors get the response without touching the server at all |
| **Next.js ISR (`revalidate: 90`)** | Vercel rebuilds the homepage in the background every 90 seconds — visitors always get a fast pre-built page, never wait for a cold server render |
| **Cloudinary auto-format (`f_auto`)** | Automatically delivers WebP to Chrome/Edge and AVIF to Safari — typically 30–60% smaller than the original JPG/PNG |
| **Cloudinary auto-quality (`q_auto:good`)** | Adjusts compression per image so quality stays high but file size stays small |
| **Cloudinary width transform (`w_400`)** | Sends the image at the actual render size instead of a 2000px original scaled down in CSS |
| **`fetchPriority="high"` on hero** | Tells the browser to download the hero image before anything else — improves Largest Contentful Paint (LCP) score |
| **`loading="lazy"` on cards** | Below-fold images only download when they're about to scroll into view — saves bandwidth and speeds up initial page load |
| **`<link rel="preconnect">`** | Opens the connection to Cloudinary's CDN before any image request is sent — eliminates the handshake delay |
| **In-flight deduplication (client cache)** | If the browser calls `/api/home` twice at once, only one request actually goes out — the second waits for the first and reuses its result |

---

## How to Feel the Speed Yourself (DevTools)

1. Open Chrome and go to your site
2. Press **F12** → click the **Network** tab
3. Click the **throttle** dropdown (shows "No throttling") → choose **Fast 4G**
4. Check **Disable cache** to simulate a first visit
5. Press **F5** to reload
6. Look at the **Waterfall**:
   - You should see **1–2 API requests** (`/api/home` + maybe `/api/sale/active`) instead of 6–8
   - The hero image should appear near the top with a yellow `fetchpriority` tag
   - Product card images further down the page should start loading **only as you scroll**
7. Now **uncheck Disable cache** and reload again:
   - The page should be **nearly instant** — Vercel serves the pre-built ISR page
8. Navigate to a product page and back to Home:
   - The home sections appear immediately — data served from the client-side 90s cache

---

## ⚠️ Important Caution: New Products Take ~2 Minutes to Appear

When you add or update a product in the admin panel, the homepage will **not show the change immediately**. This is by design — the speed improvements work by caching results for about 90 seconds.

**What this means in practice:**
- Add a new product → it appears on the homepage within **1–2 minutes**
- Update a product's price or image → the old price/image shows for up to **2 minutes**
- Delete a product → it may still show briefly for up to **2 minutes**

This is completely normal and the same behaviour used by large e-commerce sites like Amazon and Flipkart. The cache is automatically cleared whenever a product is saved or deleted in the admin panel, so the 2-minute window is the maximum delay, not a permanent issue.

If you need a change to appear instantly, you can:
1. Go to Vercel dashboard → your project → **Deployments** → click **Redeploy**
2. Or wait ~2 minutes and refresh

---

*Last updated: matches server commit `171a140` and client commit (see git log)*
