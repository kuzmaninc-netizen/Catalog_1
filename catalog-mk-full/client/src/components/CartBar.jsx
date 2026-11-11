import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/orderMessage';
import { CartIcon } from './Icons';

/**
 * Пловечка лента на дното – се појавува кога има артикли во кошничката.
 */
export default function CartBar({ onOpen }) {
  const { itemsCount, subtotal } = useCart();
  if (itemsCount === 0) return null;

  return (
    <div className="pb-safe fixed inset-x-0 bottom-0 z-30 animate-slide-up px-4 pt-3 md:pb-6">
      <button
        type="button"
        onClick={onOpen}
        className="mx-auto flex w-full max-w-xl items-center gap-3 rounded-2xl bg-navy-800 p-2 pr-4 text-left text-white shadow-sheet transition hover:bg-navy-700 active:scale-[0.99]"
      >
        <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-teal-400 text-navy-900">
          <CartIcon />
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] font-bold text-navy-900">
            {itemsCount}
          </span>
        </span>
        <span className="flex-1">
          <span className="block text-xs text-navy-100">Вкупно</span>
          <span className="block text-base font-bold">{formatPrice(subtotal)}</span>
        </span>
        <span className="text-sm font-semibold text-teal-300">Нарачај →</span>
      </button>
    </div>
  );
}
