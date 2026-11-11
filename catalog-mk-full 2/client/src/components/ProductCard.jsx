import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/orderMessage';
import { CartIcon, MinusIcon, PlusIcon } from './Icons';

function ImagePlaceholder({ name }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
      <span className="text-3xl font-semibold text-slate-400">{(name || '?').charAt(0)}</span>
    </div>
  );
}

export default function ProductCard({ product }) {
  const { getQuantity, addItem, setQuantity } = useCart();
  const [imgFailed, setImgFailed] = useState(false);
  const quantity = getQuantity(product.id);
  const outOfStock = product.in_stock === false;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-slate-100 transition hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {product.image_url && !imgFailed ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className={`h-full w-full object-cover transition duration-300 group-hover:scale-105 ${
              outOfStock ? 'opacity-50 grayscale' : ''
            }`}
          />
        ) : (
          <ImagePlaceholder name={product.name} />
        )}

        {outOfStock && (
          <span className="absolute left-2 top-2 rounded-full bg-navy-900/80 px-2.5 py-1 text-[11px] font-medium text-white">
            Нема на залиха
          </span>
        )}
        {quantity > 0 && (
          <span className="absolute right-2 top-2 flex h-7 min-w-7 items-center justify-center rounded-full bg-teal-400 px-2 text-xs font-bold text-navy-900 shadow">
            {quantity}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 md:p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-navy-900 md:text-base">
          {product.name}
        </h3>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-xs text-slate-500 md:text-sm">{product.description}</p>
        )}

        <div className="mt-auto pt-3">
          <p className="text-base font-bold text-navy-800 md:text-lg">
            {formatPrice(product.price)}
            {product.unit && product.unit !== 'парче' && (
              <span className="text-xs font-medium text-slate-400"> / {product.unit}</span>
            )}
          </p>

          {quantity === 0 ? (
            <button
              type="button"
              disabled={outOfStock}
              onClick={() => addItem(product)}
              className="btn-teal mt-2 w-full py-2.5"
            >
              <CartIcon className="h-4 w-4" />
              <span className="text-xs md:text-sm">Додај во кошничка</span>
            </button>
          ) : (
            <div className="mt-2 flex items-center justify-between rounded-xl bg-navy-50 p-1">
              <button
                type="button"
                onClick={() => setQuantity(product.id, quantity - 1)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-navy-800 shadow-sm transition active:scale-90"
                aria-label={`Намали ${product.name}`}
              >
                <MinusIcon />
              </button>
              <span className="text-sm font-bold text-navy-900" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => addItem(product)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-800 text-white shadow-sm transition active:scale-90"
                aria-label={`Зголеми ${product.name}`}
              >
                <PlusIcon />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
