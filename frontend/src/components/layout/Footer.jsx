import { FaLinkedinIn, FaInstagram, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full bg-white/15 text-white font-inter">
      {/* Top border */}
      <div className="bg-gray-200 h-px w-full" />

      {/* Row 1 */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between px-6 py-8 relative">
        {/* Brand */}
        <div className="flex flex-col gap-2 items-start">
          <span className="text-2xl font-semibold text-slate-900">FixMyZone</span>
          <span className="text-sm text-white">Report • Vote • Resolve</span>
          <div className="w-8 h-[3px] bg-gradient-to-r from-[#4facfe] to-[#00f2fe] rounded" />
        </div>

        {/* Links */}
        <div className="flex gap-6 mt-6 md:mt-0">
          <a href="#" className="hover:text-cyan-300 transition">About</a>
          <a href="#" className="hover:text-cyan-300 transition">Privacy</a>
          <a href="#" className="hover:text-cyan-300 transition">Terms</a>
          <a href="#" className="hover:text-cyan-300 transition">Contact</a>
        </div>

        {/* Socials */}
        <div className="flex gap-3 absolute md:static right-6 top-10">
          <a href="#" className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-black">
            <FaLinkedinIn size={14} />
          </a>
          <a href="#" className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-black">
            <FaInstagram size={14} />
          </a>
          <a href="#" className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-black">
            <FaTwitter size={14} />
          </a>
        </div>
      </div>

      {/* Row 2 */}
      <div className="max-w-6xl mx-auto px-6 py-4 text-xs text-slate-400">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} FixMyZone. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Accessibility</a>
            <a href="#" className="hover:text-white">Cookies</a>
            <a href="#" className="hover:text-white">Help</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
