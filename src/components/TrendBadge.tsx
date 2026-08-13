import { TrendingDown, TrendingUp, Minus } from "lucide-react";

const TrendBadge = ({ delta }: { delta: number | null }) => {
  if (delta === null) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="w-3 h-3" /> —
      </span>
    );
  }
  const up = delta >= 0;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-mono ${up ? "text-success" : "text-destructive"}`}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {up ? "+" : ""}{delta.toFixed(1)}%
    </span>
  );
};

export default TrendBadge;
