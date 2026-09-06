/*
  Home page — server component.

  IMPORTANT: uses process.env.API_BASE_URL (server-side, no NEXT_PUBLIC prefix)
  so the server-side fetch works on Vercel. Falls back to NEXT_PUBLIC_API_BASE_URL
  then localhost for local dev.
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

/*
  Server-side base URL: prefer the private server env var (no NEXT_PUBLIC_),
  fall back to the public one, then localhost for dev.
*/
const SERVER_BASE =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:5000/api/'

async function getHomeData() {
  try {
    const url = SERVER_BASE.endsWith('/') ? `${SERVER_BASE}home` : `${SERVER_BASE}/home`
    const res = await fetch(url, {
      next: { revalidate: 90 },
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return null
    const json = await res.json()
    if (!json.success || !json.data) return null
    // Only return non-empty data to avoid caching empty states
    const d = json.data
    if (!d.newArrivals?.length && !d.bestSellers?.length) return null
    return d
  } catch {
    return null
  }
}

export default async function HomePage() {
  const home = await getHomeData()

  return (
    <div className="bg-white">
      <HeroBanner />
      {/*
        Pass initialData only when we have real data.
        null means "please fetch yourself" — never pass empty arrays
        as that silently suppresses the client-side fetch.
      */}
      <NewArrivals  initialData={home?.newArrivals?.length  ? home.newArrivals  : null} />
      <FestivalSale />
      <BestSellers  initialData={home?.bestSellers?.length  ? home.bestSellers  : null} />
      <Combos       initialData={home?.combos?.length       ? home.combos       : null} />
      <OfferSection initialData={home?.deals60?.length      ? home.deals60      : null} />
      <NewsletterBanner />
    </div>
  )
}
