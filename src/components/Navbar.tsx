import { Link, useLocation } from "wouter";

const links = [
  { label: "Work Life",     href: "/professional" },
  { label: "Personal Life", href: "/personal" },
  { label: "Travel",        href: "/travel" },
  { label: "Events",        href: "/events" },
  { label: "Contact",       href: "#contact" },
];

export function Navbar() {
  const [location] = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-8 md:px-12 py-5 flex justify-between items-center backdrop-blur-md border-b border-white/5">
      <Link href="/" className="text-xl md:text-2xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
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
    </nav>
  );
}
