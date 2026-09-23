import { Radio } from "lucide-react";
import { cn } from "@/lib/utils";

const LiveDataBadge = ({ className, label = "LIVE DATA" }: { className?: string; label?: string }) => (
  <span className={cn("inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-success", className)}>
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-40" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
    </span>
    <Radio className="sr-only" />
    {label}
  </span>
);

export default LiveDataBadge;