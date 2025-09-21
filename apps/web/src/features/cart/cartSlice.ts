import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
export type CartItem = {
  id: number;
  name: string;
  price: number;
  image_url?: string | null;
  qty: number;
};
export type CartState = {
  items: Record<number, CartItem>;
};

const initial: CartState = { items: {} };

// localStorage helpers
const KEY = "cart";
const load = (): CartState => {
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) as CartState : initial; }
  catch { return initial; }
};
const save = (s: CartState) => { localStorage.setItem(KEY, JSON.stringify(s)); };

const slice = createSlice({
  name: "cart",
  initialState: load(),
  reducers: {
    add(state, action: PayloadAction<CartItem>) {
      const it = action.payload;
      const ex = state.items[it.id];
      state.items[it.id] = ex ? { ...ex, qty: ex.qty + it.qty } : it;
      save(state);
    },
    setQty(state, action: PayloadAction<{ id:number; qty:number }>) {
      const { id, qty } = action.payload;
      const ex = state.items[id];
      if (!ex) return;
      state.items[id] = { ...ex, qty: Math.max(1, Math.min(20, qty)) };
      save(state);
    },
    remove(state, action: PayloadAction<number>) {
      delete state.items[action.payload]; save(state);
    },
    clear(state) {
      state.items = {}; save(state);
    }
  }
});
export const { add, setQty, remove, clear } = slice.actions;
export default slice.reducer;
