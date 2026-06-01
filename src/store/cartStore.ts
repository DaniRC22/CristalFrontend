import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '../types';

const CART_TTL_MS = 24 * 60 * 60 * 1000; // 24h desde la última modificación

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
  expiresAt: number | null;
  // qty: cantidad a agregar (default 1). Si el item ya está en el carrito,
  // suma qty a la cantidad existente. Útil para el quantity selector del
  // ProductDetail (sin esto el usuario tenía que clickear N veces).
  addItem: (item: Omit<CartItem, 'quantity' | 'cart_key'>, qty?: number) => void;
  removeItem: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
  itemCount: () => number;
}

const nextExpiry = () => Date.now() + CART_TTL_MS;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      expiresAt: null,

      addItem: (item, qty = 1) =>
        set((state) => {
          const addQty = Math.max(1, Math.floor(qty));
          const cart_key = makeCartKey(item.id, item.selected_options);
          const existing = state.items.find((i) => i.cart_key === cart_key);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.cart_key === cart_key ? { ...i, quantity: i.quantity + addQty } : i
              ),
              expiresAt: nextExpiry(),
            };
          }
          return {
            items: [...state.items, { ...item, cart_key, quantity: addQty }],
            expiresAt: nextExpiry(),
          };
        }),

      removeItem: (cartKey) =>
        set((state) => {
          const items = state.items.filter((i) => i.cart_key !== cartKey);
          return { items, expiresAt: items.length ? nextExpiry() : null };
        }),

      updateQuantity: (cartKey, quantity) =>
        set((state) => {
          const items = quantity <= 0
            ? state.items.filter((i) => i.cart_key !== cartKey)
            : state.items.map((i) => (i.cart_key === cartKey ? { ...i, quantity } : i));
          return { items, expiresAt: items.length ? nextExpiry() : null };
        }),

      clearCart: () => set({ items: [], expiresAt: null }),

      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'kap-cart',
      // El carrito expira 24h después de la última modificación. Sin esto,
      // queda en localStorage indefinidamente y el cliente puede encontrar
      // ítems viejos (con precios/stock desactualizados) semanas después.
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (typeof state.expiresAt === 'number' && state.expiresAt < Date.now()) {
          state.items = [];
          state.expiresAt = null;
        }
      },
    }
  )
);
