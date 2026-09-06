/*
  Home page — server component that pre-fetches the aggregated /api/home
  endpoint at request time so the client receives all section data in the
  HTML, making the page instantly usable without waiting for client-side
  fetches on every section.

  Each section component also accepts `initialData` — if provided it
  skips its own fetch entirely.  If the pre-fetch fails (cold start,
  network issue) the sections fall back to their own individual calls
  transparently.
*/
import HeroBanner    from '../components/user/HeroBanner'
import NewArrivals   from '../components/user/NewArrivals'
import FestivalSale  from '../components/user/FestivalSale'
import BestSellers   from '../components/user/BestSellers'
import Combos        from '../components/user/Combos'
import OfferSection  from '../components/user/FeaturedProducts'
import NewsletterBanner from '../components/user/NewsletterBanner'

export const metadata = {
  title: 'Kurti Cove — Ethnic Wear for Every Woman',
  description: 'Shop the finest kurtis — new arrivals, bestsellers, and festive collections.',
}

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/'

async function getHomeData() {
  try {
    const res = await fetch(`${BASE}home`, {
      next: { revalidate: 90 },   // ISR: revalidate every 90s
    })
    if (!res.ok) return null
    const json = await res.json()
    return json.success ? json.data : null
  } catch {
    return null   // sections will self-fetch client-side
  }
}

export default async function HomePage() {
  const home = await getHomeData()

  return (
    <div className="bg-white">
      {/* Hero — no data dependency */}
      <HeroBanner />

      {/* Sections receive pre-fetched data; fall back gracefully if null */}
      <NewArrivals  initialData={home?.newArrivals  ?? null} />
      <FestivalSale />
      <BestSellers  initialData={home?.bestSellers  ?? null} />
      <Combos       initialData={home?.combos       ?? null} />
      <OfferSection initialData={home?.deals60      ?? null} />
      <NewsletterBanner />
    </div>
  )
}
