import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar() {
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-accent-light text-accent'
        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
    }`;

  return (
    <>
      {/* Mobile top bar with hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between bg-surface border-b border-border px-4 py-3">
        <span className="font-display font-bold text-zinc-900">Home Inventory</span>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-zinc-100"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar itself - fixed on desktop, slide-in drawer on mobile */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-surface border-r border-border flex flex-col p-4 z-50 transition-transform lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between mb-8 px-1">
          <span className="font-display font-bold text-zinc-900">Home Inventory</span>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-zinc-100"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkClass} onClick={() => setMobileOpen(false)}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={logout}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-red-50 hover:text-status-danger transition-colors"
        >
          <LogOut size={18} />
          Log out
        </button>
      </aside>
    </>
  );
}