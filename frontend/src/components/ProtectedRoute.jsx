import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';
import Loader from './Loader.jsx';

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  // Still checking localStorage token against GET /auth/me - don't
  // redirect yet, or a logged-in user would flash to /login on refresh.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader label="Checking session…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}