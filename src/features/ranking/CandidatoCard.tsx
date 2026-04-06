import Link from "next/link";
import { getStageColor, getStageName } from "@/shared/config/kohlberg-stages";
import type { Candidato } from "@/schemas/candidato.schema";

interface CandidatoCardProps {
  candidato: Candidato;
}

export function CandidatoCard({ candidato }: CandidatoCardProps) {
  const { id, nombre, partido, intencionVoto, scoreActual, totalEvaluaciones } =
    candidato;

  const hasScore = scoreActual !== null;
  const stageColor = hasScore ? getStageColor(scoreActual) : "#9CA3AF";
  const stageName = hasScore ? getStageName(scoreActual) : "Sin evaluar";

  return (
    <Link
      href={`/candidato/${id}`}
      className="group block rounded-xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start gap-5">
        {/* Score circle */}
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: hasScore ? stageColor : "#F3F4F6" }}
        >
          {hasScore ? (
            <span className="text-2xl font-bold text-white">
              {scoreActual}
            </span>
          ) : (
            <span className="text-xs font-medium text-zinc-400">—</span>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-zinc-900 group-hover:text-zinc-700">
            {nombre}
          </h3>
          <p className="mt-0.5 text-sm text-zinc-500">{partido}</p>
          <p className="mt-1 text-xs text-zinc-400">
            Intenci&oacute;n de voto: {intencionVoto}
          </p>
        </div>
      </div>

      {/* Stage badge */}
      <div className="mt-4 flex items-center justify-between">
        <span
          className="inline-block rounded-full px-3 py-1 text-xs font-medium text-white"
          style={{ backgroundColor: stageColor }}
        >
          {stageName}
        </span>
        {hasScore && (
          <span className="text-xs text-zinc-400">
            {totalEvaluaciones}{" "}
            {totalEvaluaciones === 1 ? "evaluaci\u00f3n" : "evaluaciones"}
          </span>
        )}
      </div>
    </Link>
  );
}
