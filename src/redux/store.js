import { configureStore } from '@reduxjs/toolkit'
import cartReducer from './features/CartSlice.js'

export const makeStore = () =>
  configureStore({
    reducer: {
      cart: cartReducer,
    },
  })
