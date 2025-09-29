export default function CommunityStats() {
  const stats = [
    { value: "152", label: "Total Issues", gradient: "from-[#4facfe] to-[#00f2fe]" },
    { value: "1.2k", label: "Votes Given", gradient: "from-[#56ab2f] to-[#a8e063]" },
    { value: "87", label: "Resolved Issues", gradient: "from-[#fbb034] to-[#ffdd00]" },
    { value: "230", label: "Active Users", gradient: "from-[#43c6ac] to-[#191654]" },
  ];

  return (
    <section className="w-full flex flex-col items-center justify-center py-20 gap-10">
      {/* Title */}
      <h2 className="text-3xl font-semibold text-white font-inter">
        Community Impact
      </h2>

      {/* Stats Row */}
      <div className="flex flex-wrap justify-center gap-8 px-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="w-[200px] h-[120px] flex flex-col items-center justify-start rounded-xl border border-white/15 backdrop-blur-xl bg-white/15 shadow-lg overflow-hidden"
          >
            {/* Gradient bar */}
            <div className={`w-full h-2 bg-gradient-to-b ${stat.gradient}`} />

            {/* Value */}
            <div className="text-4xl font-semibold text-white mt-3 leading-none">
              {stat.value}
            </div>

            {/* Label */}
            <div className="text-base text-white/80 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
