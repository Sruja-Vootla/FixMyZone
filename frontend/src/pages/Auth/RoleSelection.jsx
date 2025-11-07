// frontend/src/pages/Auth/RoleSelection.jsx
import { useNavigate } from "react-router-dom";
import { FaUser, FaUserShield } from "react-icons/fa";

export default function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome to FixMyZone
          </h1>
          <p className="text-xl text-gray-200">
            Choose how you'd like to continue
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* User Card */}
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-8 border border-white/20 transform transition-all hover:scale-105 hover:bg-white/25 group">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FaUser className="text-white text-4xl" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  I'm a Citizen
                </h2>
                <p className="text-gray-200 leading-relaxed">
                  Report issues, vote on problems, track resolutions, and help improve your community
                </p>
              </div>

              <div className="flex flex-col gap-3 w-full mt-6">
                <button 
                  onClick={() => navigate("/login/user")}
                  className="w-full bg-gradient-to-b from-[#00b4db] to-[#0083b0] text-white py-3 rounded-full font-semibold hover:scale-105 transition-transform"
                >
                  Login as Citizen
                </button>
                <button 
                  onClick={() => navigate("/signup/user")}
                  className="w-full bg-white/20 border-2 border-[#00b4db] text-white py-3 rounded-full font-semibold hover:scale-105 hover:bg-white/30 transition-all"
                >
                  Sign Up as Citizen
                </button>
              </div>
            </div>
          </div>

          {/* Admin Card */}
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-8 border border-white/20 transform transition-all hover:scale-105 hover:bg-white/25 group">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FaUserShield className="text-white text-4xl" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  I'm an Administrator
                </h2>
                <p className="text-gray-200 leading-relaxed">
                  Manage issues, oversee resolutions, analyze data, and coordinate community responses
                </p>
              </div>

              <div className="flex flex-col gap-3 w-full mt-6">
                <button 
                  onClick={() => navigate("/login/admin")}
                  className="w-full bg-gradient-to-b from-purple-500 to-purple-700 text-white py-3 rounded-full font-semibold hover:scale-105 transition-transform"
                >
                  Login as Admin
                </button>
                <button 
                  onClick={() => navigate("/signup/admin")}
                  className="w-full bg-white/20 border-2 border-purple-500 text-white py-3 rounded-full font-semibold hover:scale-105 hover:bg-white/30 transition-all"
                >
                  Sign Up as Admin
                </button>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-white/70 mt-8 text-sm">
          Need help? Contact{" "}
          <button
            onClick={() => navigate("/contact")}
            className="text-cyan-300 hover:text-cyan-200 underline font-medium"
          >
            support
          </button>
        </p>
      </div>
    </div>
  );
}