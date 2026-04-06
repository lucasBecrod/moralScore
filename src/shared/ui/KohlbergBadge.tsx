import { KOHLBERG_STAGES, type KohlbergStage } from "@/shared/config/kohlberg-stages";

interface KohlbergBadgeProps {
  stage: number;
}

export function KohlbergBadge({ stage }: KohlbergBadgeProps) {
  const data = KOHLBERG_STAGES[stage as KohlbergStage];

  if (!data) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${data.colorTw}`}
    >
      Estadio {stage} — {data.nombre}
    </span>
  );
}
