import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const next = {};
    if (!form.email.trim()) next.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) next.email = 'Enter a valid email';
    if (!form.password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left brand panel - hidden on mobile */}
      <BrandPanel />

      {/* Right form panel */}
      <div className="flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-display font-bold text-zinc-900">Welcome back</h1>
          <p className="mt-1 text-sm text-zinc-500">Log in to your inventory.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-zinc-900 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1 text-xs text-status-danger">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-zinc-900 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-status-danger">{errors.password}</p>
              )}
            </div>

            {serverError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-status-danger">
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-accent hover:bg-accent-hover transition-colors text-white text-sm font-medium py-2.5 disabled:opacity-60"
            >
              {submitting ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <p className="mt-6 text-sm text-zinc-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Decorative brand panel, shared visual language with Register.
// Small stack of tilted "item cards" nods to the cataloging theme
// without needing any real image assets.
function BrandPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between bg-zinc-900 text-white px-12 py-12 relative overflow-hidden">
      <div>
        <span className="font-display font-bold text-lg">Home Inventory</span>
      </div>

      <div className="relative h-56 flex items-center justify-center">
        <div className="absolute w-40 h-24 rounded-card bg-zinc-800 border border-zinc-700 -rotate-6 shadow-card" />
        <div className="absolute w-40 h-24 rounded-card bg-zinc-800 border border-zinc-700 rotate-3 translate-x-6 shadow-card" />
        <div className="absolute w-40 h-24 rounded-card bg-zinc-700 border border-zinc-600 shadow-card-hover flex flex-col justify-between p-3">
          <span className="text-[10px] uppercase tracking-wide text-zinc-400">Item #0142</span>
          <span className="font-mono text-xs text-zinc-200">SN-88213-A</span>
        </div>
      </div>

      <div>
        <p className="font-display text-2xl font-semibold leading-snug">
          Catalog everything.
          <br />
          Restore anything.
        </p>
        <p className="mt-2 text-sm text-zinc-400">
          Every item, receipt, and warranty — backed up and searchable.
        </p>
      </div>
    </div>
  );
}