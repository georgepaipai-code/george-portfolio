export function DateGroupHeader({ label }: { label: string }) {
  return (
    <div className="sticky top-[72px] z-10 -mx-4 bg-background/90 px-4 py-2 backdrop-blur-md md:top-[80px]">
      <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </h2>
    </div>
  );
}
