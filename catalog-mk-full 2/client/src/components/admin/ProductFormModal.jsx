import { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { Spinner } from '../StateViews';
import { CloseIcon } from '../Icons';
import FormField, { Alert, Toggle } from './FormField';
import ImageUpload from './ImageUpload';

const EMPTY = {
  name: '',
  description: '',
  price: '',
  image_url: '',
  category: '',
  unit: 'парче',
  in_stock: true,
  is_active: true,
  sort_order: 0,
};

const UNITS = ['парче', 'кг', 'г', 'л', 'пакет', 'кутија', 'порција'];

/**
 * Модал за креирање/уредување производ.
 * @param {{product?: object|null, categories: string[], onClose: () => void, onSaved: (p) => void}} props
 */
export default function ProductFormModal({ product, categories, onClose, onSaved }) {
  const isEdit = Boolean(product?.id);
  const [form, setForm] = useState(() => (product ? { ...EMPTY, ...product, image_url: product.image_url ?? '' } : EMPTY));
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e?.target ? e.target.value : e }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const clientErrors = {};
    if (form.name.trim().length < 2) clientErrors.name = 'Внесете име на производот.';
    if (form.price === '' || !Number.isInteger(Number(form.price)) || Number(form.price) < 0) {
      clientErrors.price = 'Внесете цена во денари (цел број).';
    }
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      image_url: form.image_url || '',
      category: form.category.trim(),
      unit: form.unit.trim() || 'парче',
      in_stock: form.in_stock,
      is_active: form.is_active,
      sort_order: Number(form.sort_order) || 0,
    };

    setSaving(true);
    try {
      const { product: saved } = isEdit
        ? await adminApi.updateProduct(product.id, payload)
        : await adminApi.createProduct(payload);
      onSaved(saved);
    } catch (err) {
      setErrors(err.details ?? {});
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 animate-fade-in bg-navy-900/50 backdrop-blur-sm" onClick={onClose} aria-label="Затвори" tabIndex={-1} />

      <form
        onSubmit={handleSubmit}
        noValidate
        className="relative flex max-h-[94dvh] w-full animate-slide-up flex-col rounded-t-3xl bg-white shadow-sheet md:max-w-2xl md:animate-fade-in md:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-bold text-navy-900">{isEdit ? 'Уреди производ' : 'Нов производ'}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Затвори">
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="grid gap-5 md:grid-cols-[180px_1fr]">
            <ImageUpload value={form.image_url} onChange={set('image_url')} label="Слика" />

            <div className="space-y-4">
              <FormField id="p-name" label="Име *" error={errors.name}>
                <input id="p-name" className={`input ${errors.name ? 'input-error' : ''}`} value={form.name} onChange={set('name')} placeholder="пр. Бел леб 500г" />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField id="p-price" label="Цена (ден.) *" error={errors.price}>
                  <input
                    id="p-price"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    className={`input ${errors.price ? 'input-error' : ''}`}
                    value={form.price}
                    onChange={set('price')}
                    placeholder="45"
                  />
                </FormField>
                <FormField id="p-unit" label="Единица" error={errors.unit}>
                  <input id="p-unit" list="units" className="input" value={form.unit} onChange={set('unit')} />
                  <datalist id="units">
                    {UNITS.map((u) => (
                      <option key={u} value={u} />
                    ))}
                  </datalist>
                </FormField>
              </div>

              <FormField id="p-category" label="Категорија" hint="Изберете постоечка или напишете нова." error={errors.category}>
                <input id="p-category" list="categories" className="input" value={form.category} onChange={set('category')} placeholder="пр. Леб" />
                <datalist id="categories">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </FormField>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <FormField id="p-desc" label="Опис" error={errors.description}>
              <textarea id="p-desc" rows={3} className="input resize-none" value={form.description} onChange={set('description')} placeholder="Краток опис на производот" />
            </FormField>

            <FormField id="p-sort" label="Редослед" hint="Помал број = повисоко во каталогот." error={errors.sort_order}>
              <input id="p-sort" type="number" step="1" className="input max-w-[140px]" value={form.sort_order} onChange={set('sort_order')} />
            </FormField>

            <div className="space-y-4 rounded-2xl bg-slate-50 p-4">
              <Toggle checked={form.in_stock} onChange={set('in_stock')} label="На залиха" description="Купувачите можат да го нарачаат." />
              <Toggle checked={form.is_active} onChange={set('is_active')} label="Видлив во каталогот" description="Исклучете за привремено да го скриете." />
            </div>

            <Alert>{error}</Alert>
          </div>
        </div>

        <div className="pb-safe flex gap-3 border-t border-slate-100 px-5 pt-4 md:pb-4">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">
            Откажи
          </button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving && <Spinner />}
            {isEdit ? 'Зачувај' : 'Додај производ'}
          </button>
        </div>
      </form>
    </div>
  );
}
