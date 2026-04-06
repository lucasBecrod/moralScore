"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getEntidadById, getEvaluacionesByEntidad, getFuentesByEntidad } from "@/firebase/queries";
import HistorialEvaluaciones from "./HistorialEvaluaciones";
import SubirFuenteModal from "@/features/subir-fuente/SubirFuenteModal";
import type { Entidad } from "@/schemas/entidad.schema";
import type { Evaluacion } from "@/schemas/evaluacion.schema";
import type { Fuente } from "@/schemas/fuente.schema";

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

interface EntidadDetallePageProps {
  id: string;
}

export default function EntidadDetallePage({ id }: EntidadDetallePageProps) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [entidad, setEntidad] = useState<Entidad | null>(null);
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [fuentes, setFuentes] = useState<Fuente[]>([]);

  useEffect(() => {
    Promise.all([
      getEntidadById(id),
      getEvaluacionesByEntidad(id),
      getFuentesByEntidad(id),
    ])
      .then(([ent, evals, fts]) => {
        setEntidad(ent);
        setEvaluaciones(evals);
        setFuentes(fts);
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

  const fuenteMap = new Map(fuentes.map((f) => [f.id, f]));

  const evalsForHistorial = evaluaciones.map((ev) => {
    const fuente = fuenteMap.get(ev.fuenteId);
    return {
      id: ev.id,
      estadio: ev.estadio,
      confianza: ev.confianza,
      justificacion: ev.justificacion,
      citas: ev.citas,
      fuente: {
        titulo: fuente?.titulo ?? "Fuente desconocida",
        url: fuente?.url,
        medio: fuente?.medio,
        fechaFuente: fuente?.fechaFuente,
      },
    };
  });

  const fuentesPendientes = fuentes.filter((f) => f.estado === "pendiente");
  const fuentesAprobadas = fuentes.filter((f) => f.estado === "aprobada");

  const zone = entidad.scoreActual !== null ? getZoneStyle(entidad.scoreActual) : null;
  const filledSegments = entidad.scoreActual !== null ? Math.round(entidad.scoreActual) : 0;
  const confident = entidad.totalEvaluaciones >= 5;

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
          {entidad.logoPartido && (
            <img
              src={entidad.logoPartido}
              alt={entidad.partido || ""}
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full border-2 border-zinc-950 bg-white object-contain"
            />
          )}
        </div>

        {/* Info + barra segmentada */}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">
          {/* Identidad */}
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">{entidad.nombre}</h1>
            {entidad.partido && (
              <p className="mt-0.5 text-sm text-zinc-400">{entidad.partido}</p>
            )}
          </div>

          {/* Barra segmentada (consistente con las tarjetas) */}
          {entidad.scoreActual !== null && zone ? (
            <div className={`flex flex-col gap-1 ${confident ? "" : "opacity-40"}`}>
              <span className="text-xs text-zinc-500">
                Estadio {zone.label} ({entidad.totalEvaluaciones} eval.)
              </span>
              <div className="flex items-center gap-3">
                <span className={`text-xl font-bold tabular-nums ${zone.text}`}>
                  {entidad.scoreActual.toFixed(1)}
                </span>
                <div className="flex flex-1 gap-1">
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
              <div className="flex flex-1 gap-1">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="h-3 flex-1 rounded-sm bg-zinc-800" />
                ))}
              </div>
              <span className="text-xs text-zinc-600">Sin evaluar</span>
            </div>
          )}
        </div>
      </div>

      {/* Evaluaciones */}
      <div className="mb-10">
        <HistorialEvaluaciones evaluaciones={evalsForHistorial} />
      </div>

      {/* Pipeline: fuentes pendientes + por evaluar */}
      {(fuentesPendientes.length > 0 || fuentesAprobadas.length > 0) && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 mb-8">
          {fuentesPendientes.length > 0 && (
            <section className="mb-6 last:mb-0">
              <h2 className="text-sm font-semibold text-zinc-400 mb-3">
                Fuentes pendientes ({fuentesPendientes.length})
              </h2>
              <div className="space-y-2">
                {fuentesPendientes.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-zinc-800 bg-zinc-900/50">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-900/30 text-yellow-400">
                      {f.estado}
                    </span>
                    <span className="text-sm text-zinc-400 truncate">{f.titulo}</span>
                    <span className="text-xs text-zinc-600 ml-auto">{f.tipo}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {fuentesAprobadas.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-zinc-400 mb-3">
                Fuentes por evaluar ({fuentesAprobadas.length})
              </h2>
              <div className="space-y-2">
                {fuentesAprobadas.map((f) => (
                  <a
                    key={f.id}
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-colors"
                  >
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-900/30 text-blue-400">
                      {f.tipo}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm text-zinc-400 truncate block">{f.titulo}</span>
                      {f.medio && <span className="text-xs text-zinc-500">{f.medio} {f.fechaFuente ? `· ${f.fechaFuente}` : ""}</span>}
                    </div>
                    <span className="text-xs text-zinc-600">&rarr;</span>
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
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
    </div>
  );
}
