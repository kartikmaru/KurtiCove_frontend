'use client'
import { useRef } from 'react'
import { Provider } from 'react-redux'
import { makeStore } from './store'

/**
 * SSR-safe Redux Provider using useRef pattern.
 * Creates the store once per component lifecycle, avoiding
 * module-level singleton issues with Next.js App Router.
 */
export default function ReduxProvider({ children }) {
  const storeRef = useRef(null)
  if (!storeRef.current) {
    storeRef.current = makeStore()
  }
  return <Provider store={storeRef.current}>{children}</Provider>
}
