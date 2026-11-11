import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import ProductFormModal from '../../components/admin/ProductFormModal';
import { Alert } from '../../components/admin/FormField';
import { PlusIcon, SearchIcon, TrashIcon } from '../../components/Icons';
import { Spinner } from '../../components/StateViews';
import { formatPrice } from '../../utils/orderMessage';

function ProductRow({ product, onEdit, onToggleStock, onDelete, busy }) {
  return (
    <li className="flex items-center gap-3 p-3 md:gap-4 md:p-4">
      <button type="button" onClick={() => onEdit(product)} className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
        {product.image_url ? (
          <img src={product.image_url} alt="" className={`h-full w-full object-cover ${product.in_stock ? '' : 'opacity-50 grayscale'}`} />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-slate-400">{product.name.charAt(0)}</span>
        )}
      </button>

      <button type="button" onClick={() => onEdit(product)} className="min-w-0 flex-1 text-left">
        <p className="truncate font-semibold text-navy-900">{product.name}</p>
        <p className="text-sm text-navy-700">
          {formatPrice(product.price)}
          {product.unit && product.unit !== 'парче' && <span className="text-slate-400"> / {product.unit}</span>}
        </p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {product.category && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">{product.category}</span>}
          {!product.is_active && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700">Скриен</span>}
        </div>
      </button>

      <div className="flex shrink-0 flex-col items-end gap-2 md:flex-row md:items-center md:gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => onToggleStock(product)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
            product.in_stock ? 'bg-teal-50 text-teal-700 ring-teal-200' : 'bg-slate-100 text-slate-500 ring-slate-200'
          }`}
        >
          {product.in_stock ? 'На залиха' : 'Нема'}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onDelete(product)}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
          aria-label={`Избриши ${product.name}`}
        >
          <TrashIcon />
        </button>
      </div>
    </li>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null); // null | {} (нов) | product
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await adminApi.listProducts();
      setProducts(data.products);
      setCategories(data.categories);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => `${p.name} ${p.category}`.toLowerCase().includes(q));
  }, [products, query]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const p of filtered) {
      const key = p.category || 'Без категорија';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(p);
    }
    return [...map.entries()];
  }, [filtered]);

  const handleSaved = () => {
    setEditing(null);
    load();
  };

  const toggleStock = async (product) => {
    setBusyId(product.id);
    try {
      const { product: updated } = await adminApi.updateProduct(product.id, { in_stock: !product.in_stock });
      setProducts((list) => list.map((p) => (p.id === updated.id ? updated : p)));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (product) => {
    if (!window.confirm(`Да се избрише „${product.name}“? Ова не може да се врати.`)) return;
    setBusyId(product.id);
    try {
      await adminApi.deleteProduct(product.id);
      setProducts((list) => list.filter((p) => p.id !== product.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Производи</h1>
          <p className="text-sm text-slate-500">{products.length} вкупно</p>
        </div>
        <button type="button" onClick={() => setEditing({})} className="btn-primary">
          <PlusIcon />
          <span className="hidden sm:inline">Нов производ</span>
          <span className="sm:hidden">Нов</span>
        </button>
      </div>

      {products.length > 0 && (
        <label className="relative mt-5 block">
          <span className="sr-only">Пребарај</span>
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input type="search" className="input bg-white pl-11" placeholder="Пребарај производи…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
      )}

      <div className="mt-4">
        <Alert>{error}</Alert>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-navy-800">
          <Spinner className="h-8 w-8" />
        </div>
      ) : products.length === 0 ? (
        <div className="mt-4 rounded-2xl bg-white px-6 py-14 text-center ring-1 ring-slate-100">
          <p className="text-lg font-semibold text-navy-900">Додајте го првиот производ</p>
          <p className="mt-1 text-sm text-slate-500">Слика, име и цена – тоа е сè што треба.</p>
          <button type="button" onClick={() => setEditing({})} className="btn-teal mt-6">
            <PlusIcon />
            Додај производ
          </button>
        </div>
      ) : (
        <div className="mt-2 space-y-6">
          {grouped.map(([category, items]) => (
            <section key={category}>
              <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {category} · {items.length}
              </h2>
              <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-slate-100">
                {items.map((p) => (
                  <ProductRow
                    key={p.id}
                    product={p}
                    busy={busyId === p.id}
                    onEdit={setEditing}
                    onToggleStock={toggleStock}
                    onDelete={remove}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {editing && (
        <ProductFormModal
          product={editing.id ? editing : null}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
