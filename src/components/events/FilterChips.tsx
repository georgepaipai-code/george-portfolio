import { cn } from "@/lib/utils";

export type FilterValue = "all" | "picks" | "cohosted" | `tag:${string}`;

export function FilterChips({
  tags,
  active,
  onChange,
}: {
  tags: string[];
  active: FilterValue;
  onChange: (value: FilterValue) => void;
}) {
  const chips: { value: FilterValue; label: string }[] = [
    { value: "all", label: "All" },
    { value: "picks", label: "George's Picks" },
    { value: "cohosted", label: "Cohosted" },
    ...tags.map((tag) => ({ value: `tag:${tag}` as FilterValue, label: tag })),
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <button
          key={chip.value}
          type="button"
          onClick={() => onChange(chip.value)}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
            active === chip.value
              ? "border-primary bg-primary text-primary-foreground"
              : "border-card-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
          )}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
