import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, requireAuth = true, requireAdmin = false }) {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#43c6ac] to-[#191654] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // If route requires authentication and user is not logged in
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  // If route requires admin and user is not admin
  if (requireAdmin) {
    const isAdmin = user?.role === 'admin' || user?.email?.includes('admin');
    if (!isAdmin) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // If user is already logged in and tries to access login/signup
  if (!requireAuth && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}