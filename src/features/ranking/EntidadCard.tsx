import Link from "next/link";
import { MoralGauge } from "@/shared/ui/MoralGauge";
import type { Entidad } from "@/schemas/entidad.schema";

interface EntidadCardProps {
  entidad: Entidad;
}

export function EntidadCard({ entidad }: EntidadCardProps) {
  const { id, nombre, partido, rol, foto, logoPartido, scoreActual, totalEvaluaciones } = entidad;

  return (
    <Link
      href={`/entidad/${id}`}
      className="group block rounded-xl border border-zinc-700 bg-zinc-900 p-4 transition-shadow hover:shadow-lg hover:border-zinc-600"
    >
      <div className="flex items-start gap-3">
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
            <p className="mt-0.5 text-xs text-zinc-400 truncate">{partido}</p>
          )}
          {rol && (
            <p className="mt-0.5 text-xs text-zinc-500 capitalize">{rol.replace("-", " ")}</p>
          )}
          {scoreActual !== null && totalEvaluaciones > 0 && (
            <p className="mt-0.5 text-xs text-zinc-600">{totalEvaluaciones} eval.</p>
          )}
        </div>

        {/* MoralGauge */}
        <div className="shrink-0">
          <MoralGauge score={scoreActual} size="sm" />
        </div>
      </div>
    </Link>
  );
}
