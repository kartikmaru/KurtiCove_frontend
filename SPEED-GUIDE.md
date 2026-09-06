# Kurti Cove — Speed Guide (Hinglish)

> **Simple bhasha mein samjhao:** Website fast kaise hui, kya badla, aur kyun?

---

## 🐢 Pehle kya hota tha (Slow Website)

Jab bhi koi user homepage open karta tha, toh browser **6–8 alag-alag requests** bhejta tha server ko:

```
User ne homepage khola
  ↓
"New Arrivals ke products do"    → server → database
"Best Sellers ke products do"    → server → database
"Combos ke products do"          → server → database
"60% discount products do"       → server → database
"Sale active hai??"              → server → database
"Categories ki list do"          → server → database
```

Har request mein:
- Server tak jaao (Render pe hosted hai — free plan = slow cold start)
- Database (MongoDB) mein poora data dhundo — **koi index nahi tha** toh ek-ek record check karta tha
- Poora product data wapas bhejo — naam, photo, price, **description (bada HTML), colors, sizes** — sab kuch, chahe card pe sirf naam aur price dikhna ho

**Result:** Page load hota tha 5–8 seconds mein. User ko blank/skeleton screens dikhti thin.

---

## 🚀 Ab kya hota hai (Fast Website)

### Ek hi request mein sab kuch

```
User ne homepage khola
  ↓
SIRF EK request: "/api/home"
  ↓
Server check karta hai — "kya pehle se cache mein hai?"
  ↓ (90 seconds ke andar)
  → HAA cache mein hai → turant bhej do (database jaana hi nahi pada!)
  ↓ (pehli baar ya cache expire hone ke baad)
  → MongoDB mein 5 queries ek saath chalao (parallel)
  → Result save kar lo cache mein 90 seconds ke liye
  → Browser ko bhej do
```

---

## 📦 Samjhao ek example se

Socho ek **dabbewala** hai jo khana deliver karta hai.

**Pehle (slow):**
- Har ghar alag-alag order karta tha
- Dabbewala 6 baar kitchen mein jaata, 6 baar khana banata, 6 baar deliver karta
- Har baar time lagta

**Ab (fast):**
- Subah ek baar saara khana bana lo
- Thodi der ke liye warm rakh lo (cache = tiffin box)
- Jab bhi order aaye — tiffin mein se nikalo aur de do instantly
- Sirf jab tiffin purana ho (90 second baad) tab naya banao

---

## 🔧 Kya-Kya Badla — Simple Table

| Kya Badla | Kaise tha Pehle | Ab Kaise Hai | Fayda |
|---|---|---|---|
| **Homepage requests** | 6–8 alag requests | Sirf 1 request `/api/home` | 5x kam network traffic |
| **Database search** | Poora collection scan (slow) | Indexes lagate hain — seedha result milta hai | 10x fast query |
| **Data size** | Poora product object (HTML description bhi) | Sirf woh 12 fields jo card pe dikhti hain | 60% chhota response |
| **Cache** | Koi cache nahi — har baar fresh DB hit | 90 second ka memory cache | Repeat visitors ko instant response |
| **Images** | Full size JPG/PNG bhejte the | WebP/AVIF format, sahi size pe (w_400) | 40–60% chhoti file |
| **Hero image** | Normal priority pe load hoti thi | `fetchpriority=high` — sabse pehle load hoti hai | LCP improve |
| **Neeche wali images** | Sab ek saath load hoti thin | `loading=lazy` — sirf scroll karo toh load ho | Page load fast |
| **DNS preconnect** | Cloudinary se connect hone mein time lagta | `<link rel="preconnect">` pehle se connection ready | Image load fast shuru |

---

## 📁 File-by-File — Kaunsa File Kya Karta Hai

### Server Side (Render pe)

#### `server/utils/cache.js`
Yeh ek **chhota sa memory store** hai — JavaScript ke `Map` se banaya (koi extra package nahi).
- Product data yahan save ho jaata hai thodi der ke liye
- Agli request mein database jaana nahi padta
- 90 second baad khud expire ho jaata hai
- Jab admin koi product add/edit/delete kare toh turant clear ho jaata hai

#### `server/models/ProductModel.js`
MongoDB mein **indexes** add kiye hain:
- Pehle: "isNewArrival = true wale products dhundo" → poori collection scan (slow)
- Ab: Index hai → seedha jump karo wahan jaahan New Arrivals hain (fast)
- 5 index add kiye: NewArrival, BestSeller, Featured, Category, CreatedAt

#### `server/controllers/productController.js`
- **`.lean()`**: Mongoose normally ek heavy JavaScript object banata hai. `.lean()` se plain object aata hai — 30% fast
- **`.select()`**: Sirf woh fields fetch karo jo card pe dikhni hain — naam, price, image, stock. Description nahi chahiye card ke liye toh nahi mangai
- **`getHomeData()`**: Ek nayi function jo 5 queries ek saath chalata hai (parallel) — newArrivals, bestSellers, combos, deals60, categories
- **Cache-Control header**: Browser aur CDN ko batao — "yeh response 60 second tak fresh hai, dobara mat maango"

#### `server/server.js`
- Nayi route add ki: `GET /api/home` — yahi woh ek request hai jo sab kuch return karta hai

---

### Frontend Side (Vercel pe)

#### `client/src/app/page.jsx` (Homepage)
- Pehle: Ek plain page tha, saare sections apna data khud fetch karte the client side pe
- Ab: **Server Component** hai — Vercel ke server pe run karta hai build time/revalidation pe
- `/api/home` call karta hai **ek baar**, data milta hai, saare sections ko props mein de deta hai
- `revalidate: 90` — Vercel 90 second baad background mein naya data fetch karta hai automatically
- User ko hamesha ready-made HTML milti hai — koi loading nahi

#### `client/src/utils/homeDataCache.js`
- Agar kisi wajah se server component ka data nahi mila, toh sections khud fetch karte hain
- Yeh cache ensure karta hai ki **ek hi time pe sirf ek request** jaaye — 5 sections same time pe fetch karein toh bhi sirf 1 network call
- 90 second ke liye data save rehta hai — back button dabao homepage pe, instant load

#### `client/src/components/user/NewArrivals.jsx` (aur BestSellers, Combos)
- `initialData` prop accept karta hai
- Agar server ne data de diya → seedha use karo, koi fetch nahi
- Agar nahi diya (server fail hua) → apna individual fetch chalao (guaranteed backup)
- Jab pehla data milta hai → `markDataReady()` call karta hai → preloader ko signal deta hai "data aa gaya, ab hat ja"

#### `client/src/components/user/ProductCard.jsx`
- **`cdnImg()` function**: Cloudinary ka URL badalta hai — original 2000px JPG ke jagah, `w_400,q_auto:good,f_auto` add karta hai
  - `w_400`: Card ki actual width ke hisab se resize
  - `f_auto`: Chrome ko WebP dega, Safari ko AVIF — automatically
  - `q_auto:good`: Quality vs size ka best balance
- **`loading="lazy"`**: Neeche wali images tabhi download hongi jab user scroll karke paas aayega
- **`fetchPriority="high"`**: Pehle card ki image sabse pehle load ho

#### `client/src/app/layout.jsx`
- `<link rel="preconnect" href="https://res.cloudinary.com">` — page load hote hi Cloudinary se connection start ho jaata hai
- Jab pehli image ka request aata hai — connection pehle se ready hota hai, delay nahi

#### `client/src/components/user/Preloader.jsx`
Preloader ka kaam hai dikhna tab tak jab tak page sach mein ready na ho:
- **Pehle**: Sirf `window.load` ka wait karta tha (sirf browser assets ka)
- **Ab**: Do cheezein wait karta hai:
  1. `window.load` — sab images aur assets download ho gaye
  2. `window.__KC_DATA_READY` — pehla section (New Arrivals) ka data aa gaya
- Minimum 900ms dikhai deta hai (blink nahi karta)
- 7 second ka safety timeout — agar kuch fail bhi ho toh page block nahi hoga hamesha

---

## 🔄 Data ka Safar — Step by Step

```
1. User browser mein URL type karta hai
       ↓
2. Vercel check karta hai — "kya iska pre-built page hai?"
   (ISR revalidate 90s — almost always YES)
       ↓
3. Pre-built HTML milti hai instantly — product data pehle se embedded
       ↓
4. Browser HTML render karta hai — sections dikh jaate hain
       ↓
5. JavaScript load hota hai background mein
       ↓
6. Images load hoti hain:
   - Hero image: sabse pehle (fetchPriority=high)
   - Card images: lazy — scroll karo toh load ho
   - Cloudinary: WebP/AVIF format, 400px wide — light weight
       ↓
7. Preloader check karta hai:
   - window.load fired? ✓
   - NewArrivals data ready? ✓
   - Minimum 900ms guzre? ✓
   → Fade out kar do
       ↓
8. Page fully usable!
```

---

## 🧪 Khud Speed Test Karo

### Chrome DevTools se:

1. `F12` dabao → **Network** tab pe click karo
2. **Throttling** dropdown mein **Fast 4G** choose karo
3. **Disable cache** tick karo (pehli visit simulate karne ke liye)
4. `F5` se reload karo
5. Dekho:
   - Kitni requests gayi? (Ab sirf 1–2 honi chahiye `/api/home` + maybe `/api/sale/active`)
   - Hero image pe right click → "Properties" → WebP format hona chahiye
   - Neeche scroll karo — card images tabhi load hongi

### Dusri baar:
1. **Disable cache** untick karo
2. Reload karo → **near-instant** hoga (Vercel ISR cache se)

---

## ⚠️ Ek Zaruri Baat — Naye Product Dikhne Mein ~2 Minute Lag Sakte Hain

Website fast karne ke liye hum data ko **thodi der ke liye save** (cache) karte hain.

Iska matlab:
- Koi nayi product add ki admin se → **1–2 minute mein** homepage pe dikhegi
- Product price update ki → **1–2 minute mein** naya price aayega
- Koi product delete ki → **1–2 minute tak** dikhai de sakti hai

**Yeh bilkul normal hai** — Amazon, Flipkart, Myntra sab yahi karte hain.

Agar urgent chahiye toh:
- Vercel dashboard mein jaao → **Redeploy** click karo
- Ya bas 2 minute wait karo 😊

---

*Content was rephrased for compliance with licensing restrictions*
