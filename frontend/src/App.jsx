import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Pages
import Home from "./pages/Home/Home";
import Issues from "./pages/Issues/Issues";
import IssueDetail from "./pages/IssueDetail/IssueDetail";
import Dashboard from "./pages/Dashboard/Dashboard";
import Admin from "./pages/Admin/Admin";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import ReportIssue from "./pages/ReportIssue/ReportIssue";

// Layout
import NavbarAdmin from "./components/layout/NavbarAdmin";
import NavbarUnauthorized from "./components/layout/NavbarUnauthorized";
import NavbarAuthorized from "./components/layout/NavbarAuthorized";
import Footer from "./components/layout/Footer";

export default function App() {
  const { user } = useAuth();
  
  // Check if user is admin based on role or email
  const isAdmin = user?.role === 'admin' || user?.email?.includes('admin');
  
  return (
    <BrowserRouter>
      <div className="min-h-screen text-white font-inter flex flex-col">
        {/* Conditionally render navbar based on user role */}
        {isAdmin ? <NavbarAdmin /> : user ? <NavbarAuthorized /> : <NavbarUnauthorized />}
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/issues" element={<Issues />} />
            <Route path="/issues/:id" element={<IssueDetail />} />
            
            {/* Protected Dashboard route - only for logged-in non-admin users */}
            <Route 
              path="/dashboard" 
              element={
                !user ? <Navigate to="/login" replace /> :
                isAdmin ? <Navigate to="/admin" replace /> : 
                <Dashboard />
              } 
            />
            
            {/* Admin route - only accessible to admins */}
            <Route 
              path="/admin" 
              element={
                !user ? <Navigate to="/login" replace /> :
                isAdmin ? <Admin /> : 
                <Navigate to="/dashboard" replace />
              } 
            />
            
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/report" element={<ReportIssue />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}