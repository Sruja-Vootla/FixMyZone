import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!name.trim()) return setError("Name is required.");
    if (!email.includes("@")) return setError("Enter a valid email address.");
    if (password.length < 6)
      return setError("Password must be at least 6 characters.");
    if (password !== confirmPassword)
      return setError("Passwords do not match!");

    try {
      setLoading(true);
      await signup(name, email, password); // assumes async
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    // Placeholder — hook to your Firebase/Auth0/Backend OAuth
    alert("Google Sign Up coming soon!");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white/15 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-8 flex flex-col gap-6">
        {/* Logo */}
        <h1 className="text-3xl font-bold text-center text-white">FixMyZone</h1>

        {/* Title */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white">Sign Up</h2>
        </div>

        {/* Error Message */}
        {error && (
          <div className="w-full bg-red-500/80 text-white text-sm p-2 rounded-md text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col items-center gap-4"
        >
          {/* Name */}
          <div className="w-80 flex flex-col gap-1 text-left">
            <label className="text-sm font-medium text-white">Name</label>
            <input
              type="text"
              placeholder="Enter Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 px-4 rounded-lg bg-white text-gray-900 border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-[#00b4db]"
            />
          </div>

          {/* Email */}
          <div className="w-80 flex flex-col gap-1 text-left">
            <label className="text-sm font-medium text-white">Email</label>
            <input
              type="email"
              placeholder="Enter Registered Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 rounded-lg bg-white text-gray-900 border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-[#00b4db]"
            />
          </div>

          {/* Password */}
          <div className="w-80 flex flex-col gap-1 text-left">
            <label className="text-sm font-medium text-white">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 rounded-lg bg-white text-gray-900 border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-[#00b4db]"
            />
          </div>

          {/* Confirm Password */}
          <div className="w-80 flex flex-col gap-1 text-left">
            <label className="text-sm font-medium text-white">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-12 px-4 rounded-lg bg-white text-gray-900 border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-[#00b4db]"
            />
          </div>

          {/* Terms */}
          <div className="flex w-80 items-start gap-2 text-xs text-white">
            <input type="checkbox" className="mt-1 h-4 w-4 rounded border-gray-300" />
            <p>
              By signing up, you agree to our{" "}
              <span className="text-blue-400 underline cursor-pointer">
                Terms
              </span>{" "}
              &{" "}
              <span className="text-blue-400 underline cursor-pointer">
                Privacy Policy
              </span>
              .
            </p>
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-80 bg-gradient-to-b from-[#00b4db] to-[#0083b0] text-white font-semibold py-3 rounded-full shadow-md disabled:opacity-50"
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 w-80 text-gray-300 text-sm">
            <div className="flex-1 h-px bg-gray-300" />
            <span>or</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            className="w-80 flex items-center justify-center gap-3 bg-white text-gray-900 font-medium py-3 rounded-full shadow-md"
          >
            <FaGoogle className="text-lg" />
            Continue with Google
          </button>
        </form>

        {/* Bottom row */}
        <div className="text-center text-sm text-white">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
