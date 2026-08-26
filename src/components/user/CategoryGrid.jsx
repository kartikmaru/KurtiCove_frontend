import Link from 'next/link'

const categories = [
  {
    label: 'New Arrivals',
    emoji: '✨',
    href: '/shop?filter=isNewArrival',
    bg: 'from-[#C084FC] to-[#A855F7]',
    desc: 'Fresh styles just in',
  },
  {
    label: 'Most Loved',
    emoji: '💜',
    href: '/shop?filter=isBestSeller',
    bg: 'from-[#A855F7] to-[#7C3AED]',
    desc: 'Our bestsellers',
  },
  {
    label: "What's on Sale",
    emoji: '🏷️',
    href: '/shop?sort=desc',
    bg: 'from-[#7C3AED] to-[#6D28D9]',
    desc: 'Steal the deal',
  },
  {
    label: 'Gift Ideas',
    emoji: '🎁',
    href: '/shop?filter=isFeatured',
    bg: 'from-[#6D28D9] to-[#5B21B6]',
    desc: 'Perfect for gifting',
  },
]

export default function CategoryGrid() {
  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section heading */}
        <div className="text-center mb-10">
          <h2 className="font-cursive text-4xl font-bold text-[#3B0764] mb-2">Shop by Category</h2>
          <p className="font-sans text-[#C084FC] text-base">Find exactly what you are looking for</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              className={`group relative bg-gradient-to-br ${cat.bg} rounded-[14px] overflow-hidden p-6 text-center text-white hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 min-h-[140px] flex flex-col items-center justify-center`}
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-6 -translate-x-4" />

              <span className="text-4xl mb-2 block group-hover:scale-110 transition-transform duration-300">{cat.emoji}</span>
              <h3 className="font-serif font-bold text-lg leading-tight italic">{cat.label}</h3>
              <p className="font-sans text-xs opacity-80 mt-1">{cat.desc}</p>

              <span className="mt-3 inline-block bg-white/20 hover:bg-white/30 text-white text-xs font-sans px-3 py-1 rounded-full transition-colors">
                Shop Now →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
