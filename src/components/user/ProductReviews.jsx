'use client'
import { useState, useEffect } from 'react'
import { FiThumbsUp, FiCheckCircle, FiStar, FiEdit3 } from 'react-icons/fi'

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/'

function StarRow({ rating, size = 15 }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1,2,3,4,5].map(n => (
        <FiStar key={n} size={size}
          fill={n <= rating ? '#E05C88' : 'none'}
          className={n <= rating ? '' : ''}
          style={{ color: n <= rating ? '#E05C88' : '#F5C8D4' }}
          strokeWidth={1.5} />
      ))}
    </div>
  )
}

function Avatar({ name }) {
  const initials = name.split(' ').slice(0,2).map(w => w[0]?.toUpperCase() ?? '').join('')
  return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm font-sans select-none"
         style={{ background: '#E05C88' }}>
      {initials}
    </div>
  )
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return '1 day ago'
  if (diff < 30)  return `${diff} days ago`
  if (diff < 365) return `${Math.floor(diff/30)} months ago`
  return `${Math.floor(diff/365)} years ago`
}

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
      <div className="flex items-start gap-3 mb-3">
        <Avatar name={review.customerName} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm font-sans" style={{ color: '#7B2447' }}>
              {review.customerName}
            </span>
            {review.verifiedBuyer && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold font-sans" style={{ color: '#B5EDDB' }}>
                <FiCheckCircle size={12} strokeWidth={2.5} style={{ color: '#27a06b' }} />
                <span style={{ color: '#27a06b' }}>VERIFIED BUYER</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <StarRow rating={review.rating} size={13} />
            <span className="text-xs font-sans" style={{ color: '#6B4553' }}>
              {review.location && <>{review.location} · </>}
              {timeAgo(review.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {review.title && (
        <p className="font-serif font-semibold text-base mb-1" style={{ color: '#7B2447' }}>{review.title}</p>
      )}
      <p className="text-sm leading-relaxed font-sans" style={{ color: '#6B4553' }}>{review.comment}</p>

      {review.imageUrl && (
        <div className="mt-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={review.imageUrl} alt="Customer photo"
            className="w-20 h-20 rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity border"
            style={{ borderColor: '#F5C8D4' }}
            onClick={() => window.open(review.imageUrl, '_blank')} />
        </div>
      )}

      <button onClick={handleHelpful} disabled={marked}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-sans font-medium transition-colors"
        style={{ color: marked ? '#E05C88' : '#6B4553', cursor: marked ? 'default' : 'pointer' }}>
        <FiThumbsUp size={13} strokeWidth={2} />
        HELPFUL ({count})
      </button>

      <hr className="mt-5" style={{ borderColor: '#F5C8D4' }} />
    </div>
  )
}

function RatingBar({ star, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 w-8 flex-shrink-0 justify-end">
        <span className="text-xs font-sans leading-none" style={{ color: '#6B4553' }}>{star}</span>
        <FiStar size={10} fill="#E05C88" style={{ color: '#E05C88' }} />
      </div>
      <div className="flex-1 rounded-full h-2 overflow-hidden" style={{ background: '#F5C8D4' }}>
        <div className="h-full rounded-full transition-all duration-500"
             style={{ width: `${pct}%`, background: '#E05C88' }} />
      </div>
      <span className="w-8 text-right text-xs font-sans flex-shrink-0" style={{ color: '#6B4553' }}>{pct}%</span>
    </div>
  )
}

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!productId) return
    fetch(`${BASE}review?productId=${productId}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { if (d.success) setReviews(d.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [productId])

  if (loading) {
    return (
      <div className="py-10 flex justify-center">
        <div className="w-8 h-8 border-4 rounded-full animate-spin"
             style={{ borderColor: '#F5C8D4', borderTopColor: '#E05C88' }} />
      </div>
    )
  }

  const totalCount    = reviews.length
  const avgRating     = totalCount ? reviews.reduce((s,r) => s+r.rating, 0) / totalCount : 0
  const verifiedCount = reviews.filter(r => r.verifiedBuyer).length
  const starCounts    = [5,4,3,2,1].map(s => ({ star:s, count: reviews.filter(r => r.rating===s).length }))

  return (
    <section className="mt-14 pt-10 border-t" style={{ borderColor: '#F5C8D4' }}>
      <h2 className="font-serif text-2xl md:text-3xl font-bold mb-8" style={{ color: '#7B2447' }}>
        Loved by{' '}
        <span style={{ color: '#E05C88' }}>{totalCount} {totalCount===1?'customer':'customers'}</span>
      </h2>

      {totalCount === 0 ? (
        <p className="text-sm font-sans" style={{ color: '#6B4553' }}>Be the first to share your thoughts!</p>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* Summary card */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="rounded-2xl p-6 flex flex-col gap-5 border"
                 style={{ background: '#FEF0E3', borderColor: '#F5C8D4' }}>
              <div className="flex flex-col items-center gap-2">
                <span className="text-6xl font-bold leading-none"
                      style={{ fontFamily:'var(--font-playfair),serif', color:'#7B2447' }}>
                  {avgRating.toFixed(1)}
                </span>
                <StarRow rating={Math.round(avgRating)} size={20} />
                <p className="text-xs font-sans mt-1" style={{ color: '#6B4553' }}>
                  {verifiedCount} verified {verifiedCount===1?'review':'reviews'}
                </p>
              </div>
              <hr style={{ borderColor: '#F5C8D4' }} />
              <div className="flex flex-col gap-2.5">
                {starCounts.map(({ star, count }) => (
                  <RatingBar key={star} star={star} count={count} total={totalCount} />
                ))}
              </div>
              <hr style={{ borderColor: '#F5C8D4' }} />
              <button
                className="w-full flex items-center justify-center gap-2 text-xs font-bold py-3 rounded-xl transition-all duration-300 font-sans tracking-widest uppercase border-2"
                style={{ borderColor: '#E05C88', color: '#E05C88' }}
                onMouseEnter={e => { e.currentTarget.style.background='#E05C88'; e.currentTarget.style.color='#fff' }}
                onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#E05C88' }}
              >
                <FiEdit3 size={13} />
                Write a Review
              </button>
            </div>
          </div>

          {/* Review list */}
          <div className="flex-1 min-w-0">
            {reviews.map(r => <ReviewCard key={r._id} review={r} />)}
          </div>
        </div>
      )}
    </section>
  )
}
