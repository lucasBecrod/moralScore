"use client";

import Link from "next/link";

interface EngagementBarProps {
  hasViewedFuente: boolean;
  liked: boolean;
  likeCount: number;
  copied: boolean;
  onLike: () => void;
  onShareWhatsApp: () => void;
  onShareTwitter: () => void;
  onCopyLink: () => void;
}

export default function EngagementBar({
  hasViewedFuente,
  liked,
  likeCount,
  copied,
  onLike,
  onShareWhatsApp,
  onShareTwitter,
  onCopyLink,
}: EngagementBarProps) {
  return (
    <div className="mb-8 space-y-3">
      {/* Like + Share row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Like button */}
        <div className="relative group">
          <button
            type="button"
            onClick={onLike}
            disabled={!hasViewedFuente}
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              hasViewedFuente
                ? liked
                  ? "border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  : "border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                : "cursor-not-allowed border-zinc-800 text-zinc-600"
            }`}
          >
            <svg
              className={`h-4 w-4 ${liked ? "fill-red-400" : "fill-none"}`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
              />
            </svg>
            {likeCount > 0 && <span className="tabular-nums">{likeCount}</span>}
          </button>
          {!hasViewedFuente && (
            <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              Revisa al menos una fuente para opinar
            </span>
          )}
        </div>

        {/* Share buttons */}
        <button
          type="button"
          onClick={onShareWhatsApp}
          className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-medium text-green-400 transition-colors hover:bg-green-500/20"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp
        </button>

        <button
          type="button"
          onClick={onShareTwitter}
          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          X
        </button>

        <button
          type="button"
          onClick={onCopyLink}
          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          {copied ? "Copiado!" : "Copiar"}
        </button>
      </div>

      {/* Audita el algoritmo */}
      <Link
        href="/metodologia"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300"
      >
        El algoritmo es imparcial.{" "}
        <span className="underline">Audita el c&oacute;digo y los prompts</span>{" "}
        &rarr;
      </Link>
    </div>
  );
}
