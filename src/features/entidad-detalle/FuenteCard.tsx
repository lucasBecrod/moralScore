"use client";

import { useState, useEffect } from "react";
import { KOHLBERG_STAGES, type KohlbergStage } from "@/shared/config/kohlberg-stages";
import { getValidacionStatus, toggleValidacion } from "@/firebase/queries";
import { trackMetric } from "@/shared/lib/track-metric";
import { useAuthContext } from "@/shared/providers/AuthProvider";

interface Cita {
  texto: string;
  ubicacion: string;
  indicador: string;
}

interface FuenteCardProps {
  evaluacionId: string;
  estadio: number;
  titulo: string;
  url?: string;
  medio?: string;
  fechaFuente?: string;
  confianza: "alta" | "media" | "baja";
  justificacion: string;
  citas: Cita[];
  imagen?: string;
  validacionesCiudadanas?: number;
  onExpand?: () => void;
  onRequestAuth?: () => void;
}

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

// Parsea **negritas** en texto → <strong> con resaltado del color del estadio
function parseInlineMd(text: string, highlightColor?: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const inner = part.slice(2, -2);
      return (
        <strong
          key={i}
          className="font-semibold text-zinc-100 rounded-sm px-0.5"
          style={highlightColor ? { backgroundColor: highlightColor + "20" } : undefined}
        >
          {inner}
        </strong>
      );
    }
    return part;
  });
}

function getFavicon(url?: string): string | null {
  if (!url) return null;
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return null;
  }
}

export default function FuenteCard({
  evaluacionId,
  estadio,
  titulo,
  url,
  medio,
  fechaFuente,
  confianza,
  justificacion,
  citas,
  imagen,
  validacionesCiudadanas = 0,
  onExpand,
  onRequestAuth,
}: FuenteCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [validated, setValidated] = useState(false);
  const [validCount, setValidCount] = useState(validacionesCiudadanas);
  const [statusLoaded, setStatusLoaded] = useState(false);
  const { user } = useAuthContext();

  // Lazy load: solo consultar estado de validación al expandir
  useEffect(() => {
    if (expanded && user && !statusLoaded) {
      getValidacionStatus(user.uid, evaluacionId).then((v) => {
        setValidated(v);
        setStatusLoaded(true);
      });
    }
  }, [expanded, user, evaluacionId, statusLoaded]);

  async function handleValidate(e: React.MouseEvent) {
    e.stopPropagation();
    if (!user) { onRequestAuth?.(); return; }
    const nowValidated = await toggleValidacion(user.uid, evaluacionId);
    setValidated(nowValidated);
    setValidCount((c) => c + (nowValidated ? 1 : -1));
    trackMetric(nowValidated ? "validaciones_dadas" : "validaciones_quitadas");
  }
  const stage = KOHLBERG_STAGES[estadio as KohlbergStage];
  const color = stage?.color ?? "#6B7280";
  const zone = getZoneStyle(estadio);
  const filledSegments = Math.round(estadio);

  const favicon = getFavicon(url);
  const thumbSrc = imagen || favicon;

  return (
    <div
      className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 cursor-pointer transition-colors hover:border-zinc-700"
      onClick={() => {
        const willExpand = !expanded;
        setExpanded(willExpand);
        if (willExpand) onExpand?.();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          const willExpand = !expanded;
          setExpanded(willExpand);
          if (willExpand) onExpand?.();
        }
      }}
    >
      {/* Colapsado */}
      <div className="flex items-center gap-3 p-4">
        {/* Thumbnail izquierdo */}
        {thumbSrc ? (
          <img
            src={thumbSrc}
            alt={medio || ""}
            className="h-10 w-10 shrink-0 rounded-lg bg-zinc-800 object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-sm font-medium text-zinc-500">
            {(medio || "?")[0].toUpperCase()}
          </span>
        )}

        {/* Contenido central */}
        <div className="min-w-0 flex-1">
          <p className="font-medium text-zinc-100 line-clamp-2">{titulo}</p>
          <p className="mt-0.5 text-xs text-zinc-500">
            {medio}
            {medio && fechaFuente && " \u00b7 "}
            {fechaFuente}
            {" \u00b7 "}
            <span className="uppercase">{confianza}</span>
          </p>

          {/* Barra segmentada inline — mismo componente que EntidadCard */}
          <div className="mt-1.5 flex items-center gap-2">
            <span className={`text-xs font-bold tabular-nums ${zone.text}`}>
              {estadio.toFixed(1)}
            </span>
            <div className="flex max-w-32 flex-1 gap-0.5">
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-sm ${i < filledSegments ? zone.bar : "bg-zinc-800"}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Chevron */}
        <svg
          className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Expandido */}
      {expanded && (
        <div className="border-t border-zinc-800 bg-white/[0.02] px-4 pb-4 pt-3 space-y-4">
          <p className="text-sm leading-relaxed text-zinc-300">{parseInlineMd(justificacion)}</p>

          {citas.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
                Radiograf&iacute;a del discurso
              </h4>
              {citas.map((cita, i) => (
                <div key={i} className="border-l-2 pl-3 space-y-1" style={{ borderColor: color }}>
                  <p className="text-sm italic leading-relaxed text-zinc-200">
                    &ldquo;{parseInlineMd(cita.texto, color)}&rdquo;
                  </p>
                  <p className="text-[11px] text-zinc-500">{cita.ubicacion}</p>
                  <span
                    className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{ backgroundColor: color + "15", color }}
                  >
                    {cita.indicador}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Actions row: source link + validate button */}
          <div className="flex items-center justify-between">
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Ver fuente original &rarr;
              </a>
            )}
            <button
              type="button"
              onClick={handleValidate}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                validated
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  : "border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <svg className={`h-3.5 w-3.5 ${validated ? "fill-emerald-400" : "fill-none"}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              {validated ? "Validado" : "Validar análisis"}
              {validCount > 0 && <span className="tabular-nums">({validCount})</span>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
