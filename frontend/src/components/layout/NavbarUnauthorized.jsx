import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function NavbarUnauthorized() {
  const navigate = useNavigate();

  const handleScrollNav = (hash) => {
    navigate("/"); // go to homepage
    setTimeout(() => {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <header
      className=" w-full bg-white/15 h-[72px]
                       bg-gradient-to-b from-[#43c6ac00] to-[#19165400] 
                       border-b border-white/10 text-white font-inter"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between h-full px-6">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold">
          FixMyZone
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-lg">
          {/* How it Works scroll */}
          <button
            onClick={() => handleScrollNav("how-it-works")}
            className="font-semibold hover:text-cyan-300"
          >
            How it Works
          </button>

          {/* Issues page */}
          <Link to="/issues" className="font-semibold hover:text-cyan-300">
            View Issues
          </Link>


          {/* Login (secondary button style) */}
          <Link
            to="/login"
            className="rounded-full bg-gradient-to-b from-[#00b4db] to-[#0083b0] p-[2px] shadow-lg"
          >
            <span className="block bg-white text-slate-900 rounded-full px-5 py-2 text-sm font-semibold">
              Login
            </span>
          </Link>

          {/* Sign Up (primary button style) */}
          <Link
            to="/signup"
            className="rounded-full bg-gradient-to-b from-[#00b4db] to-[#0083b0] px-6 py-2 text-sm font-semibold shadow-lg"
          >
            Sign Up
          </Link>
        </nav>
      </div>
    </header>
  );
}
