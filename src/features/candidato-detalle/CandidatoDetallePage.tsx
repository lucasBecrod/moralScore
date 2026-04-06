"use client";

import { useState } from "react";
import Link from "next/link";
import { KOHLBERG_STAGES, type KohlbergStage } from "@/shared/config/kohlberg-stages";
import HistorialEvaluaciones from "./HistorialEvaluaciones";
import SubirFuenteModal from "@/features/subir-fuente/SubirFuenteModal";

// --- Seed data ---

const CANDIDATOS_SEED: Record<string, {
  nombre: string;
  partido: string;
  intencionVoto: string;
  scoreActual: number | null;
}> = {
  "keiko-fujimori": { nombre: "Keiko Fujimori", partido: "Fuerza Popular", intencionVoto: "8.0% - 10.0%", scoreActual: null },
  "rafael-lopez-aliaga": { nombre: "Rafael López Aliaga", partido: "Renovación Popular", intencionVoto: "8.7% - 12.0%", scoreActual: null },
  "carlos-alvarez": { nombre: "Carlos Álvarez", partido: "País para Todos", intencionVoto: "4.0%", scoreActual: null },
  "jorge-nieto": { nombre: "Jorge Nieto Montesinos", partido: "Partido del Buen Gobierno", intencionVoto: "2.0%", scoreActual: null },
};

const EVALUACION_EJEMPLO = {
  id: "eval-ejemplo-1",
  candidatoId: "keiko-fujimori",
  fuenteId: "fuente-1",
  estadio: 4,
  confianza: "alta" as const,
  justificacion: "La candidata fundamenta su posición apelando consistentemente al marco constitucional y al fortalecimiento institucional como bases de su propuesta de gobierno.",
  citas: [
    { texto: "Debemos respetar la Constitución y el Estado de derecho como base fundamental de nuestra democracia", ubicacion: "Minuto 5:23", indicador: "Apelación a la ley y el orden constitucional (Estadio 4)" },
    { texto: "Las instituciones deben funcionar de manera independiente, sin interferencia política", ubicacion: "Minuto 12:45", indicador: "Respeto al orden institucional establecido (Estadio 4)" },
  ],
  estadioAlternativo: null,
  notas: "Evaluación de ejemplo para demostrar la interfaz.",
  evaluador: "lucas" as const,
  validadoPor: null,
  createdAt: "2026-04-05T00:00:00Z",
  fuente: { url: "https://example.com/entrevista-ejemplo", tipo: "entrevista" as const, titulo: "Entrevista en RPP — Ejemplo demostrativo", medio: "RPP", fechaFuente: "2026-03-15" },
};

const FUENTES_PENDIENTES = [
  { id: "fp-1", url: "https://example.com/debate-1", tipo: "debate", titulo: "Debate presidencial JNE", estado: "pendiente" },
];

// --- Component ---

interface CandidatoDetallePageProps {
  id: string;
}

export default function CandidatoDetallePage({ id }: CandidatoDetallePageProps) {
  const [showModal, setShowModal] = useState(false);

  const candidato = CANDIDATOS_SEED[id];

  if (!candidato) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Candidato no encontrado</h1>
        <p className="text-gray-500 mb-6">No existe un candidato con el identificador &ldquo;{id}&rdquo;.</p>
        <Link href="/" className="text-blue-600 hover:underline">&larr; Volver a candidatos</Link>
      </div>
    );
  }

  const evaluaciones = EVALUACION_EJEMPLO.candidatoId === id
    ? [{
        ...EVALUACION_EJEMPLO,
        fuente: {
          titulo: EVALUACION_EJEMPLO.fuente.titulo,
          medio: EVALUACION_EJEMPLO.fuente.medio,
          fechaFuente: EVALUACION_EJEMPLO.fuente.fechaFuente,
        },
      }]
    : [];

  const fuentesPendientes = id === "keiko-fujimori" ? FUENTES_PENDIENTES : [];

  const score = evaluaciones.length > 0 ? evaluaciones[0].estadio : candidato.scoreActual;
  const stage = score ? KOHLBERG_STAGES[score as KohlbergStage] : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        &larr; Volver a candidatos
      </Link>

      {/* Header */}
      <div className="flex items-start gap-5 mb-8">
        {/* Score circle */}
        <div
          className="flex-shrink-0 w-20 h-20 rounded-full flex items-center justify-center"
          style={{ backgroundColor: stage?.color ?? "#E5E7EB" }}
        >
          <span className="text-3xl font-bold text-white">
            {score ?? "?"}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">{candidato.nombre}</h1>
          <p className="text-gray-500">{candidato.partido}</p>
          <p className="text-sm text-gray-400 mt-1">
            Intención de voto: {candidato.intencionVoto}
          </p>
          {stage && (
            <p className="text-sm mt-2" style={{ color: stage.color }}>
              Estadio {score}: {stage.nombre} ({stage.nivel})
            </p>
          )}
        </div>
      </div>

      {/* Evaluaciones */}
      <div className="mb-8">
        <HistorialEvaluaciones evaluaciones={evaluaciones} />
      </div>

      {/* Fuentes pendientes */}
      {fuentesPendientes.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Fuentes pendientes ({fuentesPendientes.length})
          </h2>
          <div className="space-y-2">
            {fuentesPendientes.map((f) => (
              <div key={f.id} className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-gray-300 bg-gray-50">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  {f.estado}
                </span>
                <span className="text-sm text-gray-700 truncate">{f.titulo}</span>
                <span className="text-xs text-gray-400 ml-auto">{f.tipo}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Boton sugerir fuente */}
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
      >
        <span className="text-lg leading-none">+</span>
        Sugerir fuente
      </button>

      {showModal && (
        <SubirFuenteModal
          candidatoId={id}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
