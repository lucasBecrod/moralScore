"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getEntidadById, getEvaluacionesByEntidad, getFuentesByEntidad } from "@/firebase/queries";
import { MoralGauge } from "@/shared/ui/MoralGauge";
import HistorialEvaluaciones from "./HistorialEvaluaciones";
import SubirFuenteModal from "@/features/subir-fuente/SubirFuenteModal";
import type { Entidad } from "@/schemas/entidad.schema";
import type { Evaluacion } from "@/schemas/evaluacion.schema";
import type { Fuente } from "@/schemas/fuente.schema";

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

  // Build fuente lookup for evaluaciones (to pass titulo/medio/fechaFuente)
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-zinc-400 hover:text-white mb-6 transition-colors"
      >
        &larr; Volver al inicio
      </Link>

      {/* Header */}
      <div className="flex items-start gap-5 mb-8">
        {/* Foto retrato + logo partido */}
        <div className="relative shrink-0">
          {entidad.foto ? (
            <img
              src={entidad.foto}
              alt={entidad.nombre}
              className="h-28 w-22 rounded-lg object-cover object-top"
            />
          ) : (
            <div className="flex h-28 w-22 items-center justify-center rounded-lg bg-zinc-800">
              <span className="text-zinc-500 text-2xl">?</span>
            </div>
          )}
          {entidad.logoPartido && (
            <img
              src={entidad.logoPartido}
              alt={entidad.partido || ""}
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full border-2 border-zinc-900 bg-white object-contain"
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-zinc-100">{entidad.nombre}</h1>
          {entidad.partido && (
            <p className="text-zinc-400">{entidad.partido}</p>
          )}
          {entidad.rol && (
            <p className="text-sm text-zinc-500 capitalize">{entidad.rol?.replace("-", " ")}</p>
          )}
          <div className="mt-3">
            <MoralGauge score={entidad.scoreActual} size="lg" />
          </div>
          {entidad.totalEvaluaciones > 0 && (
            <p className="mt-1 text-xs text-zinc-600">{entidad.totalEvaluaciones} evaluaciones</p>
          )}
        </div>
      </div>

      {/* Evaluaciones */}
      <div className="mb-8">
        <HistorialEvaluaciones evaluaciones={evalsForHistorial} />
      </div>

      {/* Fuentes pendientes */}
      {fuentesPendientes.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-zinc-100 mb-3">
            Fuentes pendientes ({fuentesPendientes.length})
          </h2>
          <div className="space-y-2">
            {fuentesPendientes.map((f) => (
              <div key={f.id} className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-zinc-700 bg-zinc-900">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-900/30 text-yellow-400">
                  {f.estado}
                </span>
                <span className="text-sm text-zinc-300 truncate">{f.titulo}</span>
                <span className="text-xs text-zinc-500 ml-auto">{f.tipo}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Fuentes aprobadas (pendientes de evaluación) */}
      {fuentesAprobadas.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-zinc-100 mb-3">
            Fuentes por evaluar ({fuentesAprobadas.length})
          </h2>
          <div className="space-y-2">
            {fuentesAprobadas.map((f) => (
              <a
                key={f.id}
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-zinc-700 bg-zinc-900 hover:border-zinc-600 transition-colors"
              >
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-900/30 text-blue-400">
                  {f.tipo}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="text-sm text-zinc-300 truncate block">{f.titulo}</span>
                  {f.medio && <span className="text-xs text-zinc-500">{f.medio} {f.fechaFuente ? `· ${f.fechaFuente}` : ""}</span>}
                </div>
                <span className="text-xs text-zinc-600">&rarr;</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Boton sugerir fuente */}
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors"
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
