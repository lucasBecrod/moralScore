"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getEntidadById, getEvaluacionesByEntidad, getFuentesByEntidad, getCandidaturasByEntidad } from "@/firebase/queries";
import { trackMetric } from "@/shared/lib/track-metric";
import { AuthModal } from "@/shared/ui/AuthModal";
import { SITE_CONFIG } from "@/shared/config/site";
import { getPublicLabel } from "@/shared/config/kohlberg-stages";
import HistorialEvaluaciones from "./HistorialEvaluaciones";
import EngagementBar from "./EngagementBar";
import SubirFuenteModal from "@/features/subir-fuente/SubirFuenteModal";
import type { Entidad } from "@/schemas/entidad.schema";
import type { Candidatura } from "@/schemas/candidatura.schema";
import type { Evaluacion } from "@/schemas/evaluacion.schema";
import type { Fuente } from "@/schemas/fuente.schema";

function FuentesRechazadas({ fuentes }: { fuentes: Fuente[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-8">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-zinc-800 px-4 py-3 text-left transition-colors hover:bg-zinc-900"
      >
        <span className="text-sm text-zinc-500">
          Fuentes descartadas ({fuentes.length})
        </span>
        <svg
          className={`h-4 w-4 text-zinc-600 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          {fuentes.map((f) => (
            <div key={f.id} className="flex items-center gap-3 rounded-lg border border-zinc-800/50 bg-zinc-950 p-3 opacity-60">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs text-zinc-600">
                &times;
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-zinc-500">{f.titulo}</p>
                <p className="text-[11px] text-zinc-600">
                  {f.calidadIA?.razon || "Rechazada"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Reutilizar la misma lógica de zona que EntidadCard
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

function displayDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

interface EntidadDetallePageProps {
  id: string;
}

export default function EntidadDetallePage({ id }: EntidadDetallePageProps) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [entidad, setEntidad] = useState<Entidad | null>(null);
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [fuentes, setFuentes] = useState<Fuente[]>([]);
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([
      getEntidadById(id),
      getEvaluacionesByEntidad(id),
      getFuentesByEntidad(id),
      getCandidaturasByEntidad(id),
    ])
      .then(([ent, evals, fts, cands]) => {
        setEntidad(ent);
        setEvaluaciones(evals);
        setFuentes(fts);
        setCandidaturas(cands);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-zinc-400">Cargando...</p>
      </div>
    );
  }

  if (!entidad) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-zinc-100 mb-2">Candidato no encontrado</h1>
        <p className="text-zinc-400 mb-6">No existe un candidato con el identificador &ldquo;{id}&rdquo;.</p>
        <Link href="/" className="text-blue-400 hover:underline">&larr; Volver al inicio</Link>
      </div>
    );
  }

  const candidaturaPrincipal = candidaturas[0] || null;

  const fuenteMap = new Map(fuentes.map((f) => [f.id, f]));

  const evalsForHistorial = evaluaciones.map((ev) => {
    const fuente = fuenteMap.get(ev.fuenteId);
    return {
      id: ev.id,
      estadio: ev.estadio,
      confianza: ev.confianza,
      justificacion: ev.justificacion,
      citas: ev.citas,
      validacionesCiudadanas: ev.validacionesCiudadanas ?? 0,
      fuente: {
        titulo: fuente?.titulo ?? "Fuente desconocida",
        url: fuente?.url,
        medio: fuente?.medio,
        fechaFuente: fuente?.fechaEvento,
      },
    };
  });

  const fuentesSinEvaluar = fuentes.filter((f) => f.estado === "pendiente" || f.estado === "aprobada");
  const fuentesRechazadas = fuentes.filter((f) => f.estado === "rechazada");

  const realEvalCount = evaluaciones.length;
  const zone = entidad.scoreHistorico !== null ? getZoneStyle(entidad.scoreHistorico) : null;
  const filledSegments = entidad.scoreHistorico !== null ? Math.round(entidad.scoreHistorico) : 0;
  const confident = realEvalCount >= 5;

  const score = candidaturaPrincipal?.scoreCandidatura
    ? candidaturaPrincipal.scoreCandidatura.toFixed(1)
    : entidad.scoreHistorico?.toFixed(1) ?? "?";

  function getShareUrl() { return `${SITE_CONFIG.url}/entidad/${id}`; }

  function shareWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(getShareUrl() + "?ref=share_wa")}`, "_blank");
    trackMetric("shares_wa");
  }

  function shareTwitter() {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(getShareUrl() + "?ref=share_tw")}`, "_blank");
    trackMetric("shares_tw");
  }

  function shareFacebook() {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl() + "?ref=share_fb")}`, "_blank");
    trackMetric("shares_fb");
  }

  async function copyLink() {
    await navigator.clipboard.writeText(getShareUrl() + "?ref=share_copy");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    trackMetric("shares_copy");
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-zinc-400 hover:text-white mb-6 transition-colors"
      >
        &larr; Volver al inicio
      </Link>

      {/* Header — mismo patrón visual que EntidadCard */}
      <div className="flex gap-5 mb-10">
        {/* Foto retrato + logo partido */}
        <div className="relative h-36 w-28 shrink-0">
          {entidad.foto ? (
            <img
              src={entidad.foto}
              alt={entidad.nombre}
              className="h-36 w-28 rounded-xl object-cover object-top"
            />
          ) : (
            <div className="flex h-36 w-28 items-center justify-center rounded-xl bg-zinc-800">
              <span className="text-zinc-500 text-2xl">?</span>
            </div>
          )}
          {candidaturaPrincipal?.logoPartido && (
            <img
              src={candidaturaPrincipal.logoPartido}
              alt={candidaturaPrincipal?.partido || ""}
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full border-2 border-zinc-950 bg-white object-contain"
            />
          )}
        </div>

        {/* Info + barra segmentada */}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">
          {/* Identidad */}
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">{entidad.nombre}</h1>
            {candidaturaPrincipal?.partido && (
              <p className="mt-0.5 text-sm text-zinc-400">{candidaturaPrincipal.partido}</p>
            )}
          </div>

          {/* Barra segmentada (consistente con las tarjetas) */}
          {entidad.scoreHistorico !== null && zone ? (
            <div className={`flex flex-col gap-1 ${confident ? "" : "opacity-40"}`}>
              <span className="text-xs text-zinc-500">
                {getPublicLabel(entidad.scoreHistorico!)} ({realEvalCount} evaluaciones)
              </span>
              <div className="flex items-center gap-3">
                <span className={`text-xl font-bold tabular-nums ${zone.text}`}>
                  {entidad.scoreHistorico.toFixed(1)}
                </span>
                <div className="flex max-w-36 flex-1 gap-1">
                  {Array.from({ length: 6 }, (_, i) => (
                    <div
                      key={i}
                      className={`h-3 flex-1 rounded-sm ${i < filledSegments ? zone.bar : "bg-zinc-800"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <div className="flex max-w-36 flex-1 gap-1">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="h-3 flex-1 rounded-sm bg-zinc-800" />
                ))}
              </div>
              <span className="text-xs text-zinc-600">Sin evaluar</span>
            </div>
          )}
        </div>
      </div>

      {/* Engagement bar */}
      <EngagementBar
        copied={copied}
        onShareWhatsApp={shareWhatsApp}
        onShareFacebook={shareFacebook}
        onShareTwitter={shareTwitter}
        onCopyLink={copyLink}
      />

      {/* Evaluaciones */}
      <div className="mb-10">
        <HistorialEvaluaciones evaluaciones={evalsForHistorial} onRequestAuth={() => setAuthModalOpen(true)} />

        {/* Fuentes sin evaluar — inline con las evaluaciones */}
        {fuentesSinEvaluar.length > 0 && (
          <div className="mt-3 space-y-3">
            {fuentesSinEvaluar.map((f) => {
              const titulo = f.titulo !== f.url ? f.titulo : null;
              const domain = f.medio || displayDomain(f.url);

              return (
                <a
                  key={f.id}
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg border border-dashed border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs text-zinc-500">
                      ?
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-300 truncate">
                        {titulo || domain}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {domain}
                        {f.fechaEvento && <> &middot; {f.fechaEvento}</>}
                        <> &middot; {f.tipo}</>
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2.5 py-0.5 text-[11px] font-medium text-yellow-400">
                      Pendiente
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* Fuentes rechazadas — cementerio colapsado */}
      {fuentesRechazadas.length > 0 && (
        <FuentesRechazadas fuentes={fuentesRechazadas} />
      )}

      {/* Botón sugerir fuente */}
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
      >
        <span className="text-lg leading-none">+</span>
        Sugerir fuente
      </button>

      {showModal && (
        <SubirFuenteModal
          entidadId={id}
          onClose={() => setShowModal(false)}
        />
      )}

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setAuthModalOpen(false)}
      />
    </div>
  );
}
