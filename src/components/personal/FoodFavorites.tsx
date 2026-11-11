import { useMemo, useState, type ComponentType } from "react";
import { ExternalLink, Soup, CupSoda, ChefHat, Sandwich, Croissant, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import { foodCategories, type FoodCategory, type FoodSpot } from "@/data/food-favorites";

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  ramen: Soup,
  boba: CupSoda,
  dimsum: ChefHat,
  sandwiches: Sandwich,
  pastries: Croissant,
};

const MAX_VISIBLE_SPOTS = 3;
const FILTER_CHIP_THRESHOLD = 9;

function CategoryIcon({ icon }: { icon?: string }) {
  const Icon = (icon && ICONS[icon]) || UtensilsCrossed;
  return <Icon className="h-4 w-4 text-amber-400" />;
}

function SpotRow({ spot }: { spot: FoodSpot }) {
  return (
    <div className="group -mx-2 flex items-start justify-between gap-3 rounded-md px-2 py-3 transition-colors hover:bg-white/[0.03]">
      <div className="min-w-0">
        <p className="text-sm font-medium text-white">{spot.name}</p>
        <p className="mt-0.5 text-xs text-white/40">
          {spot.location}
          {spot.order ? ` · ${spot.order}` : ""}
        </p>
      </div>
      <a
        href={spot.yelpUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-shrink-0 items-center gap-0.5 text-xs font-medium text-white/50 transition-colors hover:text-amber-400"
      >
        Yelp <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}

function CategoryCard({ category }: { category: FoodCategory }) {
  const [expanded, setExpanded] = useState(false);
  const visibleSpots = expanded ? category.spots : category.spots.slice(0, MAX_VISIBLE_SPOTS);
  const remaining = category.spots.length - MAX_VISIBLE_SPOTS;

  return (
    <div className="mb-4 break-inside-avoid rounded-xl border border-white/5 bg-white/[0.03] p-5">
      <div className="mb-1 flex items-center gap-2">
        <CategoryIcon icon={category.icon} />
        <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-white">
          {category.name}
        </h3>
      </div>
      <div className="divide-y divide-white/5">
        {visibleSpots.map((spot, i) => (
          <SpotRow key={`${spot.name}-${i}`} spot={spot} />
        ))}
      </div>
      {!expanded && remaining > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-2 text-xs font-medium text-amber-400/80 transition-colors hover:text-amber-400"
        >
          +{remaining} more
        </button>
      )}
    </div>
  );
}

export function FoodFavorites() {
  const sortedCategories = useMemo(
    () => [...foodCategories].sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity)),
    [],
  );
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const showFilters = sortedCategories.length > FILTER_CHIP_THRESHOLD;
  const visibleCategories =
    showFilters && activeCategory !== "all"
      ? sortedCategories.filter((c) => c.name === activeCategory)
      : sortedCategories;

  return (
    <div>
      {showFilters && (
        <div className="mb-6 flex flex-wrap gap-2">
          {["all", ...sortedCategories.map((c) => c.name)].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setActiveCategory(value)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                activeCategory === value
                  ? "border-amber-400 bg-amber-500 text-black"
                  : "border-white/10 text-white/50 hover:border-white/20 hover:text-white",
              )}
            >
              {value === "all" ? "All" : value}
            </button>
          ))}
        </div>
      )}

      <div className="columns-1 gap-4 md:columns-2 lg:columns-3">
        {visibleCategories.map((category) => (
          <CategoryCard key={category.name} category={category} />
        ))}
      </div>
    </div>
  );
}
