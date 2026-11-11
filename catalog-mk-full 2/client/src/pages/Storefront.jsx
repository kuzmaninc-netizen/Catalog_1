import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPublicStore } from '../api/storeApi';
import { CartProvider } from '../context/CartContext';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import CategoryTabs, { ALL_CATEGORIES } from '../components/CategoryTabs';
import CartBar from '../components/CartBar';
import CheckoutSheet from '../components/CheckoutSheet';
import Footer from '../components/Footer';
import { ErrorState, LoadingState } from '../components/StateViews';
import { SearchIcon } from '../components/Icons';

function StoreContent({ store, products, categories, onReload }) {
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [query, setQuery] = useState('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const openCheckout = useCallback(() => setCheckoutOpen(true), []);
  const closeCheckout = useCallback(() => setCheckoutOpen(false), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (category !== ALL_CATEGORIES && p.category !== category) return false;
      if (!q) return true;
      return `${p.name} ${p.description}`.toLowerCase().includes(q);
    });
  }, [products, category, query]);

  return (
    <div className="min-h-dvh">
      <Header store={store} onCartClick={openCheckout} />

      <main className="mx-auto max-w-6xl px-4 pb-8 pt-5">
        <div className="space-y-3 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0">
          <CategoryTabs categories={categories} active={category} onChange={setCategory} />
          <label className="relative block md:w-72 md:shrink-0">
            <span className="sr-only">Пребарај производи</span>
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Пребарај производи…"
              className="input bg-white pl-11"
            />
          </label>
        </div>

        {products.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-semibold text-navy-900">Каталогот е во подготовка</p>
            <p className="mt-1 text-sm text-slate-500">Наскоро тука ќе има производи.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-semibold text-navy-900">Нема пронајдени производи</p>
            <p className="mt-1 text-sm text-slate-500">Обидете се со друг збор или категорија.</p>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer store={store} />
      {!checkoutOpen && <CartBar onOpen={openCheckout} />}
      <CheckoutSheet open={checkoutOpen} onClose={closeCheckout} store={store} onCatalogStale={onReload} />
    </div>
  );
}

export default function Storefront() {
  const { slug = '' } = useParams();
  const [state, setState] = useState({ status: 'loading', data: null, error: null });

  const load = useCallback(
    async ({ silent = false, signal } = {}) => {
      if (!silent) setState({ status: 'loading', data: null, error: null });
      try {
        const data = await fetchPublicStore(slug.toLowerCase(), { signal });
        setState({ status: 'ready', data, error: null });
      } catch (error) {
        if (error?.name === 'AbortError') return;
        if (!silent) setState({ status: 'error', data: null, error });
      }
    },
    [slug],
  );

  useEffect(() => {
    const controller = new AbortController();
    load({ signal: controller.signal });
    return () => controller.abort();
  }, [load]);

  useEffect(() => {
    if (state.data?.store?.name) document.title = `${state.data.store.name} · catalog.mk`;
  }, [state.data]);

  const reloadSilently = useCallback(() => load({ silent: true }), [load]);

  if (state.status === 'loading') return <LoadingState />;

  if (state.status === 'error') {
    const notFound = state.error?.status === 404;
    return (
      <ErrorState
        title={notFound ? 'Продавницата не постои' : 'Нешто тргна наопаку'}
        message={state.error?.message}
        onRetry={notFound ? undefined : () => load()}
      />
    );
  }

  const { store, products, categories } = state.data;

  return (
    <CartProvider storeSlug={store.slug} products={products}>
      <StoreContent store={store} products={products} categories={categories ?? []} onReload={reloadSilently} />
    </CartProvider>
  );
}
