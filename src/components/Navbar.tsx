import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Work Life",     href: "/professional" },
  { label: "Personal Life", href: "/personal" },
  { label: "Travel",        href: "/travel" },
  { label: "Events",        href: "/events" },
  { label: "Contact",       href: "#contact" },
];

export function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/5">
      <div className="px-8 md:px-12 py-5 flex justify-between items-center">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="text-xl md:text-2xl font-bold tracking-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <span className="text-white">GeorgeP</span><span className="text-amber-400">.ai</span>
        </Link>

        <div className="hidden md:flex gap-8 text-sm font-medium tracking-widest uppercase">
          {links.map(({ label, href }) => {
            const isActive = href.startsWith("/") && location === href;
            return (
              <Link
                key={label}
                href={href}
                className={`transition-colors duration-300 ${
                  isActive ? "text-amber-400" : "text-white/40 hover:text-amber-400"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          className="md:hidden text-white/80 hover:text-amber-400"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden flex flex-col gap-1 px-8 pb-5 text-sm font-medium tracking-widest uppercase bg-background/95 backdrop-blur-md border-b border-white/5">
          {links.map(({ label, href }) => {
            const isActive = href.startsWith("/") && location === href;
            return (
              <Link
                key={label}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`py-3 transition-colors duration-300 ${
                  isActive ? "text-amber-400" : "text-white/60 hover:text-amber-400"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
