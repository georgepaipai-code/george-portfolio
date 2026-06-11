import { useState, useMemo } from "react";
import { Link } from "wouter";
import { InteractiveGlobe } from "@/components/Globe";
import { travelLocations } from "@/data/travel-locations";

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  const stats = useMemo(() => {
    const countries = new Set(travelLocations.map(l => l.country)).size;
    const cities = travelLocations.length;
    const continents = new Set(travelLocations.map(l => l.continent)).size;
    return { countries, cities, continents };
  }, []);

  const groupedLocations = useMemo(() => {
    return travelLocations.reduce((acc, loc) => {
      if (!acc[loc.continent]) acc[loc.continent] = [];
      acc[loc.continent].push(loc);
      return acc;
    }, {} as Record<string, typeof travelLocations>);
  }, []);

  // Simple emoji mapper for demonstration
  const getFlag = (country: string) => {
    const flags: Record<string, string> = {
      "United States": "🇺🇸", "Canada": "🇨🇦", "Mexico": "🇲🇽",
      "United Kingdom": "🇬🇧", "France": "🇫🇷", "Spain": "🇪🇸",
      "Italy": "🇮🇹", "Netherlands": "🇳🇱", "Czech Republic": "🇨🇿", "Switzerland": "🇨🇭",
      "Japan": "🇯🇵", "South Korea": "🇰🇷", "China": "🇨🇳", "Hong Kong": "🇭🇰",
      "Singapore": "🇸🇬", "Thailand": "🇹🇭", "Taiwan": "🇹🇼", "Indonesia": "🇮🇩",
      "Australia": "🇦🇺"
    };
    return flags[country] || "📍";
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col overflow-hidden relative selection:bg-primary/30">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-6 md:px-12 flex justify-between items-center mix-blend-difference">
        <div className="text-xl md:text-2xl font-bold tracking-tight text-white font-[Space_Grotesk]">
          GEORGE PAI
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium tracking-widest uppercase text-white/60">
          <a href="#" className="hover:text-primary transition-colors duration-300">Travel</a>
          <a href="#" className="hover:text-primary transition-colors duration-300">Work</a>
          <a href="#" className="hover:text-primary transition-colors duration-300">About</a>
          <a href="#" className="hover:text-primary transition-colors duration-300">Contact</a>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:flex-row relative">
        
        {/* Globe Section */}
        <div className="flex-1 relative h-[60vh] md:h-screen w-full flex flex-col">
          <div className="flex-1 w-full relative">
            <InteractiveGlobe 
              targetLocation={selectedLocation} 
              onLocationClick={setSelectedLocation} 
            />
            {/* Soft vignette overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(10,10,15,0.8)_100%)]" />
          </div>

          {/* Stats Bar */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-max max-w-full px-4">
            <div className="bg-card/40 backdrop-blur-md border border-white/5 rounded-full px-6 py-3 flex gap-6 text-sm text-white/80 font-[Space_Grotesk] tracking-wide shadow-2xl">
              <span><strong className="text-primary">{stats.countries}</strong> Countries</span>
              <span className="opacity-50">·</span>
              <span><strong className="text-primary">{stats.cities}</strong> Cities</span>
              <span className="opacity-50">·</span>
              <span><strong className="text-primary">{stats.continents}</strong> Continents</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-full md:w-80 lg:w-96 bg-card/80 backdrop-blur-2xl border-l border-white/5 h-[40vh] md:h-screen overflow-y-auto custom-scrollbar flex flex-col z-20">
          <div className="p-8 pb-4 sticky top-0 bg-gradient-to-b from-card/90 to-transparent z-10">
            <h2 className="text-2xl font-bold text-white mb-2 font-[Space_Grotesk]">Travel Log</h2>
            <p className="text-sm text-white/50">Explore locations around the world.</p>
          </div>
          
          <div className="px-8 pb-12 flex flex-col gap-8">
            {Object.entries(groupedLocations).map(([continent, locations]) => (
              <div key={continent} className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary/80 border-b border-white/5 pb-2">
                  {continent}
                </h3>
                <div className="flex flex-col gap-2">
                  {locations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => setSelectedLocation(loc)}
                      className={`text-left flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-300 ${
                        selectedLocation?.id === loc.id 
                          ? "bg-primary/10 text-primary border border-primary/20" 
                          : "text-white/70 hover:text-white hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <span className="text-lg grayscale-[50%]">{getFlag(loc.country)}</span>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{loc.city}</span>
                        <span className="text-[10px] uppercase tracking-wider opacity-60">{loc.country}</span>
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
