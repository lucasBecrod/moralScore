import Link from "next/link";
import { getPublicLabel } from "@/shared/config/kohlberg-stages";
import type { Entidad } from "@/schemas/entidad.schema";

interface EntidadCardProps {
  entidad: Entidad;
}

// Color unificado por zona — un solo color por candidato
const ZONE_STYLES = {
  post: { bar: "bg-violet-500", text: "text-violet-300", label: "Post-convencional" },
  conv: { bar: "bg-blue-500", text: "text-blue-300", label: "Convencional" },
  pre:  { bar: "bg-red-500", text: "text-red-300", label: "Pre-convencional" },
} as const;

function getZoneStyle(score: number) {
  if (score >= 4.5) return ZONE_STYLES.post;
  if (score >= 2.5) return ZONE_STYLES.conv;
  return ZONE_STYLES.pre;
}

export function EntidadCard({ entidad }: EntidadCardProps) {
  const { id, nombre, partido, foto, logoPartido, scoreActual, totalEvaluaciones } = entidad;

  const zone = scoreActual !== null ? getZoneStyle(scoreActual) : null;
  const filledSegments = scoreActual !== null ? Math.round(scoreActual) : 0;
  const confident = totalEvaluaciones >= 5;

  return (
    <Link
      href={`/entidad/${id}`}
      className="group flex gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-3 transition-all hover:border-zinc-600 hover:shadow-lg"
    >
      {/* Retrato + logo partido */}
      <div className="relative h-[5.5rem] w-16 shrink-0">
        {foto ? (
          <img
            src={foto}
            alt={nombre}
            className="h-[5.5rem] w-16 rounded-lg object-cover object-top"
          />
        ) : (
          <div className="flex h-[5.5rem] w-16 items-center justify-center rounded-lg bg-zinc-800">
            <span className="text-sm text-zinc-600">&mdash;</span>
          </div>
        )}
        {logoPartido && (
          <img
            src={logoPartido}
            alt={partido || ""}
            className="absolute -bottom-1.5 -right-1.5 h-6 w-6 rounded-full border-2 border-zinc-900 bg-white object-contain"
          />
        )}
      </div>

      {/* Nombre + Partido → Métricas */}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2.5">
        {/* Grupo 1: Identidad */}
        <div>
          <h3 className="truncate text-sm font-semibold text-zinc-100 group-hover:text-white">
            {nombre}
          </h3>
          <p className="mt-0.5 truncate text-xs text-zinc-400">
            {partido || "Sin partido"}
          </p>
        </div>

        {/* Grupo 2: Métricas (apretado internamente) */}
        {scoreActual !== null && zone ? (
          <div className={`flex flex-col gap-0.5 ${confident ? "" : "opacity-40"}`}>
            <span className="text-[11px] text-zinc-500">
              {getPublicLabel(scoreActual)}{totalEvaluaciones > 0 && <> ({totalEvaluaciones} evaluaciones)</>}
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold tabular-nums ${zone.text}`}>
                {scoreActual.toFixed(1)}
              </span>
              <div className="flex max-w-32 flex-1 gap-0.5">
                {Array.from({ length: 6 }, (_, i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-sm ${i < filledSegments ? zone.bar : "bg-zinc-800"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            <div className="flex max-w-32 flex-1 gap-0.5">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="h-2 flex-1 rounded-sm bg-zinc-800" />
              ))}
            </div>
            <span className="text-[11px] text-zinc-600">Evidencia insuficiente</span>
          </div>
        )}
      </div>
    </Link>
  );
}
