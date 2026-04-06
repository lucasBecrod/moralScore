"use client";

import { useState } from "react";
import { SubirFuenteInput, FuenteTipo } from "@/schemas/fuente.schema";

interface SubirFuenteModalProps {
  candidatoId: string;
  onClose: () => void;
}

const TIPO_OPTIONS: { value: FuenteTipo; label: string }[] = [
  { value: "youtube", label: "YouTube" },
  { value: "articulo", label: "Articulo" },
  { value: "entrevista", label: "Entrevista" },
  { value: "debate", label: "Debate" },
];

export default function SubirFuenteModal({ candidatoId, onClose }: SubirFuenteModalProps) {
  const [url, setUrl] = useState("");
  const [tipo, setTipo] = useState<FuenteTipo>("entrevista");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const result = SubirFuenteInput.safeParse({ url, tipo, candidatoId });
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      setError(firstIssue?.message ?? "Datos inválidos");
      return;
    }

    console.log("Fuente a enviar:", result.data);
    setSubmitted(true);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Sugerir fuente</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-2">&#10003;</div>
            <p className="text-gray-700 font-medium">
              Fuente enviada para revision.
            </p>
            <p className="text-sm text-gray-500 mt-1">Gracias por contribuir.</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition-colors"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                URL de la fuente
              </label>
              <input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de contenido
              </label>
              <select
                id="tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as FuenteTipo)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {TIPO_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Enviar fuente
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
