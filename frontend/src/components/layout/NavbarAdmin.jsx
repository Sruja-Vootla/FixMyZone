import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaUserCircle, FaShieldAlt } from "react-icons/fa";
import LanguageSwitcher from '../LanguageSwitcher';

export default function NavbarAdmin() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="w-full bg-white/15 bg-nav-gradient border-b border-white/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-[72px] text-white">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold flex items-center gap-2 ml-5">
          FixMyZone Admin
        </Link>


        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Admin Badge */}
          <div className="bg-yellow-400/20 border border-yellow-400/50 rounded-full px-3 py-1 text-xs font-semibold text-yellow-400">
            ADMIN
          </div>

          {/* Avatar icon */}
          <FaUserCircle className="text-3xl text-white/80" />
        </div>
      </div>
    </header>
  );
}








// import { Link, NavLink, useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
// import { FaUserCircle, FaShieldAlt } from "react-icons/fa";

// export default function NavbarAdmin() {
//   const { logout } = useAuth();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     navigate("/");
//   };

//   return (
//     <header className="w-full bg-white/15 bg-nav-gradient border-b border-white/20">
//       <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-[72px] text-white">
//         {/* Logo */}
//         <Link to="/" className="text-2xl font-bold flex items-center gap-2 ml-5">
//           FixMyZone Admin
//         </Link>


//         {/* Right side */}
//         <div className="flex items-center gap-4">
//           {/* Admin Badge */}
//           <div className="bg-yellow-400/20 border border-yellow-400/50 rounded-full px-3 py-1 text-xs font-semibold text-yellow-400">
//             ADMIN
//           </div>

//           {/* Avatar icon */}
//           <FaUserCircle className="text-3xl text-white/80" />
//         </div>
//       </div>
//     </header>
//   );
// }