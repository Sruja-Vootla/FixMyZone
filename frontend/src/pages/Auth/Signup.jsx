// frontend/src/pages/Auth/Login.jsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link, useParams } from "react-router-dom";
import { FaGoogle, FaUser, FaUserShield, FaArrowLeft } from "react-icons/fa";
import { useTranslation } from 'react-i18next';

export default function Login() {
  const { role } = useParams(); // Get role from URL: /login/user or /login/admin
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isAdmin = role === 'admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!email.trim()) {
      setError(t('auth.errors.emailRequired', "Email is required"));
      return;
    }
    if (!email.includes("@")) {
      setError(t('auth.errors.invalidEmail', "Enter a valid email address"));
      return;
    }
    if (!password) {
      setError(t('auth.errors.passwordRequired', "Password is required"));
      return;
    }
    if (password.length < 6) {
      setError(t('auth.errors.passwordLength', "Password must be at least 6 characters"));
      return;
    }

    // For admin login, check if email contains 'admin'
    if (isAdmin && !email.toLowerCase().includes('admin')) {
      setError(t('auth.errors.adminEmailRequired', "Please use an admin email address"));
      return;
    }

    try {
      setLoading(true);
      const userData = await login(email, password);
      
      // Check if user role matches selected role
      const userIsAdmin = userData.role === 'admin' || userData.email.toLowerCase().includes('admin');
      
      if (isAdmin && !userIsAdmin) {
        setError(t('auth.errors.notAdmin', "This account is not registered as an admin"));
        return;
      }
      
      if (!isAdmin && userIsAdmin) {
        setError(t('auth.errors.useAdminLogin', "Admin accounts should use admin login"));
        return;
      }

      // Redirect based on role
      if (userIsAdmin) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || t('auth.errors.loginFailed', "Failed to login. Please check your credentials."));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    alert(t('auth.googleComingSoon', "Google Login coming soon!"));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
        >
          <FaArrowLeft /> {t('common.backToRoleSelection', 'Back to Role Selection')}
        </button>

        <div className="bg-white/15 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-8 flex flex-col gap-6">
          {/* Header with Role Badge */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                isAdmin 
                  ? 'bg-gradient-to-br from-purple-400 to-purple-600' 
                  : 'bg-gradient-to-br from-blue-400 to-blue-600'
              }`}>
                {isAdmin ? <FaUserShield className="text-white text-2xl" /> : <FaUser className="text-white text-2xl" />}
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white">
              {isAdmin ? t('auth.adminLogin', 'Admin Login') : t('auth.userLogin', 'User Login')}
            </h1>
            <p className="text-gray-200 text-sm mt-2">
              {isAdmin 
                ? t('auth.adminWelcome', 'Access the admin dashboard') 
                : t('auth.welcomeBack', 'Welcome back to FixMyZone')}
            </p>
          </div>

          {error && (
            <div className="w-full bg-red-500/80 text-white text-sm p-3 rounded-md text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-4">
            <input
              type="email"
              placeholder={isAdmin 
                ? t('auth.adminEmailPlaceholder', 'Admin Email Address') 
                : t('auth.emailPlaceholder', 'Enter Your Email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00b4db]"
              disabled={loading}
            />

            <input
              type="password"
              placeholder={t('auth.passwordPlaceholder', 'Enter Password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00b4db]"
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${
                isAdmin 
                  ? 'bg-gradient-to-b from-purple-500 to-purple-700' 
                  : 'bg-gradient-to-b from-[#00b4db] to-[#0083b0]'
              } text-white font-semibold py-3 rounded-full shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform`}
            >
              {loading 
                ? t('auth.loggingIn', 'Logging in...') 
                : t('auth.loginAs', `Login as ${isAdmin ? 'Admin' : 'User'}`, { role: isAdmin ? 'Admin' : 'User' })}
            </button>

            {!isAdmin && (
              <>
                <div className="flex items-center gap-4 w-full text-gray-300 text-sm">
                  <div className="flex-1 h-px bg-gray-300" />
                  <span>{t('common.or', 'or')}</span>
                  <div className="flex-1 h-px bg-gray-300" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-medium py-3 rounded-full shadow-md hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  <FaGoogle className="text-lg" />
                  {t('auth.continueWithGoogle', 'Continue with Google')}
                </button>
              </>
            )}
          </form>

          <div className="text-center text-sm text-white">
            {t('auth.noAccount', "Don't have an account?")}{" "}
            <Link 
              to={`/signup/${role}`} 
              className="text-cyan-300 hover:text-cyan-200 underline font-medium"
            >
              {t('auth.signupLink', 'Sign Up')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}