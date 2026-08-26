'use client'
import { useState, useEffect } from 'react'
import { FiThumbsUp, FiCheckCircle, FiStar, FiEdit3 } from 'react-icons/fi'
import toast from 'react-hot-toast'

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/'

/* ── Filled / outline star row ──────────────────────────────── */
function StarRow({ rating, size = 15 }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <FiStar
          key={n}
          size={size}
          fill={n <= rating ? '#fbbf24' : 'none'}
          className={n <= rating ? 'text-amber-400' : 'text-gray-300'}
          strokeWidth={1.5}
        />
      ))}
    </div>
  )
}

/* ── Customer initials avatar ───────────────────────────────── */
function Avatar({ name }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
  return (
    <div className="w-10 h-10 rounded-full bg-purple-800 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm font-sans select-none">
      {initials}
    </div>
  )
}

/* ── Time ago helper ────────────────────────────────────────── */
function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return '1 day ago'
  if (diff < 30)  return `${diff} days ago`
  if (diff < 365) return `${Math.floor(diff / 30)} months ago`
  return `${Math.floor(diff / 365)} years ago`
}

/* ── Single review card ─────────────────────────────────────── */
function ReviewCard({ review }) {
  const [count,  setCount]  = useState(review.helpfulCount)
  const [marked, setMarked] = useState(false)

  const handleHelpful = async () => {
    if (marked) return
    try {
      const res  = await fetch(`${BASE}review/${review._id}/helpful`, { method: 'POST' })
      const data = await res.json()
      if (data.success) { setCount(data.data.helpfulCount); setMarked(true) }
    } catch { /* silent */ }
  }

  return (
    <div className="py-5">
      {/* Header row */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar name={review.customerName} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-purple-900 text-sm font-sans">{review.customerName}</span>
            {review.verifiedBuyer && (
              <span className="inline-flex items-center gap-1 text-green-600 text-xs font-semibold font-sans">
                <FiCheckCircle size={12} strokeWidth={2.5} />
                VERIFIED BUYER
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <StarRow rating={review.rating} size={13} />
            <span className="text-xs text-gray-400 font-sans">
              {review.location && <>{review.location} · </>}
              {timeAgo(review.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Title */}
      {review.title && (
        <p className="font-serif font-semibold text-purple-900 text-base mb-1">{review.title}</p>
      )}

      {/* Body */}
      <p className="text-gray-600 text-sm leading-relaxed font-sans">{review.comment}</p>

      {/* Photo thumbnail */}
      {review.imageUrl && (
        <div className="mt-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={review.imageUrl}
            alt="Customer photo"
            className="w-20 h-20 rounded-xl object-cover border border-purple-100 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(review.imageUrl, '_blank')}
          />
        </div>
      )}

      {/* Helpful */}
      <button
        onClick={handleHelpful}
        disabled={marked}
        className={`mt-3 inline-flex items-center gap-1.5 text-xs font-sans font-medium transition-colors ${
          marked ? 'text-purple-500 cursor-default' : 'text-gray-400 hover:text-purple-600 cursor-pointer'
        }`}
      >
        <FiThumbsUp size={13} strokeWidth={2} />
        HELPFUL ({count})
      </button>

      <hr className="mt-5 border-purple-100" />
    </div>
  )
}

/* ── Rating breakdown bar ───────────────────────────────────── */
function RatingBar({ star, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      {/* Star label */}
      <div className="flex items-center gap-1 w-8 flex-shrink-0 justify-end">
        <span className="text-xs text-gray-500 font-sans leading-none">{star}</span>
        <FiStar size={10} fill="#fbbf24" className="text-amber-400 flex-shrink-0" />
      </div>
      {/* Bar */}
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-purple-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {/* Percentage */}
      <span className="w-8 text-right text-xs text-gray-400 font-sans flex-shrink-0">{pct}%</span>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   MAIN EXPORT
════════════════════════════════════════════════════════════ */
export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!productId) return
    const fetchReviews = async () => {
      try {
        const res  = await fetch(`${BASE}review?productId=${productId}`, { cache: 'no-store' })
        const data = await res.json()
        if (data.success) setReviews(data.data)
      } catch (err) {
        console.error('ProductReviews fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [productId])

  if (loading) {
    return (
      <div className="py-10 flex justify-center">
        <div className="w-8 h-8 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
      </div>
    )
  }

  const totalCount    = reviews.length
  const avgRating     = totalCount ? reviews.reduce((s, r) => s + r.rating, 0) / totalCount : 0
  const verifiedCount = reviews.filter((r) => r.verifiedBuyer).length
  const starCounts    = [5, 4, 3, 2, 1].map((s) => ({
    star:  s,
    count: reviews.filter((r) => r.rating === s).length,
  }))

  return (
    <section className="mt-14 border-t border-purple-100 pt-10">

      {/* Section title */}
      <h2 className="font-serif text-2xl md:text-3xl font-bold text-purple-900 mb-8">
        Loved by{' '}
        <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          {totalCount} {totalCount === 1 ? 'customer' : 'customers'}
        </span>
      </h2>

      {totalCount === 0 ? (
        <p className="text-gray-400 text-sm font-sans">Be the first to share your thoughts!</p>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

          {/* ── LEFT — summary card ─────────────────────────── */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-purple-50/80 border border-purple-100 rounded-2xl p-6 flex flex-col gap-5">

              {/* Big average numeral */}
              <div className="flex flex-col items-center gap-2">
                <span
                  className="text-6xl font-bold text-purple-900 leading-none"
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  {avgRating.toFixed(1)}
                </span>
                <StarRow rating={Math.round(avgRating)} size={20} />
                <p className="text-xs text-gray-400 font-sans mt-1">
                  {verifiedCount} verified {verifiedCount === 1 ? 'review' : 'reviews'}
                </p>
              </div>

              {/* Divider */}
              <hr className="border-purple-100" />

              {/* Star breakdown bars */}
              <div className="flex flex-col gap-2.5">
                {starCounts.map(({ star, count }) => (
                  <RatingBar key={star} star={star} count={count} total={totalCount} />
                ))}
              </div>

              {/* Divider */}
              <hr className="border-purple-100" />

              {/* Write a review CTA */}
              <button
                onClick={() => toast('Review form coming soon! 🌸')}
                className="w-full flex items-center justify-center gap-2 border-2 border-purple-600 text-purple-700 hover:bg-purple-700 hover:text-white text-xs font-bold py-3 rounded-xl transition-all duration-300 font-sans tracking-widest uppercase"
              >
                <FiEdit3 size={13} />
                Write a Review
              </button>
            </div>
          </div>

          {/* ── RIGHT — review list ─────────────────────────── */}
          <div className="flex-1 min-w-0">
            {reviews.map((r) => (
              <ReviewCard key={r._id} review={r} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
