import { useState } from 'react';
import { adminApi, authApi } from '../../api/adminApi';
import FormField, { Alert, Toggle } from '../../components/admin/FormField';
import ImageUpload from '../../components/admin/ImageUpload';
import { CheckIcon, CopyIcon } from '../../components/Icons';
import { Spinner } from '../../components/StateViews';
import { useAuth } from '../../context/AuthContext';

const toForm = (store) => ({
  name: store.name ?? '',
  slug: store.slug ?? '',
  description: store.description ?? '',
  logo_url: store.logo_url ?? '',
  phone: store.phone_display ?? '',
  viber_phone: store.raw_viber_phone ? store.viber_phone_display : '',
  address: store.address ?? '',
  city: store.city ?? '',
  working_hours: store.working_hours ?? '',
  delivery_fee: String(store.delivery_fee ?? 0),
  free_delivery_from: String(store.free_delivery_from ?? 0),
  min_order: String(store.min_order ?? 0),
  is_active: store.is_active !== false,
});

function Card({ title, children }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-slate-100 md:p-6">
      <h2 className="mb-4 text-base font-bold text-navy-900">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function ShareLink({ slug }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/${slug}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* игнорирај */
    }
  };
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-navy-800 p-2 pl-4 text-white">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-navy-200">Линк до вашиот каталог</p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="block truncate text-sm font-semibold hover:underline">
          {url}
        </a>
      </div>
      <button type="button" onClick={copy} className="btn-teal shrink-0 px-3 py-2">
        {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon />}
        {copied ? 'Копирано' : 'Копирај'}
      </button>
    </div>
  );
}

function PasswordForm() {
  const [form, setForm] = useState({ current_password: '', new_password: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    if (form.new_password.length < 8) {
      setErrors({ new_password: 'Најмалку 8 знаци.' });
      return;
    }
    setSaving(true);
    try {
      await authApi.changePassword(form);
      setForm({ current_password: '', new_password: '' });
      setErrors({});
      setMessage({ type: 'success', text: 'Лозинката е променета.' });
    } catch (err) {
      setErrors(err.details ?? {});
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <FormField id="current_password" label="Тековна лозинка" error={errors.current_password}>
          <input id="current_password" type="password" autoComplete="current-password" className="input" value={form.current_password} onChange={(e) => setForm((f) => ({ ...f, current_password: e.target.value }))} />
        </FormField>
        <FormField id="new_password" label="Нова лозинка" error={errors.new_password}>
          <input id="new_password" type="password" autoComplete="new-password" className="input" value={form.new_password} onChange={(e) => setForm((f) => ({ ...f, new_password: e.target.value }))} />
        </FormField>
      </div>
      <Alert type={message.type || 'error'}>{message.text}</Alert>
      <button type="submit" disabled={saving || !form.current_password} className="btn-ghost">
        {saving && <Spinner />}
        Промени лозинка
      </button>
    </form>
  );
}

export default function Settings() {
  const { store, setStore } = useAuth();
  const [form, setForm] = useState(() => toForm(store));
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e?.target ? e.target.value : e }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setSaving(true);
    try {
      const { store: updated } = await adminApi.updateStore({
        ...form,
        slug: form.slug.trim().toLowerCase(),
        delivery_fee: Number(form.delivery_fee) || 0,
        free_delivery_from: Number(form.free_delivery_from) || 0,
        min_order: Number(form.min_order) || 0,
      });
      setStore(updated);
      setForm(toForm(updated));
      setErrors({});
      setMessage({ type: 'success', text: 'Промените се зачувани.' });
    } catch (err) {
      setErrors(err.details ?? {});
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const input = (id, props = {}) => (
    <input id={id} className={`input ${errors[id] ? 'input-error' : ''}`} value={form[id]} onChange={set(id)} {...props} />
  );

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <h1 className="text-2xl font-bold text-navy-900">Поставки</h1>
      <ShareLink slug={store.slug} />

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Card title="Продавница">
          <ImageUpload value={form.logo_url} onChange={set('logo_url')} label="Лого" shape="round" />
          <FormField id="name" label="Име" error={errors.name}>
            {input('name')}
          </FormField>
          <FormField id="slug" label="Линк" hint={`${window.location.host}/${form.slug}`} error={errors.slug}>
            {input('slug', { onChange: (e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })) })}
          </FormField>
          <FormField id="description" label="Опис" error={errors.description}>
            <textarea id="description" rows={2} className="input resize-none" value={form.description} onChange={set('description')} />
          </FormField>
          <Toggle checked={form.is_active} onChange={set('is_active')} label="Каталогот е јавен" description="Исклучете за привремено да го затворите каталогот." />
        </Card>

        <Card title="Контакт и Viber">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField id="phone" label="Телефон" error={errors.phone}>
              {input('phone', { type: 'tel', inputMode: 'tel', placeholder: '070 123 456' })}
            </FormField>
            <FormField id="viber_phone" label="Viber број (ако е различен)" hint="Празно = се користи телефонот." error={errors.viber_phone}>
              {input('viber_phone', { type: 'tel', inputMode: 'tel', placeholder: '070 123 456' })}
            </FormField>
            <FormField id="address" label="Адреса" error={errors.address}>
              {input('address')}
            </FormField>
            <FormField id="city" label="Град" error={errors.city}>
              {input('city', { placeholder: 'Скопје' })}
            </FormField>
          </div>
          <FormField id="working_hours" label="Работно време" error={errors.working_hours}>
            {input('working_hours', { placeholder: 'Пон–Саб 08:00–20:00' })}
          </FormField>
        </Card>

        <Card title="Достава и нарачки">
          <div className="grid gap-4 md:grid-cols-3">
            <FormField id="delivery_fee" label="Цена за достава (ден.)" error={errors.delivery_fee}>
              {input('delivery_fee', { type: 'number', min: 0, step: 1, inputMode: 'numeric' })}
            </FormField>
            <FormField id="free_delivery_from" label="Бесплатна достава над" hint="0 = исклучено" error={errors.free_delivery_from}>
              {input('free_delivery_from', { type: 'number', min: 0, step: 1, inputMode: 'numeric' })}
            </FormField>
            <FormField id="min_order" label="Минимална нарачка" hint="0 = нема" error={errors.min_order}>
              {input('min_order', { type: 'number', min: 0, step: 1, inputMode: 'numeric' })}
            </FormField>
          </div>
        </Card>

        <div className="sticky bottom-20 z-10 space-y-3 md:bottom-4">
          <Alert type={message.type || 'error'}>{message.text}</Alert>
          <button type="submit" disabled={saving} className="btn-primary w-full py-3.5 shadow-lg md:w-auto md:px-8">
            {saving && <Spinner />}
            Зачувај промени
          </button>
        </div>
      </form>

      <Card title="Безбедност">
        <PasswordForm />
      </Card>
    </div>
  );
}
