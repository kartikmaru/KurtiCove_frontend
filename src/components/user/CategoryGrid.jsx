import Link from 'next/link'

const categories = [
  {
    label: 'New Arrivals',
    href: '/shop?filter=isNewArrival',
    bg: 'linear-gradient(135deg,#F8A5B5,#FBCBB0)',
    desc: 'Fresh styles just in',
  },
  {
    label: 'Most Loved',
    href: '/shop?filter=isBestSeller',
    bg: 'linear-gradient(135deg,#FBDBBB,#F8A5B5)',
    desc: 'Our bestsellers',
  },
  {
    label: "What's on Sale",
    href: '/shop?sort=desc',
    bg: 'linear-gradient(135deg,#E05C88,#F8A5B5)',
    desc: 'Steal the deal',
  },
  {
    label: 'Gift Ideas',
    href: '/shop?filter=isFeatured',
    bg: 'linear-gradient(135deg,#B5EDDB,#FBDBBB)',
    desc: 'Perfect for gifting',
  },
]

export default function CategoryGrid() {
  return (
    <section className="py-14" style={{ background: '#FCFAE0' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="font-cursive text-4xl font-bold mb-2" style={{ color: '#7B2447' }}>
            Shop by Category
          </h2>
          <p className="font-sans text-base" style={{ color: '#6B4553' }}>
            Find exactly what you are looking for
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              className="group relative rounded-[14px] overflow-hidden p-6 text-center hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 min-h-[140px] flex flex-col items-center justify-center"
              style={{ background: cat.bg }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-6 translate-x-6"
                   style={{ background: 'rgba(255,255,255,0.18)' }} />
              <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full translate-y-6 -translate-x-4"
                   style={{ background: 'rgba(255,255,255,0.14)' }} />

              <h3 className="font-serif font-bold text-lg leading-tight italic relative z-10"
                  style={{ color: '#7B2447' }}>
                {cat.label}
              </h3>
              <p className="font-sans text-xs mt-1 relative z-10" style={{ color: '#6B4553' }}>
                {cat.desc}
              </p>
              <span className="mt-3 inline-block text-xs font-sans px-3 py-1 rounded-full transition-colors relative z-10"
                    style={{ background: 'rgba(255,255,255,0.35)', color: '#7B2447' }}>
                Shop Now →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
