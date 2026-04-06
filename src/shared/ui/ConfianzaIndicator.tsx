import { cn } from "@/shared/lib/cn";

interface ConfianzaIndicatorProps {
  level: "alta" | "media" | "baja";
}

const CONFIG = {
  alta: { filled: 3, color: "bg-green-500", label: "Alta" },
  media: { filled: 2, color: "bg-yellow-500", label: "Media" },
  baja: { filled: 1, color: "bg-red-500", label: "Baja" },
} as const;

export function ConfianzaIndicator({ level }: ConfianzaIndicatorProps) {
  const { filled, color, label } = CONFIG[level];

  return (
    <div className="inline-flex items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-2 w-5 rounded-full",
              i <= filled ? color : "bg-gray-700"
            )}
          />
        ))}
      </div>
      <span className="text-xs text-zinc-400">{label}</span>
    </div>
  );
}
