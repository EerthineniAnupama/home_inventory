import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function Navbar() {
  const { user } = useAuth();

  const initial = user?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-4 mt-14 lg:mt-0">
      <div>
        <p className="text-sm text-zinc-500">Welcome back,</p>
        <h2 className="font-display font-semibold text-zinc-900">{user?.name || '...'}</h2>
      </div>

      <Link
        to="/profile"
        className="h-9 w-9 rounded-full bg-accent text-white flex items-center justify-center font-medium text-sm hover:bg-accent-hover transition-colors"
        title="View profile"
      >
        {initial}
      </Link>
    </header>
  );
}