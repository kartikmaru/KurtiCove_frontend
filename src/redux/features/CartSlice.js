'use client'
import { createSlice } from '@reduxjs/toolkit'

const LS_KEY = 'kc_cart'

/** Recalculate totals from items array */
const calcTotals = (items) => {
  const totalQty = items.reduce((s, i) => s + i.qty, 0)
  const totalPrice = items.reduce((s, i) => s + (i.discountPrice || i.price) * i.qty, 0)
  return { totalQty, totalPrice }
}

const initialState = {
  items: [],
  totalQty: 0,
  totalPrice: 0,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    /** Add item or increment qty; persist to localStorage */
    addtocart(state, action) {
      const payload = action.payload // { _id, name, price, discountPrice, images, qty? }
      const existing = state.items.find((i) => i._id === payload._id)
      if (existing) {
        existing.qty += payload.qty || 1
      } else {
        state.items.push({ ...payload, qty: payload.qty || 1 })
      }
      const totals = calcTotals(state.items)
      state.totalQty = totals.totalQty
      state.totalPrice = totals.totalPrice
      if (typeof window !== 'undefined') {
        localStorage.setItem(LS_KEY, JSON.stringify(state.items))
      }
    },

    /** Clear all items — used on order placed */
    emptycart(state) {
      state.items = []
      state.totalQty = 0
      state.totalPrice = 0
      if (typeof window !== 'undefined') {
        localStorage.removeItem(LS_KEY)
      }
    },

    /** Load cart from localStorage on app mount */
    lstoCart(state) {
      if (typeof window === 'undefined') return
      const raw = localStorage.getItem(LS_KEY)
      if (!raw) return
      try {
        const items = JSON.parse(raw)
        state.items = items
        const totals = calcTotals(items)
        state.totalQty = totals.totalQty
        state.totalPrice = totals.totalPrice
      } catch {
        state.items = []
        state.totalQty = 0
        state.totalPrice = 0
      }
    },

    /** Increment or decrement qty; remove if qty reaches 0 */
    qtyChange(state, action) {
      const { id, flag } = action.payload // flag: 'inc' | 'dec'
      const item = state.items.find((i) => i._id === id)
      if (!item) return
      if (flag === 'inc') {
        item.qty += 1
      } else {
        item.qty -= 1
        if (item.qty <= 0) {
          state.items = state.items.filter((i) => i._id !== id)
        }
      }
      const totals = calcTotals(state.items)
      state.totalQty = totals.totalQty
      state.totalPrice = totals.totalPrice
      if (typeof window !== 'undefined') {
        localStorage.setItem(LS_KEY, JSON.stringify(state.items))
      }
    },

    /** Remove a specific item */
    removeItem(state, action) {
      const { id } = action.payload
      state.items = state.items.filter((i) => i._id !== id)
      const totals = calcTotals(state.items)
      state.totalQty = totals.totalQty
      state.totalPrice = totals.totalPrice
      if (typeof window !== 'undefined') {
        localStorage.setItem(LS_KEY, JSON.stringify(state.items))
      }
    },

    /** Reset on logout — clears everything */
    resetCart(state) {
      state.items = []
      state.totalQty = 0
      state.totalPrice = 0
      if (typeof window !== 'undefined') {
        localStorage.removeItem(LS_KEY)
      }
    },

    /** Load DB cart items after login sync */
    loadUserCart(state, action) {
      // Reset first, then load
      state.items = []
      const dbItems = action.payload // array of populated cart items from server
      dbItems.forEach((item) => {
        const product = item.productId // populated
        if (!product) return
        state.items.push({
          _id: product._id,
          name: product.name,
          price: product.price,
          discountPrice: product.discountPrice || null,
          images: product.images || [],
          qty: item.qty,
        })
      })
      const totals = calcTotals(state.items)
      state.totalQty = totals.totalQty
      state.totalPrice = totals.totalPrice
      if (typeof window !== 'undefined') {
        localStorage.setItem(LS_KEY, JSON.stringify(state.items))
      }
    },
  },
})

export const { addtocart, emptycart, lstoCart, qtyChange, removeItem, resetCart, loadUserCart } = cartSlice.actions
export default cartSlice.reducer
