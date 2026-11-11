import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FormField, { Alert } from '../../components/admin/FormField';
import { Spinner } from '../../components/StateViews';
import { slugify } from '../../utils/format';
import { normalizePhone } from '../../utils/orderMessage';
import AuthShell from './AuthShell';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ store_name: '', slug: '', phone: '', name: '', email: '', password: '' });
  const [slugEdited, setSlugEdited] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => {
    const value = e.target.value;
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (field === 'store_name' && !slugEdited) next.slug = slugify(value);
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const clientErrors = {};
    if (form.store_name.trim().length < 2) clientErrors.store_name = 'Внесете име на продавницата.';
    if (form.slug && !/^[a-z0-9](?:[a-z0-9-]{1,48}[a-z0-9])?$/.test(form.slug)) {
      clientErrors.slug = 'Само мали латинични букви, бројки и цртичка (3–50 знаци).';
    }
    if (!normalizePhone(form.phone)) clientErrors.phone = 'Внесете валиден број, пр. 070 123 456.';
    if (form.name.trim().length < 2) clientErrors.name = 'Внесете го вашето име.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) clientErrors.email = 'Внесете валидна е-пошта.';
    if (form.password.length < 8) clientErrors.password = 'Лозинката мора да има најмалку 8 знаци.';
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;

    setLoading(true);
    try {
      await register({
        store_name: form.store_name.trim(),
        slug: form.slug.trim(),
        phone: form.phone.trim(),
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      navigate('/admin/products', { replace: true });
    } catch (err) {
      setErrors(err.details ?? {});
      setError(err.message);
      setLoading(false);
    }
  };

  const origin = typeof window !== 'undefined' ? window.location.host : 'catalog.mk';

  return (
    <AuthShell
      title="Креирај продавница"
      subtitle="Бесплатно, за помалку од минута."
      footer={
        <>
          Веќе имате сметка?{' '}
          <Link to="/admin/login" className="font-semibold text-navy-800 hover:underline">
            Најавете се
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField id="store_name" label="Име на продавницата" error={errors.store_name}>
          <input id="store_name" className={`input ${errors.store_name ? 'input-error' : ''}`} value={form.store_name} onChange={set('store_name')} placeholder="пр. Пекара Жито" />
        </FormField>

        <FormField id="slug" label="Линк до каталогот" hint={`${origin}/${form.slug || 'vashata-prodavnica'}`} error={errors.slug}>
          <div className="flex items-center rounded-xl bg-slate-50 ring-1 ring-inset ring-slate-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-teal-400">
            <span className="pl-4 text-sm text-slate-400">/</span>
            <input
              id="slug"
              className="w-full border-0 bg-transparent px-1 py-3 text-navy-900 focus:outline-none"
              value={form.slug}
              onChange={(e) => {
                setSlugEdited(true);
                setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }));
              }}
              placeholder="pekara-zhito"
            />
          </div>
        </FormField>

        <FormField id="phone" label="Viber број на продавницата" hint="Тука ќе пристигнуваат нарачките." error={errors.phone}>
          <input id="phone" type="tel" inputMode="tel" className={`input ${errors.phone ? 'input-error' : ''}`} value={form.phone} onChange={set('phone')} placeholder="070 123 456" />
        </FormField>

        <div className="border-t border-slate-100 pt-4" />

        <FormField id="name" label="Ваше име" error={errors.name}>
          <input id="name" autoComplete="name" className={`input ${errors.name ? 'input-error' : ''}`} value={form.name} onChange={set('name')} />
        </FormField>
        <FormField id="email" label="Е-пошта" error={errors.email}>
          <input id="email" type="email" autoComplete="email" className={`input ${errors.email ? 'input-error' : ''}`} value={form.email} onChange={set('email')} />
        </FormField>
        <FormField id="password" label="Лозинка" hint="Најмалку 8 знаци." error={errors.password}>
          <input id="password" type="password" autoComplete="new-password" className={`input ${errors.password ? 'input-error' : ''}`} value={form.password} onChange={set('password')} />
        </FormField>

        <Alert>{error}</Alert>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
          {loading && <Spinner />}
          Креирај продавница
        </button>
      </form>
    </AuthShell>
  );
}
