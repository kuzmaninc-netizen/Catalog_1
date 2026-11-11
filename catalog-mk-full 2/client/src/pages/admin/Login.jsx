import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FormField, { Alert } from '../../components/admin/FormField';
import { Spinner } from '../../components/StateViews';
import AuthShell from './AuthShell';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email: form.email.trim(), password: form.password });
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Најава"
      subtitle="Управувајте со вашата продавница."
      footer={
        <>
          Немате продавница?{' '}
          <Link to="/admin/register" className="font-semibold text-navy-800 hover:underline">
            Креирајте бесплатно
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField id="email" label="Е-пошта">
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            className="input"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </FormField>
        <FormField id="password" label="Лозинка">
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            className="input"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
        </FormField>
        <Alert>{error}</Alert>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
          {loading && <Spinner />}
          Најави се
        </button>
      </form>
    </AuthShell>
  );
}
