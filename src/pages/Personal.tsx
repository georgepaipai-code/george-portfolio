import { Navbar } from "@/components/Navbar";
import { travelLocations } from "@/data/travel-locations";
import { FoodFavorites } from "@/components/personal/FoodFavorites";

const cityCount = travelLocations.length;
const countryCount = new Set(travelLocations.map(l => l.country)).size;
const continentCount = new Set(travelLocations.map(l => l.continent)).size;

export default function Personal() {
  return (
    <div className="min-h-screen bg-background text-white">

      <Navbar />

      {/* Banner */}
      <div className="relative h-[28rem] w-full overflow-hidden">
        <div className="absolute inset-0 bg-[url('/george-personal.png')] bg-cover" style={{ backgroundPosition: 'center 20%' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-background" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl px-8 pb-6">
          <p className="text-amber-400/70 text-[11px] tracking-[0.3em] uppercase mb-2">Personal</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Life
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-8 pt-10 pb-24">

        {/* Subheading */}
        <div className="mb-16">
          <p className="text-white/40 text-xl">
            Bay Area native, proud dad, and travel points maximizer. When I&apos;m home, I&apos;m
            eating my way through town and opening a good bottle of wine with friends.
          </p>
        </div>

        {/* Travel */}
        <section className="mb-14">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-500/60 mb-5 pb-3 border-b border-white/5">
            Travel
          </h2>
          <p className="text-white/65 text-lg leading-relaxed mb-6">
            I've been fortunate enough to explore {cityCount} cities across {continentCount} continents and {countryCount} countries — from street markets in Southeast Asia to the vast landscapes of East Africa. Travel isn't just a hobby, it's how I stay curious about the world and the people in it.
          </p>
          {/* Travel stats */}
          <div className="flex gap-6">
            {[
              { value: countryCount, label: "Countries" },
              { value: cityCount,    label: "Cities" },
              { value: continentCount, label: "Continents" },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white/[0.03] border border-white/5 rounded-xl px-6 py-4 text-center">
                <p className="text-3xl font-bold text-amber-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{value}</p>
                <p className="text-white/40 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Food */}
        <section className="mb-14">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-500/60 mb-5 pb-3 border-b border-white/5">
            Food
          </h2>
          <p className="text-white/65 text-lg leading-relaxed">
            I live to eat. From hole-in-the-wall ramen spots in Tokyo to the best ceviche in Lima — food is always the highlight of any trip. Half my travel itinerary is honestly just a list of restaurants. Listed below are my top restaurants in that particular category.
          </p>

          <h3 className="mb-4 mt-8 text-sm font-semibold uppercase tracking-wide text-white/70">
            Where I Eat
          </h3>
          <FoodFavorites />
        </section>

        {/* TBD */}
        <section className="mb-14">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-500/60 mb-5 pb-3 border-b border-white/5">
            More Coming Soon
          </h2>
          <p className="text-white/30 text-lg leading-relaxed">
            More stories, interests and things to share — watch this space.
          </p>
        </section>

      </div>
    </div>
  );
}
