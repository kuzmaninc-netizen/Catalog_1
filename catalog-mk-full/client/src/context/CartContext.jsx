import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { readStorage, writeStorage } from '../utils/storage';

const CartContext = createContext(null);
const MAX_QTY = 99;

function clampQty(qty) {
  const n = Math.floor(Number(qty) || 0);
  return Math.max(0, Math.min(MAX_QTY, n));
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { product, quantity = 1 } = action;
      const existing = state.find((i) => i.product.id === product.id);
      if (existing) {
        return state.map((i) =>
          i.product.id === product.id ? { ...i, quantity: clampQty(i.quantity + quantity) } : i,
        );
      }
      return [...state, { product, quantity: clampQty(quantity) }];
    }
    case 'SET_QTY': {
      const qty = clampQty(action.quantity);
      if (qty === 0) return state.filter((i) => i.product.id !== action.productId);
      return state.map((i) => (i.product.id === action.productId ? { ...i, quantity: qty } : i));
    }
    case 'REMOVE':
      return state.filter((i) => i.product.id !== action.productId);
    case 'CLEAR':
      return [];
    case 'REPLACE':
      return action.items;
    default:
      return state;
  }
}

/**
 * Кошничката се чува посебно за секоја продавница (по slug).
 * При вчитување, цените/сликите се освежуваат од актуелните производи.
 */
export function CartProvider({ storeSlug, products = [], children }) {
  const storageKey = `catalogmk:cart:${storeSlug}`;
  const [items, dispatch] = useReducer(cartReducer, [], () => readStorage(storageKey, []));

  // Синхронизирај ја зачуваната кошничка со најновите податоци од серверот
  useEffect(() => {
    if (!products.length) return;
    const byId = new Map(products.map((p) => [p.id, p]));
    const fresh = items
      .filter((i) => byId.has(i.product.id) && byId.get(i.product.id).in_stock)
      .map((i) => ({ ...i, product: byId.get(i.product.id) }));
    dispatch({ type: 'REPLACE', items: fresh });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  useEffect(() => {
    writeStorage(storageKey, items);
  }, [items, storageKey]);

  const addItem = useCallback((product, quantity = 1) => {
    dispatch({ type: 'ADD', product, quantity });
  }, []);
  const setQuantity = useCallback((productId, quantity) => {
    dispatch({ type: 'SET_QTY', productId, quantity });
  }, []);
  const removeItem = useCallback((productId) => dispatch({ type: 'REMOVE', productId }), []);
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR' }), []);

  const value = useMemo(() => {
    const itemsCount = items.reduce((s, i) => s + i.quantity, 0);
    const subtotal = items.reduce((s, i) => s + Number(i.product.price || 0) * i.quantity, 0);
    const getQuantity = (productId) => items.find((i) => i.product.id === productId)?.quantity ?? 0;
    return { items, itemsCount, subtotal, getQuantity, addItem, setQuantity, removeItem, clearCart };
  }, [items, addItem, setQuantity, removeItem, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart мора да се користи во <CartProvider>.');
  return ctx;
}
