import { useState, useMemo } from "react";
import { Link } from "wouter";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { InteractiveGlobe } from "@/components/Globe";
import type { TravelLocation } from "@/components/Globe";
import { travelLocations } from "@/data/travel-locations";
import { Navbar } from "@/components/Navbar";

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<TravelLocation | null>(null);
  const locations = travelLocations as TravelLocation[];

  const stats = useMemo(() => {
    const countries = new Set(locations.map(l => l.country)).size;
    const cities = locations.length;
    const continents = new Set(locations.map(l => l.continent)).size;
    return { countries, cities, continents };
  }, [locations]);

  const groupedLocations = useMemo(() => {
    return locations.reduce((acc, loc) => {
      if (!acc[loc.continent]) acc[loc.continent] = [];
      acc[loc.continent].push(loc);
      return acc;
    }, {} as Record<string, TravelLocation[]>);
  }, [locations]);

  const getFlag = (country: string) => {
    const flags: Record<string, string> = {
      "United States": "🇺🇸", "Canada": "🇨🇦", "Mexico": "🇲🇽",
      "United Kingdom": "🇬🇧", "France": "🇫🇷", "Spain": "🇪🇸",
      "Italy": "🇮🇹", "Netherlands": "🇳🇱", "Czech Republic": "🇨🇿", "Switzerland": "🇨🇭",
      "Japan": "🇯🇵", "South Korea": "🇰🇷", "China": "🇨🇳", "Hong Kong": "🇭🇰",
      "Singapore": "🇸🇬", "Thailand": "🇹🇭", "Taiwan": "🇹🇼", "Indonesia": "🇮🇩",
      "Australia": "🇦🇺", "Iceland": "🇮🇸", "Panama": "🇵🇦", "Peru": "🇵🇪", "Argentina": "🇦🇷",
      "Germany": "🇩🇪", "Hungary": "🇭🇺", "Turkey": "🇹🇷",
      "Israel": "🇮🇱", "Jordan": "🇯🇴", "Maldives": "🇲🇻", "Sri Lanka": "🇱🇰",
      "Malaysia": "🇲🇾", "Vietnam": "🇻🇳", "Portugal": "🇵🇹", "Croatia": "🇭🇷",
      "Tanzania": "🇹🇿", "Kenya": "🇰🇪", "Ethiopia": "🇪🇹", "South Africa": "🇿🇦",
      "Jamaica": "🇯🇲", "Haiti": "🇭🇹", "Bahamas": "🇧🇸",
      "Philippines": "🇵🇭",
    };
    return flags[country] || "📍";
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col overflow-hidden relative selection:bg-primary/30">

      <Navbar />

      {/* Hero Split */}
      <section className="pt-16 flex h-[52vh] min-h-[360px]">

        {/* Professional */}
        <Link href="/professional" className="group relative flex-1 flex flex-col justify-end p-10 overflow-hidden cursor-pointer border-r border-white/5">
          {/* Background — swap the gradient for a real image later: add bg-[url('/your-image.jpg')] bg-cover bg-center */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0e1520] to-[#0a0a14] transition-all duration-500 group-hover:from-slate-800" />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_at_bottom_left,rgba(245,158,11,0.1),transparent_65%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500/0 group-hover:bg-amber-500/40 transition-all duration-500" />
          <div className="relative z-10">
            <p className="text-amber-400/50 text-[11px] tracking-[0.3em] uppercase mb-3 transition-colors group-hover:text-amber-400/80">Professional</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Work & Career
            </h2>
            <p className="text-white/35 text-sm max-w-xs group-hover:text-white/55 transition-colors">
              Strategy, technology & what drives me professionally.
            </p>
            <div className="mt-5 flex items-center gap-2 text-amber-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
              View profile <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>

        {/* Personal */}
        <Link href="/personal" className="group relative flex-1 flex flex-col justify-end items-end p-10 overflow-hidden cursor-pointer">
          {/* Background — swap the gradient for a real image later: add bg-[url('/your-image.jpg')] bg-cover bg-center */}
          <div className="absolute inset-0 bg-gradient-to-bl from-[#0d1a2d] via-[#080f1a] to-[#040d20] transition-all duration-500 group-hover:from-[#0f2035]" />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_at_bottom_right,rgba(245,158,11,0.1),transparent_65%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500/0 group-hover:bg-amber-500/40 transition-all duration-500" />
          <div className="relative z-10 text-right">
            <p className="text-amber-400/50 text-[11px] tracking-[0.3em] uppercase mb-3 transition-colors group-hover:text-amber-400/80">Personal</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Life & Travel
            </h2>
            <p className="text-white/35 text-sm max-w-xs ml-auto group-hover:text-white/55 transition-colors">
              Traveller, food lover & everything in between.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2 text-amber-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
              <ArrowLeft className="w-4 h-4" /> Learn more
            </div>
          </div>
        </Link>
      </section>

      {/* Main Content */}
      <main id="travel" className="flex-1 flex flex-col md:flex-row relative">

        {/* Globe Section */}
        <div className="flex-1 relative h-[60vh] md:h-screen w-full flex flex-col">

          {/* Subtitle — centered over globe */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none w-full px-4">
            <p className="text-white/40 text-sm tracking-widest uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Where in the world has George Pai travelled to?
            </p>
          </div>

          <div className="flex-1 w-full relative">
            <InteractiveGlobe
              locations={locations}
              targetLocation={selectedLocation}
              onLocationClick={setSelectedLocation}
            />
            {/* Vignette */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(10,10,15,0.8)_100%)]" />
          </div>

          {/* Stats Bar */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-max max-w-full px-4">
            <div className="bg-card/40 backdrop-blur-md border border-white/5 rounded-full px-6 py-3 flex gap-6 text-sm text-white/80 font-[Space_Grotesk] tracking-wide shadow-2xl">
              <span data-testid="stat-countries"><strong className="text-amber-400">{stats.countries}</strong> Countries</span>
              <span className="opacity-30">·</span>
              <span data-testid="stat-cities"><strong className="text-amber-400">{stats.cities}</strong> Cities</span>
              <span className="opacity-30">·</span>
              <span data-testid="stat-continents"><strong className="text-amber-400">{stats.continents}</strong> Continents</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-full md:w-80 lg:w-96 bg-card/80 backdrop-blur-2xl border-l border-white/5 h-[40vh] md:h-screen overflow-y-auto flex flex-col z-20">
          <div className="p-8 pb-4 sticky top-0 bg-gradient-to-b from-card/90 to-transparent z-10">
            <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Travel Log
            </h2>
            <p className="text-sm text-white/40">Explore locations around the world.</p>
          </div>

          <div className="px-8 pb-12 flex flex-col gap-8">
            {Object.entries(groupedLocations).map(([continent, locs]) => (
              <div key={continent} className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-amber-500/70 border-b border-white/5 pb-2">
                  {continent}
                </h3>
                <div className="flex flex-col gap-1">
                  {locs.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => setSelectedLocation(loc)}
                      data-testid={`button-location-${loc.id}`}
                      className={`text-left flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-300 ${
                        selectedLocation?.id === loc.id
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <span className="text-lg">{getFlag(loc.country)}</span>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{loc.city}</span>
                        <span className="text-[10px] uppercase tracking-wider opacity-50">{loc.country}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </aside>

      </main>
    </div>
  );
}
