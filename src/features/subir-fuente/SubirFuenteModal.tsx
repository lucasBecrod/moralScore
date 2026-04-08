"use client";

import { useState, useCallback } from "react";
import { SubirFuenteInput, FuenteTipo } from "@/schemas/fuente.schema";

interface SubirFuenteModalProps {
  entidadId: string;
  userId: string;
  onClose: () => void;
}

interface UrlMeta {
  title: string | null;
  image: string | null;
  domain: string | null;
}

const TIPO_OPTIONS: { value: FuenteTipo; label: string }[] = [
  { value: "debate", label: "Debate" },
  { value: "entrevista", label: "Entrevista" },
  { value: "conferencia", label: "Conferencia de prensa" },
  { value: "articulo", label: "Art\u00edculo" },
  { value: "youtube", label: "YouTube" },
  { value: "mitin", label: "Discurso / mitin" },
];

export default function SubirFuenteModal({ entidadId, userId, onClose }: SubirFuenteModalProps) {
  const [url, setUrl] = useState("");
  const [tipo, setTipo] = useState<FuenteTipo>("entrevista");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Metadata state
  const [meta, setMeta] = useState<UrlMeta | null>(null);
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [metaError, setMetaError] = useState(false);

  const fetchMeta = useCallback(async (inputUrl: string) => {
    if (!inputUrl || !inputUrl.startsWith("http")) return;

    setLoadingMeta(true);
    setMetaError(false);
    setMeta(null);

    try {
      const res = await fetch("/api/extract-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: inputUrl }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMeta(data);
    } catch {
      setMetaError(true);
    } finally {
      setLoadingMeta(false);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const result = SubirFuenteInput.safeParse({ url, tipo, entidadId });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Datos inv\u00e1lidos");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/fuente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...result.data,
          userId,
          titulo: meta?.title || undefined,
          medio: meta?.domain || undefined,
        }),
      });
      if (!res.ok) throw new Error("Error al enviar");

      // Auto-close after brief success flash
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar la fuente");
      setSending(false);
    }
  }

  const hasPreview = meta && meta.title;
  const canSubmit = !sending && !loadingMeta && url.startsWith("http");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md mx-4 rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-100">Sugerir fuente</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 transition-colors"
            aria-label="Cerrar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* URL input */}
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-zinc-300 mb-1">
              URL de la fuente
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={() => fetchMeta(url)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-zinc-600 bg-zinc-800 text-zinc-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Preview / Loading / Error */}
          {loadingMeta && (
            <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-800/50 p-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-300" />
              <span className="text-xs text-zinc-500">Verificando fuente...</span>
            </div>
          )}

          {metaError && !loadingMeta && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
              <p className="text-xs text-red-400">No se pudo verificar la URL. Verifica que el enlace sea correcto.</p>
            </div>
          )}

          {hasPreview && !loadingMeta && (
            <div className="flex gap-3 rounded-lg border border-zinc-700 bg-zinc-800/50 p-3">
              {meta.image && (
                <img
                  src={meta.image}
                  alt=""
                  className="h-16 w-24 shrink-0 rounded object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-200 line-clamp-2">{meta.title}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{meta.domain}</p>
              </div>
            </div>
          )}

          {/* Tipo */}
          <div>
            <label htmlFor="tipo" className="block text-sm font-medium text-zinc-300 mb-1">
              Tipo de contenido
            </label>
            <select
              id="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as FuenteTipo)}
              className="w-full px-3 py-2 border border-zinc-600 bg-zinc-800 text-zinc-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {TIPO_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-2.5 bg-white text-zinc-900 rounded-lg text-sm font-medium transition-colors hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {sending ? "Enviando..." : "Enviar fuente"}
          </button>
        </form>
      </div>
    </div>
  );
}
