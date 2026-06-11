import { useState, useEffect, useRef, useCallback } from "react";

export interface CityResult {
  city: string;
  country: string;
  lat: number;
  lng: number;
  continent: string;
  displayName: string;
}

interface Props {
  onSelect: (result: CityResult) => void;
}

// ISO 2-letter country code → continent
const COUNTRY_CONTINENT: Record<string, string> = {
  AF:"Asia",AM:"Asia",AZ:"Asia",BH:"Asia",BD:"Asia",BT:"Asia",BN:"Asia",KH:"Asia",CN:"Asia",
  CY:"Asia",GE:"Asia",IN:"Asia",ID:"Asia",IR:"Asia",IQ:"Asia",IL:"Asia",JP:"Asia",JO:"Asia",
  KZ:"Asia",KW:"Asia",KG:"Asia",LA:"Asia",LB:"Asia",MY:"Asia",MV:"Asia",MN:"Asia",MM:"Asia",
  NP:"Asia",KP:"Asia",OM:"Asia",PK:"Asia",PS:"Asia",PH:"Asia",QA:"Asia",SA:"Asia",SG:"Asia",
  LK:"Asia",SY:"Asia",TW:"Asia",TJ:"Asia",TH:"Asia",TL:"Asia",TR:"Asia",TM:"Asia",AE:"Asia",
  UZ:"Asia",VN:"Asia",YE:"Asia",HK:"Asia",MO:"Asia",
  AL:"Europe",AD:"Europe",AT:"Europe",BY:"Europe",BE:"Europe",BA:"Europe",BG:"Europe",HR:"Europe",
  CZ:"Europe",DK:"Europe",EE:"Europe",FI:"Europe",FR:"Europe",DE:"Europe",GR:"Europe",HU:"Europe",
  IS:"Europe",IE:"Europe",IT:"Europe",XK:"Europe",LV:"Europe",LI:"Europe",LT:"Europe",LU:"Europe",
  MT:"Europe",MD:"Europe",MC:"Europe",ME:"Europe",NL:"Europe",MK:"Europe",NO:"Europe",PL:"Europe",
  PT:"Europe",RO:"Europe",RU:"Europe",SM:"Europe",RS:"Europe",SK:"Europe",SI:"Europe",ES:"Europe",
  SE:"Europe",CH:"Europe",UA:"Europe",GB:"Europe",VA:"Europe",
  DZ:"Africa",AO:"Africa",BJ:"Africa",BW:"Africa",BF:"Africa",BI:"Africa",CV:"Africa",CM:"Africa",
  CF:"Africa",TD:"Africa",KM:"Africa",CD:"Africa",CG:"Africa",CI:"Africa",DJ:"Africa",EG:"Africa",
  GQ:"Africa",ER:"Africa",SZ:"Africa",ET:"Africa",GA:"Africa",GM:"Africa",GH:"Africa",GN:"Africa",
  GW:"Africa",KE:"Africa",LS:"Africa",LR:"Africa",LY:"Africa",MG:"Africa",MW:"Africa",ML:"Africa",
  MR:"Africa",MU:"Africa",MA:"Africa",MZ:"Africa",NA:"Africa",NE:"Africa",NG:"Africa",RW:"Africa",
  ST:"Africa",SN:"Africa",SC:"Africa",SL:"Africa",SO:"Africa",ZA:"Africa",SS:"Africa",SD:"Africa",
  TZ:"Africa",TG:"Africa",TN:"Africa",UG:"Africa",ZM:"Africa",ZW:"Africa",
  AG:"North America",BS:"North America",BB:"North America",BZ:"North America",CA:"North America",
  CR:"North America",CU:"North America",DM:"North America",DO:"North America",SV:"North America",
  GD:"North America",GT:"North America",HT:"North America",HN:"North America",JM:"North America",
  MX:"North America",NI:"North America",PA:"North America",KN:"North America",LC:"North America",
  VC:"North America",TT:"North America",US:"North America",
  AR:"South America",BO:"South America",BR:"South America",CL:"South America",CO:"South America",
  EC:"South America",GY:"South America",PY:"South America",PE:"South America",SR:"South America",
  UY:"South America",VE:"South America",
  AU:"Oceania",FJ:"Oceania",KI:"Oceania",MH:"Oceania",FM:"Oceania",NR:"Oceania",NZ:"Oceania",
  PW:"Oceania",PG:"Oceania",WS:"Oceania",SB:"Oceania",TO:"Oceania",TV:"Oceania",VU:"Oceania",
};

function getContinent(countryCode: string): string {
  return COUNTRY_CONTINENT[countryCode.toUpperCase()] ?? "Other";
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
}

function extractCity(addr: NominatimResult["address"], displayName: string): string {
  return addr.city || addr.town || addr.village || addr.municipality || displayName.split(",")[0].trim();
}

export function CitySearch({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CityResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); setIsOpen(false); return; }
    setIsLoading(true);
    try {
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("q", q);
      url.searchParams.set("format", "json");
      url.searchParams.set("addressdetails", "1");
      url.searchParams.set("limit", "8");
      url.searchParams.set("featuretype", "city");
      const res = await fetch(url.toString(), {
        headers: { "Accept-Language": "en", "User-Agent": "georgepai-portfolio/1.0" },
      });
      const data: NominatimResult[] = await res.json();
      const mapped: CityResult[] = data
        .filter(r => r.address.country)
        .map(r => ({
          city: extractCity(r.address, r.display_name),
          country: r.address.country!,
          lat: parseFloat(r.lat),
          lng: parseFloat(r.lon),
          continent: getContinent(r.address.country_code ?? ""),
          displayName: r.display_name,
        }))
        .filter((r, i, arr) => arr.findIndex(x => x.city === r.city && x.country === r.country) === i);
      setResults(mapped);
      setIsOpen(mapped.length > 0);
      setActiveIndex(-1);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, search]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleSelect(result: CityResult) {
    onSelect(result);
    setQuery(`${result.city}, ${result.country}`);
    setIsOpen(false);
    setResults([]);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && activeIndex >= 0) { e.preventDefault(); handleSelect(results[activeIndex]); }
    if (e.key === "Escape") setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative col-span-2">
      <div className="relative">
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); }}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search for a city…"
          autoComplete="off"
          data-testid="input-city-search"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 pr-10 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/60 transition-colors"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-white/20 border-t-amber-400 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-[#10101a] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
          {results.map((r, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={() => handleSelect(r)}
              onMouseEnter={() => setActiveIndex(i)}
              data-testid={`dropdown-city-${i}`}
              className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ${
                i === activeIndex ? "bg-amber-500/10" : "hover:bg-white/5"
              }`}
            >
              <div>
                <span className="text-white text-sm font-medium">{r.city}</span>
                <span className="text-white/40 text-sm ml-1.5">{r.country}</span>
              </div>
              <span className="text-xs text-amber-500/50 shrink-0 ml-4">{r.continent}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
