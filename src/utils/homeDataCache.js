/*
  Client-side in-flight deduplication + short-lived cache for /api/home.

  Pattern: one shared Promise per in-flight request so that if multiple
  components call fetchHomeData() at the same time, only ONE network
  request is made.  Results are cached for 90 seconds so navigating
  back to the home page is instant.
*/

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/'

let _cache    = null   // { data, ts }
let _inflight = null   // Promise while fetch is in progress
const TTL_MS  = 90_000 // 90 seconds

export async function fetchHomeData() {
  /* Return cached result if still fresh */
  if (_cache && Date.now() - _cache.ts < TTL_MS) {
    return _cache.data
  }

  /* Deduplicate concurrent calls — reuse the same Promise */
  if (_inflight) return _inflight

  _inflight = fetch(`${BASE}home`, { cache: 'no-store' })
    .then(r => r.json())
    .then(json => {
      if (json.success) {
        _cache    = { data: json.data, ts: Date.now() }
        _inflight = null
        return json.data
      }
      _inflight = null
      return null
    })
    .catch(() => { _inflight = null; return null })

  return _inflight
}

/** Manually invalidate (e.g. after an admin write) */
export function invalidateHomeCache() {
  _cache    = null
  _inflight = null
}
