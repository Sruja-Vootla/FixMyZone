import { Link } from 'react-router-dom';

export default function MapSnapShot() {
  return (
    <section className="relative w-full flex flex-col items-center justify-center px-6 py-20">
      <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-[50px] p-10 w-full max-w-6xl flex flex-col items-center gap-10">
        {/* Title */}
        <h2 className="text-3xl font-semibold text-white font-inter">
          Explore Issues Around You
        </h2>

        {/* Map Placeholder Box */}
        <div className="relative w-full h-[400px] bg-slate-800/40 rounded-xl overflow-hidden">
          {/* Filter Row */}
          <div className="absolute top-3 left-3 flex gap-2 z-10">
            {["Lighting", "Road", "Waste", "Water Supply"].map((cat) => (
              <div
                key={cat}
                className="flex items-center gap-2 bg-gray-100 text-slate-900 rounded-full px-3 py-1 text-xs font-medium shadow"
              >
                <span>💡</span>
                <span>{cat}</span>
              </div>
            ))}
          </div>

          {/* Cluster Markers */}
          <div className="absolute top-[177px] left-[223px] hidden w-6 h-6 rounded-full bg-gradient-to-b from-green-600 to-green-300 flex items-center justify-center text-xs text-white shadow z-20">
            5
          </div>

          <div className="absolute top-[250px] left-[267px] w-8 h-8 rounded-full bg-gradient-to-b from-[#00b4db] to-[#0083b0] flex items-center justify-center text-xs font-bold text-white shadow z-20">
            12
          </div>

          <div className="absolute top-[199px] left-[337px] w-10 h-10 rounded-full bg-gradient-to-b from-yellow-500 to-yellow-300 flex items-center justify-center text-sm font-bold text-white shadow z-20">
            30
          </div>

          {/* View Full Map Button */}
          <Link
            to="/issues"
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#00b4db] to-[#0083b0] rounded-full px-6 py-3 text-sm font-semibold shadow-lg text-white hover:scale-105 transition-transform"
          >
            View Full Map
          </Link>
        </div>
      </div>
    </section>
  );
}