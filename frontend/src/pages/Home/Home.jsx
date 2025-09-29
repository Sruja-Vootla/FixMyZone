import Hero from "../../components/layout/Hero";
import HowItWorks from "../../components/HowItWorks";
import MapSnapShot from "../../components/MapSnapShot";
import CommunityStats from "../../components/CommunityStats";

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />

      {/* How It Works Section */}
      <section id="how-it-works">
        <HowItWorks />
      </section>

      {/* Map Snapshot Section */}
      <section id="map">
        <MapSnapShot />
      </section>

      {/* Community Stats Section */}
      <section id="impact">
        <CommunityStats />
      </section>
    </div>
  );
}
