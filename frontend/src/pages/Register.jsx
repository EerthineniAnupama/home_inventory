import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!form.email.trim()) next.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) next.email = 'Enter a valid email';
    if (!form.password) next.password = 'Password is required';
    else if (form.password.length < 6) next.password = 'Must be at least 6 characters';
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.response?.data?.error || 'Registration failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <BrandPanel />

      <div className="flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-display font-bold text-zinc-900">Create your account</h1>
          <p className="mt-1 text-sm text-zinc-500">Start cataloging in a couple of minutes.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
            <Field
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="Jane Doe"
            />
            <Field
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="you@example.com"
            />
            <Field
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="••••••••"
            />
            <Field
              label="Confirm password"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="••••••••"
            />

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
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-sm text-zinc-500">
            Already have an account?{' '}
            <Link to="/login" className="text-accent font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Small reusable field - avoids repeating label/input/error markup 4 times
function Field({ label, name, type = 'text', value, onChange, error, placeholder }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-zinc-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-zinc-900 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
      />
      {error && <p className="mt-1 text-xs text-status-danger">{error}</p>}
    </div>
  );
}

function BrandPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between bg-zinc-900 text-white px-12 py-12 relative overflow-hidden">
      <div>
        <span className="font-display font-bold text-lg">Home Inventory</span>
      </div>

      <div className="relative h-56 flex items-center justify-center">
        <div className="absolute w-40 h-24 rounded-card bg-zinc-800 border border-zinc-700 rotate-6 shadow-card" />
        <div className="absolute w-40 h-24 rounded-card bg-zinc-800 border border-zinc-700 -rotate-3 -translate-x-6 shadow-card" />
        <div className="absolute w-40 h-24 rounded-card bg-zinc-700 border border-zinc-600 shadow-card-hover flex flex-col justify-between p-3">
          <span className="text-[10px] uppercase tracking-wide text-zinc-400">Item #0143</span>
          <span className="font-mono text-xs text-zinc-200">SN-77410-C</span>
        </div>
      </div>

      <div>
        <p className="font-display text-2xl font-semibold leading-snug">
          One place for
          <br />
          everything you own.
        </p>
        <p className="mt-2 text-sm text-zinc-400">
          Free up drawer space for receipts. We'll remember instead.
        </p>
      </div>
    </div>
  );
}