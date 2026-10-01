type Option = { value: string; label: string };

const FilterChips = ({
  options,
  value,
  onChange,
  label = "Filter",
}: {
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) => (
  <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label={label}>
    {options.map((o) => {
      const active = o.value === value;
      return (
        <button
          key={o.value}
          type="button"
          aria-pressed={active}
          onClick={() => onChange(o.value)}
          className={`text-xs md:text-sm px-4 py-2 rounded-md border transition-all ${
            active
              ? "bg-foreground text-background border-foreground font-semibold shadow-sm"
              : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary"
          }`}
        >
          {o.label}
        </button>
      );
    })}
  </div>
);

export default FilterChips;
