import HeroBanner from '../components/user/HeroBanner'
import NewArrivals from '../components/user/NewArrivals'
import FestivalSale from '../components/user/FestivalSale'
import BestSellers from '../components/user/BestSellers'
import Combos from '../components/user/Combos'
import OfferSection from '../components/user/FeaturedProducts'
import NewsletterBanner from '../components/user/NewsletterBanner'

export const metadata = {
  title: 'Kurti Cove — Ethnic Wear for Every Woman',
  description: 'Shop the finest kurtis — new arrivals, bestsellers, and festive collections.',
}

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* 1 — Hero slider */}
      <HeroBanner />
      {/* 2 — New Arrivals */}
      <NewArrivals />
      {/* 3 — Festival Sale */}
      <FestivalSale />
      {/* 4 — Best Sellers */}
      <BestSellers />
      {/* 5 — Combos */}
      <Combos />
      {/* 6 — Offer / Exclusive Deal section */}
      <OfferSection />
      {/* 7 — Newsletter */}
      <NewsletterBanner />
    </div>
  )
}
