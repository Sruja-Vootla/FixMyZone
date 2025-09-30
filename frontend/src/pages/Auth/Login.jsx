import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.includes("@")) return setError("Enter a valid email address.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");

    try {
      setLoading(true);
      await login(email, password);
      navigate("/dashboard"); // redirect after login
    } catch (err) {
      setError(err.message || "Failed to login.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    alert("Google Login coming soon!");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white/15 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-8 flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-center text-white">FixMyZone</h1>
        <h2 className="text-2xl font-semibold text-center text-white">Login</h2>
        <p className="text-gray-200 text-sm text-center">Welcome back, please log in.</p>

        {error && (
          <div className="w-full bg-red-500/80 text-white text-sm p-2 rounded-md text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-4">
          <input
            type="email"
            placeholder="Enter Registered Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-80 h-12 px-4 rounded-lg bg-white text-gray-900 border border-gray-300"
          />

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-80 h-12 px-4 rounded-lg bg-white text-gray-900 border border-gray-300"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-80 bg-gradient-to-b from-[#00b4db] to-[#0083b0] text-white font-semibold py-3 rounded-full shadow-md disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="flex items-center gap-4 w-80 text-gray-300 text-sm">
            <div className="flex-1 h-px bg-gray-300" />
            <span>or</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-80 flex items-center justify-center gap-3 bg-white text-gray-900 font-medium py-3 rounded-full shadow-md"
          >
            <FaGoogle className="text-lg" />
            Continue with Google
          </button>
        </form>

        <div className="text-center text-sm text-white">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-400 underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
