import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';

export default function Profile() {
  const { user, refreshProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSuccessMessage(''); // editing again should clear the old "saved" message
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!form.email.trim()) next.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) next.email = 'Enter a valid email';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      await refreshProfile(form); // hits PUT /api/auth/me, updates context.user
      setSuccessMessage('Profile updated.');
    } catch (err) {
      setServerError(err.response?.data?.error || 'Could not update profile. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const initial = user?.name?.charAt(0)?.toUpperCase() || '?';
  const joinedDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : null;

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-xl font-display font-bold text-zinc-900">Profile</h1>

      <div className="bg-surface border border-border rounded-card shadow-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-14 w-14 rounded-full bg-accent text-white flex items-center justify-center font-display font-semibold text-lg">
            {initial}
          </div>
          <div>
            <p className="font-medium text-zinc-900">{user?.name}</p>
            {joinedDate && <p className="text-xs text-zinc-400">Member since {joinedDate}</p>}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-700">
              Name
            </label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-zinc-900 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
            />
            {errors.name && <p className="mt-1 text-xs text-status-danger">{errors.name}</p>}
          </div>

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
            />
            {errors.email && <p className="mt-1 text-xs text-status-danger">{errors.email}</p>}
          </div>

          {serverError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-status-danger">
              {serverError}
            </div>
          )}
          {successMessage && (
            <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-status-active">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-accent hover:bg-accent-hover transition-colors text-white text-sm font-medium px-5 py-2.5 disabled:opacity-60"
          >
            {submitting ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>

      <div className="bg-surface border border-border rounded-card shadow-card p-6">
        <p className="text-sm font-medium text-zinc-900">Session</p>
        <p className="text-xs text-zinc-500 mt-1">Log out of your account on this device.</p>
        <button
          onClick={handleLogout}
          className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 text-status-danger hover:bg-red-50 transition-colors text-sm font-medium px-4 py-2"
        >
          <LogOut size={15} />
          Log out
        </button>
      </div>
    </div>
  );
}