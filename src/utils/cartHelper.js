import API from './Helper'
import { loadUserCart, addtocart, removeItem as removeItemAction } from '../redux/features/CartSlice'

/**
 * Called after login/OTP verify.
 * Sends local cart to /api/cart/sync, gets DB cart back,
 * then dispatches loadUserCart to Redux store.
 * @param {function} dispatch - Redux dispatch
 */
export const syncAndLoadCart = async (dispatch) => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('kc_cart') : null
    const localCart = raw ? JSON.stringify({ items: JSON.parse(raw).map((i) => ({ productId: i._id, qty: i.qty })) }) : JSON.stringify({ items: [] })

    const res = await API.post('/cart/sync', { localCart })
    if (res.data.success && res.data.data?.items) {
      dispatch(loadUserCart(res.data.data.items))
    }
  } catch (err) {
    console.error('Cart sync failed:', err)
  }
}

/**
 * Adds an item to both Redux store and DB cart (if logged in).
 * Falls back to local-only if not authenticated.
 * @param {object} product - Full product object from API
 * @param {number} qty - Quantity to add
 * @param {function} dispatch - Redux dispatch
 */
export const addToCartWithSync = async (product, qty = 1, dispatch) => {
  // Always update Redux + localStorage immediately
  dispatch(
    addtocart({
      _id: product._id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice || null,
      images: product.images || [],
      qty,
    })
  )

  // If logged in, sync with server
  const token = typeof window !== 'undefined' ? localStorage.getItem('kc_token') : null
  if (!token) return

  try {
    await API.post('/cart/add_to_cart', { productId: product._id, qty })
  } catch (err) {
    console.error('DB cart add failed (local still updated):', err)
  }
}

/**
 * Removes an item from both Redux store and DB cart (if logged in).
 * Optimistic: Redux is updated immediately; DB call happens in background.
 * On DB failure the item stays removed locally (next sync will reconcile).
 *
 * @param {string}   productId - The product _id to remove
 * @param {function} dispatch  - Redux dispatch
 */
export const removeFromCartSync = async (productId, dispatch) => {
  // Optimistic remove from Redux + localStorage immediately
  dispatch(removeItemAction({ id: productId }))

  // If not logged in, nothing more to do
  const token = typeof window !== 'undefined' ? localStorage.getItem('kc_token') : null
  if (!token) return

  try {
    // Backend DELETE /api/cart/remove expects productId in request body
    await API.delete('/cart/remove', { data: { productId } })
  } catch (err) {
    console.error('DB cart remove failed (local already updated):', err)
  }
}
