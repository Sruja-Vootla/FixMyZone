import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import { useTranslation } from 'react-i18next'; // ADDED

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(); // ADDED

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!name.trim()) {
      setError(t('auth.nameRequired', "Name is required")); // UPDATED
      return;
    }
    if (!email.trim()) {
      setError(t('auth.emailRequired', "Email is required")); // UPDATED
      return;
    }
    if (!email.includes("@")) {
      setError(t('auth.emailInvalid', "Enter a valid email address")); // UPDATED
      return;
    }
    if (!password) {
      setError(t('auth.passwordRequired', "Password is required")); // UPDATED
      return;
    }
    if (password.length < 6) {
      setError(t('auth.passwordMinLength', "Password must be at least 6 characters")); // UPDATED
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch', "Passwords do not match")); // UPDATED
      return;
    }

    try {
      setLoading(true);
      await signup(name, email, password);
      navigate("/dashboard");
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message || t('auth.signupError', "Failed to create account. Please try again.")); // UPDATED
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    alert(t('auth.googleSignupComingSoon', "Google Sign Up coming soon!")); // UPDATED
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white/15 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-8 flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-center text-white">FixMyZone</h1>
        <h2 className="text-2xl font-semibold text-center text-white">{t('auth.signup')}</h2>
        <p className="text-gray-200 text-sm text-center">{t('auth.createAccount', "Create your account to start reporting issues")}</p>

        {error && (
          <div className="w-full bg-red-500/80 text-white text-sm p-3 rounded-md text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-4">
          <input
            type="text"
            placeholder={t('auth.namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00b4db]"
            disabled={loading}
          />

          <input
            type="email"
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00b4db]"
            disabled={loading}
          />

          <input
            type="password"
            placeholder={t('auth.createPassword', "Create Password (min. 6 characters)")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00b4db]"
            disabled={loading}
          />

          <input
            type="password"
            placeholder={t('auth.confirmPassword', "Confirm Password")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00b4db]"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-b from-[#00b4db] to-[#0083b0] text-white font-semibold py-3 rounded-full shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
          >
            {loading ? t('auth.signingUp') : t('auth.signupButton')}
          </button>

          <div className="flex items-center gap-4 w-full text-gray-300 text-sm">
            <div className="flex-1 h-px bg-gray-300" />
            <span>{t('common.or', 'or')}</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignUp}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-medium py-3 rounded-full shadow-md hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            <FaGoogle className="text-lg" />
            {t('auth.continueWithGoogle', 'Continue with Google')}
          </button>
        </form>

        <div className="text-center text-sm text-white">
          {t('auth.haveAccount')}{" "}
          <Link to="/login" className="text-cyan-300 hover:text-cyan-200 underline font-medium">
            {t('auth.loginLink')}
          </Link>
        </div>
      </div>
    </div>
  );
}








// import { useState } from "react";
// import { useAuth } from "../../context/AuthContext";
// import { useNavigate, Link } from "react-router-dom";
// import { FaGoogle } from "react-icons/fa";

// export default function SignUp() {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const { signup } = useAuth();
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     // Validation
//     if (!name.trim()) {
//       setError("Name is required");
//       return;
//     }
//     if (!email.trim()) {
//       setError("Email is required");
//       return;
//     }
//     if (!email.includes("@")) {
//       setError("Enter a valid email address");
//       return;
//     }
//     if (!password) {
//       setError("Password is required");
//       return;
//     }
//     if (password.length < 6) {
//       setError("Password must be at least 6 characters");
//       return;
//     }
//     if (password !== confirmPassword) {
//       setError("Passwords do not match");
//       return;
//     }

//     try {
//       setLoading(true);
//       await signup(name, email, password);
//       navigate("/dashboard");
//     } catch (err) {
//       console.error("Signup error:", err);
//       setError(err.message || "Failed to create account. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGoogleSignUp = () => {
//     alert("Google Sign Up coming soon!");
//   };

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center">
//       <div className="w-full max-w-md bg-white/15 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-8 flex flex-col gap-6">
//         <h1 className="text-3xl font-bold text-center text-white">FixMyZone</h1>
//         <h2 className="text-2xl font-semibold text-center text-white">Sign Up</h2>
//         <p className="text-gray-200 text-sm text-center">Create your account to start reporting issues</p>

//         {error && (
//           <div className="w-full bg-red-500/80 text-white text-sm p-3 rounded-md text-center">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-4">
//           <input
//             type="text"
//             placeholder="Enter Your Name"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00b4db]"
//             disabled={loading}
//           />

//           <input
//             type="email"
//             placeholder="Enter Your Email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00b4db]"
//             disabled={loading}
//           />

//           <input
//             type="password"
//             placeholder="Create Password (min. 6 characters)"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00b4db]"
//             disabled={loading}
//           />

//           <input
//             type="password"
//             placeholder="Confirm Password"
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//             className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00b4db]"
//             disabled={loading}
//           />

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-gradient-to-b from-[#00b4db] to-[#0083b0] text-white font-semibold py-3 rounded-full shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
//           >
//             {loading ? "Creating Account..." : "Sign Up"}
//           </button>

//           <div className="flex items-center gap-4 w-full text-gray-300 text-sm">
//             <div className="flex-1 h-px bg-gray-300" />
//             <span>or</span>
//             <div className="flex-1 h-px bg-gray-300" />
//           </div>

//           <button
//             type="button"
//             onClick={handleGoogleSignUp}
//             className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-medium py-3 rounded-full shadow-md hover:bg-gray-50 transition-colors"
//             disabled={loading}
//           >
//             <FaGoogle className="text-lg" />
//             Continue with Google
//           </button>
//         </form>

//         <div className="text-center text-sm text-white">
//           Already have an account?{" "}
//           <Link to="/login" className="text-cyan-300 hover:text-cyan-200 underline font-medium">
//             Login
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }