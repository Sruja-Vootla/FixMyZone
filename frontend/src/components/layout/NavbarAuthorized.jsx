
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaUserCircle } from "react-icons/fa";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';

export default function NavbarAuthorized() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(); // Add this

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleScrollNav = (hash) => {
    navigate("/");
    setTimeout(() => {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <header className="w-full bg-white/15 bg-nav-gradient border-b border-white/20">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-[72px] text-white">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold">
          FixMyZone
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex gap-8 text-lg">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `hover:text-cyan-300 transition ${
                isActive ? "font-semibold border-b-2 border-cyan-300" : ""
              }`
            }
          >
            {t('nav.dashboard', 'Dashboard')} {/* Updated */}
          </NavLink>

          <NavLink
            to="/my-reports"
            className={({ isActive }) =>
              `hover:text-cyan-300 transition ${
                isActive ? "font-semibold border-b-2 border-cyan-300" : ""
              }`
            }
          >
            {t('dashboard.myReports', 'My Reports')} {/* Updated */}
          </NavLink>

          <NavLink
            to="/issues"
            className={({ isActive }) =>
              `hover:text-cyan-300 transition ${
                isActive ? "font-semibold border-b-2 border-cyan-300" : ""
              }`
            }
          >
            {t('nav.issues', 'View Issues')} {/* Updated */}
          </NavLink>

          {/* Map scroll */}
          <button
            onClick={() => handleScrollNav("map")}
            className="hover:text-cyan-300 transition"
          >
            {t('dashboard.mapView', 'Map')} {/* Updated */}
          </button>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Report button */}
          <Link
            to="/report"
            className="bg-gradient-to-b from-[#00b4db] to-[#0083b0] px-4 py-2 rounded-full font-semibold"
          >
            {t('nav.report', 'Report Issue')} {/* Updated */}
          </Link>

          {/* Avatar icon */}
          <FaUserCircle className="text-3xl text-white/80" />
        </div>
      </div>
    </header>
  );
}








// import { Link, NavLink, useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
// import { FaUserCircle } from "react-icons/fa";

// export default function NavbarAuthorized() {
//   const { logout } = useAuth();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();          // clear auth context
//     navigate("/");     // redirect to landing page
//   };

//   const handleScrollNav = (hash) => {
//     navigate("/"); // go to homepage first
//     setTimeout(() => {
//       const el = document.getElementById(hash);
//       if (el) {
//         el.scrollIntoView({ behavior: "smooth" });
//       }
//     }, 100);
//   };

//   return (
//     <header className=" w-full bg-white/15 bg-nav-gradient border-b border-white/20">
//       <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-[72px] text-white">
//         {/* Logo */}
//         <Link to="/" className="text-2xl font-bold">
//           FixMyZone
//         </Link>

//         {/* Navigation */}
//         <nav className="hidden md:flex gap-8 text-lg">
//           <NavLink
//             to="/dashboard"
//             className={({ isActive }) =>
//               `hover:text-cyan-300 transition ${
//                 isActive ? "font-semibold border-b-2 border-cyan-300" : ""
//               }`
//             }
//           >
//             Dashboard
//           </NavLink>

//           <NavLink
//             to="/my-reports"
//             className={({ isActive }) =>
//               `hover:text-cyan-300 transition ${
//                 isActive ? "font-semibold border-b-2 border-cyan-300" : ""
//               }`
//             }
//           >
//             My Reports
//           </NavLink>

//           <NavLink
//             to="/issues"
//             className={({ isActive }) =>
//               `hover:text-cyan-300 transition ${
//                 isActive ? "font-semibold border-b-2 border-cyan-300" : ""
//               }`
//             }
//           >
//             View Issues
//           </NavLink>

//           {/* Map scroll */}
//           <button
//             onClick={() => handleScrollNav("map")}
//             className="hover:text-cyan-300 transition"
//           >
//             Map
//           </button>
//         </nav>

//         {/* Right side */}
//         <div className="flex items-center gap-4">
//           {/* Report button */}
//           <Link
//             to="/report"
//             className="bg-gradient-to-b from-[#00b4db] to-[#0083b0] px-4 py-2 rounded-full font-semibold"
//           >
//             Report Issue
//           </Link>

//           {/* Avatar icon */}
//           <FaUserCircle className="text-3xl text-white/80" />
//         </div>
//       </div>
//     </header>
//   );
// }
