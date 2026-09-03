import HeroBanner from '../components/user/HeroBanner'
import NewArrivals from '../components/user/NewArrivals'
import FestivalSale from '../components/user/FestivalSale'
import BestSellers from '../components/user/BestSellers'
import OfferSection from '../components/user/FeaturedProducts'
import NewsletterBanner from '../components/user/NewsletterBanner'

export const metadata = {
  title: 'Kurti Cove — Ethnic Wear for Every Woman',
  description: 'Shop the finest kurtis — new arrivals, bestsellers, and festive collections.',
}

export default function HomePage() {
  return (
    /* White background on home page — overrides the global cream body bg */
    <div className="bg-white">
      {/* 1 — Hero slider */}
      <HeroBanner />

      {/* 2 — New Arrivals */}
      <NewArrivals />

      {/* 3 — Festival Sale (renders only when a sale is active) */}
      <FestivalSale />

      {/* 4 — Best Sellers */}
      <BestSellers />

      {/* 5 — Offer / Exclusive Deal section */}
      <OfferSection />

      {/* 6 — Newsletter */}
      <NewsletterBanner />
    </div>
  )
}
