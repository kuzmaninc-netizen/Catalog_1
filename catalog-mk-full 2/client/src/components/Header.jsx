import BrandLogo from './BrandLogo';
import StoreLogo from './StoreLogo';
import { CartIcon, ClockIcon, PhoneIcon, PinIcon } from './Icons';
import { useCart } from '../context/CartContext';

export default function Header({ store, onCartClick }) {
  const { itemsCount } = useCart();

  return (
    <>
      {/* Лепливa горна лента */}
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <BrandLogo />
          <div className="h-6 w-px bg-slate-200" />

          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <StoreLogo store={store} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight text-navy-900 md:text-base">
                {store.name}
              </p>
              {store.city && <p className="truncate text-xs text-slate-500">{store.city}</p>}
            </div>
          </div>

          <button
            type="button"
            onClick={onCartClick}
            className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-navy-800 text-white transition hover:bg-navy-700 active:scale-95 md:w-auto md:gap-2 md:px-4"
            aria-label={`Кошничка, ${itemsCount} артикли`}
          >
            <CartIcon />
            <span className="hidden text-sm font-semibold md:inline">Кошничка</span>
            {itemsCount > 0 && (
              <span
                key={itemsCount}
                className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 animate-pop items-center justify-center rounded-full bg-teal-400 px-1 text-[11px] font-bold text-navy-900 ring-2 ring-white"
              >
                {itemsCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Инфо за продавницата */}
      <section className="bg-gradient-to-b from-navy-800 to-navy-700 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:py-8">
          <StoreLogo store={store} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold leading-tight md:text-3xl">{store.name}</h1>
            {store.description && (
              <p className="mt-1 max-w-2xl text-sm text-navy-100 md:text-base">{store.description}</p>
            )}
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-navy-100 md:text-sm">
              {store.address && (
                <li className="flex items-center gap-1.5">
                  <PinIcon className="h-4 w-4 text-teal-300" />
                  {store.address}
                  {store.city ? `, ${store.city}` : ''}
                </li>
              )}
              {store.working_hours && (
                <li className="flex items-center gap-1.5">
                  <ClockIcon className="h-4 w-4 text-teal-300" />
                  {store.working_hours}
                </li>
              )}
              {store.phone_display && (
                <li>
                  <a
                    href={store.phone_tel || `tel:+${store.phone}`}
                    className="flex items-center gap-1.5 hover:text-white"
                  >
                    <PhoneIcon className="h-4 w-4 text-teal-300" />
                    {store.phone_display}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {(store.delivery_fee > 0 || store.free_delivery_from > 0 || store.min_order > 0) && (
            <div className="flex flex-wrap gap-2 md:flex-col md:items-end">
              {store.free_delivery_from > 0 && (
                <span className="rounded-full bg-teal-400/15 px-3 py-1 text-xs font-medium text-teal-200 ring-1 ring-teal-400/30">
                  Бесплатна достава над {store.free_delivery_from.toLocaleString('de-DE')} ден.
                </span>
              )}
              {store.min_order > 0 && (
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-navy-50 ring-1 ring-white/15">
                  Мин. нарачка {store.min_order.toLocaleString('de-DE')} ден.
                </span>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
