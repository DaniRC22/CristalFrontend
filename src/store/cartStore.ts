import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '../types';

function makeCartKey(productId: number, options?: Record<string, string>): string {
  if (!options || Object.keys(options).length === 0) return String(productId);
  const sorted = Object.keys(options).sort().reduce(
    (acc, k) => { acc[k] = options[k]; return acc; },
    {} as Record<string, string>
  );
  return `${productId}::${JSON.stringify(sorted)}`;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity' | 'cart_key'>) => void;
  removeItem: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const cart_key = makeCartKey(item.id, item.selected_options);
          const existing = state.items.find((i) => i.cart_key === cart_key);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.cart_key === cart_key ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, cart_key, quantity: 1 }] };
        }),

      removeItem: (cartKey) =>
        set((state) => ({ items: state.items.filter((i) => i.cart_key !== cartKey) })),

      updateQuantity: (cartKey, quantity) =>
        set((state) => ({
          items: quantity <= 0
            ? state.items.filter((i) => i.cart_key !== cartKey)
            : state.items.map((i) => (i.cart_key === cartKey ? { ...i, quantity } : i)),
        })),

      clearCart: () => set({ items: [] }),

      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'kap-cart' }
  )
);
