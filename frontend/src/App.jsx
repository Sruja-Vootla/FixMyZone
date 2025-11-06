import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Home from "./pages/Home/Home";
import Issues from "./pages/Issues/Issues";
import IssueDetail from "./pages/IssueDetail/IssueDetail";
import Dashboard from "./pages/Dashboard/Dashboard";
import Admin from "./pages/Admin/Admin";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import ReportIssue from "./pages/ReportIssue/ReportIssue";
import AdminEditIssue from "./pages/Admin/AdminEditIssue";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import NavbarAdmin from "./components/layout/NavbarAdmin";
import NavbarUnauthorized from "./components/layout/NavbarUnauthorized";
import NavbarAuthorized from "./components/layout/NavbarAuthorized";
import Footer from "./components/layout/Footer";
import ContactUs from "./components/layout/ContactUs";
import AdminUsers from "./pages/Admin/Users";

export default function App() {
  const { user, loading } = useAuth();
  
  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.email?.toLowerCase().includes('admin');
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <BrowserRouter>
      <div className="min-h-screen text-white font-inter flex flex-col">
        {/* conditional navbar */}
        {isAdmin ? (
          <NavbarAdmin />
        ) : user ? (
          <NavbarAuthorized />
        ) : (
          <NavbarUnauthorized />
        )}
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/issues" element={<Issues />} />
            <Route path="/issues/:id" element={<IssueDetail />} />
            <Route path="/contact" element={<ContactUs />} />
            
            {/* Auth routes - redirect to dashboard if already logged in */}
            <Route 
              path="/login" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <Login />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <Signup />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected routes - require authentication */}
            <Route 
              path="/report" 
              element={
                <ProtectedRoute requireAuth={true}>
                  <ReportIssue />
                </ProtectedRoute>
              } 
            />
            
            {/* Dashboard - redirect admins to /admin, regular users stay */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute requireAuth={true}>
                  {isAdmin ? <Navigate to="/admin" replace /> : <Dashboard />}
                </ProtectedRoute>
              } 
            />
            
            {/* Admin route - only accessible to admins */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAuth={true} requireAdmin={true}>
                  <Admin />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/admin/edit/:id"
              element={
                <ProtectedRoute requireAuth={true} requireAdmin={true}>
                  <AdminEditIssue />
                </ProtectedRoute>
              } 
            />

            {/* Admin Users route - only accessible to admins */}
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute requireAuth={true} requireAdmin={true}>
                  <AdminUsers />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}