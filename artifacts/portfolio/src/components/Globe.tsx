import { useState, useEffect, useRef, useCallback } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { travelLocations } from "@/data/travel-locations";

const GEO_URL = "https://unpkg.com/world-atlas@2/countries-110m.json";

interface TravelLocation {
  id: number;
  city: string;
  country: string;
  lat: number;
  lng: number;
  continent: string;
}

interface GlobeProps {
  onLocationClick?: (loc: TravelLocation) => void;
  targetLocation?: TravelLocation | null;
}

export function InteractiveGlobe({ onLocationClick, targetLocation }: GlobeProps) {
  const [rotation, setRotation] = useState<[number, number, number]>([-30, -20, 0]);
  const [hoveredLocation, setHoveredLocation] = useState<TravelLocation | null>(null);
  const [dragging, setDragging] = useState(false);
  const isDragging = useRef(false);
  const isAutoRotating = useRef(true);
  const lastMousePos = useRef<{ x: number; y: number } | null>(null);
  const animRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const animate = (time: number) => {
      if (!isDragging.current && isAutoRotating.current) {
        const dt = lastTimeRef.current ? time - lastTimeRef.current : 0;
        if (dt > 0) {
          setRotation((r) => [r[0] + dt * 0.007, r[1], r[2]]);
        }
      }
      lastTimeRef.current = time;
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  useEffect(() => {
    if (targetLocation) {
      isAutoRotating.current = false;
      setRotation([-targetLocation.lng, -targetLocation.lat * 0.6, 0]);
    }
  }, [targetLocation]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    isAutoRotating.current = false;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    setDragging(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !lastMousePos.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    setRotation((r) => [
      r[0] + dx * 0.35,
      Math.max(-75, Math.min(75, r[1] - dy * 0.35)),
      r[2],
    ]);
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    setDragging(false);
  }, []);

  const isVisible = useCallback(
    (lng: number, lat: number): boolean => {
      const toRad = (deg: number) => (deg * Math.PI) / 180;
      const centreLat = toRad(-rotation[1]);
      const centreLng = toRad(-rotation[0]);
      const pLat = toRad(lat);
      const pLng = toRad(lng);
      const cos =
        Math.sin(pLat) * Math.sin(centreLat) +
        Math.cos(pLat) * Math.cos(centreLat) * Math.cos(pLng - centreLng);
      return cos > 0.08;
    },
    [rotation]
  );

  return (
    <div
      className="w-full h-full relative select-none"
      style={{ cursor: dragging ? "grabbing" : "grab" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      data-testid="globe-container"
    >
      {/* Atmospheric outer glow */}
      <div
        className="absolute inset-0 pointer-events-none flex items-center justify-center"
        aria-hidden="true"
      >
        <div
          style={{
            width: "52%",
            height: "52%",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(20,80,180,0.18) 0%, rgba(10,40,100,0.08) 60%, transparent 80%)",
            filter: "blur(48px)",
          }}
        />
      </div>

      <ComposableMap
        projection="geoOrthographic"
        projectionConfig={{ rotate: rotation, scale: 280 }}
        width={700}
        height={700}
        style={{ width: "100%", height: "100%" }}
      >
        <defs>
          <radialGradient id="sphereGrad" cx="36%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#1c4580" />
            <stop offset="40%" stopColor="#0d2850" />
            <stop offset="100%" stopColor="#040d20" />
          </radialGradient>
          <radialGradient id="atmosphereGrad" cx="50%" cy="50%" r="55%">
            <stop offset="72%" stopColor="transparent" />
            <stop offset="88%" stopColor="#1d4ed8" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.04" />
          </radialGradient>
          <filter id="pinGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Globe sphere base */}
        <circle cx={350} cy={350} r={280} fill="url(#sphereGrad)" />

        {/* Country shapes */}
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#183e6a"
                stroke="#2460a0"
                strokeWidth={0.5}
                style={{
                  default: { outline: "none" },
                  hover: { fill: "#1f5080", outline: "none" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {/* Atmosphere rim */}
        <circle cx={350} cy={350} r={280} fill="url(#atmosphereGrad)" />

        {/* Specular highlight */}
        <ellipse
          cx={285}
          cy={265}
          rx={70}
          ry={50}
          fill="white"
          opacity={0.035}
          style={{ pointerEvents: "none" }}
        />

        {/* Travel markers */}
        {travelLocations
          .filter((loc) => isVisible(loc.lng, loc.lat))
          .map((loc) => (
            <Marker
              key={loc.id}
              coordinates={[loc.lng, loc.lat]}
              onClick={() => onLocationClick?.(loc)}
              onMouseEnter={() => setHoveredLocation(loc)}
              onMouseLeave={() => setHoveredLocation(null)}
            >
              {/* Outer pulse ring */}
              <circle
                r={9}
                fill="#f59e0b"
                opacity={hoveredLocation?.id === loc.id ? 0.35 : 0.18}
                style={{ transition: "opacity 0.2s" }}
              />
              {/* Core dot */}
              <circle
                r={3.5}
                fill={hoveredLocation?.id === loc.id ? "#fcd34d" : "#f59e0b"}
                opacity={0.95}
                style={{
                  filter: "url(#pinGlow)",
                  cursor: "pointer",
                  transition: "fill 0.2s",
                }}
              />
            </Marker>
          ))}
      </ComposableMap>

      {/* Hover tooltip */}
      {hoveredLocation && (
        <div
          className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none z-20"
          style={{ whiteSpace: "nowrap" }}
          data-testid="globe-tooltip"
        >
          <div className="bg-black/85 backdrop-blur-md border border-amber-500/40 rounded-xl px-4 py-2.5 shadow-2xl text-center">
            <div
              className="text-white font-semibold text-sm"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {hoveredLocation.city}
            </div>
            <div className="text-white/55 text-xs mt-0.5">{hoveredLocation.country}</div>
          </div>
        </div>
      )}
    </div>
  );
}
