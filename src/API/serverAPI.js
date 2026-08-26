import { cookies } from 'next/headers'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/'

/**
 * Server-side fetch of current user using the JWT cookie.
 * Used in Server Components to get auth state without client-side JS.
 * @returns {object|null} User object or null if not authenticated
 */
export const getMe = async () => {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('jwt')?.value || cookieStore.get('auth_token')?.value

    if (!token) return null

    const res = await fetch(`${BASE_URL}user/get`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Cookie: `jwt=${token}`,
      },
      cache: 'no-store',
    })

    if (!res.ok) return null

    const data = await res.json()
    return data.success ? data.data : null
  } catch {
    return null
  }
}
