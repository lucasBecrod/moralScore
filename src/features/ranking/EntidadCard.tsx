import Link from "next/link";
import { getStageColor, getStageName } from "@/shared/config/kohlberg-stages";
import type { Entidad } from "@/schemas/entidad.schema";

interface EntidadCardProps {
  entidad: Entidad;
}

export function EntidadCard({ entidad }: EntidadCardProps) {
  const { id, nombre, partido, rol, foto, logoPartido, scoreActual, totalEvaluaciones } = entidad;

  const hasScore = scoreActual !== null;
  const stageColor = hasScore ? getStageColor(scoreActual) : "#9CA3AF";
  const stageName = hasScore ? getStageName(scoreActual) : "Sin evaluar";

  return (
    <Link
      href={`/entidad/${id}`}
      className="group block rounded-xl border border-zinc-700 bg-zinc-900 p-4 transition-shadow hover:shadow-lg hover:border-zinc-600"
    >
      <div className="flex items-start gap-4">
        {/* Foto retrato + logo partido */}
        <div className="relative shrink-0">
          {foto ? (
            <img
              src={foto}
              alt={nombre}
              className="h-20 w-16 rounded-lg object-cover object-top"
            />
          ) : (
            <div className="flex h-20 w-16 items-center justify-center rounded-lg bg-zinc-800">
              <span className="text-xs text-zinc-500">&mdash;</span>
            </div>
          )}
          {/* Logo partido miniatura */}
          {logoPartido && (
            <img
              src={logoPartido}
              alt={partido || ""}
              className="absolute -bottom-1.5 -right-1.5 h-7 w-7 rounded-full border-2 border-zinc-900 bg-white object-contain"
            />
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-zinc-100 leading-tight group-hover:text-white">
            {nombre}
          </h3>
          {partido && (
            <p className="mt-1 text-xs text-zinc-400 truncate">{partido}</p>
          )}
          {rol && (
            <p className="mt-0.5 text-xs text-zinc-500 capitalize">{rol.replace("-", " ")}</p>
          )}

          {/* Score badge */}
          <div className="mt-2">
            <span
              className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
              style={{ backgroundColor: stageColor }}
            >
              {hasScore ? `${scoreActual} — ${stageName}` : stageName}
            </span>
            {hasScore && totalEvaluaciones > 0 && (
              <span className="ml-2 text-xs text-zinc-500">
                {totalEvaluaciones} eval.
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
