"use client";

import { useMetricasGlobales } from "@/shared/hooks/useMetricasGlobales";

const METRICS = [
  { key: "totalFuentes" as const, label: "fuentes analizadas", pulse: true },
  { key: "totalEvaluaciones" as const, label: "evaluaciones morales", pulse: false },
  { key: "totalCandidatos" as const, label: "candidatos auditados", pulse: false },
] as const;

export function HeroMetrics() {
  const { metricas, loading } = useMetricasGlobales();

  if (loading || !metricas) return null;

  return (
    <div className="mx-auto mt-8 flex flex-wrap items-start justify-center gap-6 sm:gap-10">
      {METRICS.map(({ key, label, pulse }) => (
        <div key={key} className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            {pulse && (
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
            )}
            <span className="text-2xl font-bold tabular-nums text-white sm:text-3xl">
              {metricas[key]}
            </span>
          </div>
          <span className="text-xs tracking-wide text-zinc-500">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
