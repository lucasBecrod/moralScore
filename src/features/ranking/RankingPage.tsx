"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getEntidades } from "@/firebase/queries";
import { EntidadCard } from "./EntidadCard";
import type { Entidad } from "@/schemas/entidad.schema";

export function RankingPage() {
  const [entidades, setEntidades] = useState<Entidad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEntidades()
      .then((data) => {
        const sorted = data.sort((a, b) => {
          if (a.scoreActual !== null && b.scoreActual !== null) return b.scoreActual - a.scoreActual;
          if (a.scoreActual !== null) return -1;
          if (b.scoreActual !== null) return 1;
          return a.nombre.localeCompare(b.nombre);
        });
        setEntidades(sorted);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero section */}
      <section className="border-b border-zinc-800 bg-zinc-950 px-4 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          &iquest;C&oacute;mo razonan moralmente tus candidatos?
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
          Analizamos el discurso p&uacute;blico de cada candidato presidencial
          usando inteligencia artificial. Sin ideolog&iacute;a. Solo evidencia.
        </p>

        {/* Avatares apilados */}
        {!loading && entidades.length > 0 && (
          <div className="mx-auto mt-6 flex items-center justify-center gap-3">
            <div className="flex -space-x-2">
              {entidades.slice(0, 8).flatMap((e) => {
                const items = [];
                // Foto candidato
                items.push(
                  e.foto ? (
                    <img
                      key={`foto-${e.id}`}
                      src={e.foto}
                      alt={e.nombre}
                      title={e.nombre}
                      className="h-8 w-8 rounded-full border-2 border-zinc-950 object-cover object-top"
                    />
                  ) : (
                    <div
                      key={`foto-${e.id}`}
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-zinc-950 bg-zinc-800 text-xs text-zinc-500"
                    >
                      ?
                    </div>
                  )
                );
                // Logo partido (intercalado)
                if (e.logoPartido) {
                  items.push(
                    <img
                      key={`logo-${e.id}`}
                      src={e.logoPartido}
                      alt={e.partido || ""}
                      title={e.partido || ""}
                      className="h-8 w-8 rounded-full border-2 border-zinc-950 bg-white object-contain"
                    />
                  );
                }
                return items;
              }).slice(0, 12)}
            </div>
            <span className="text-sm text-zinc-400">
              {entidades.length} candidatos presidenciales
            </span>
          </div>
        )}

        {/* Método badges */}
        <div className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-3">
          <span className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-1.5 text-sm text-zinc-300">
            Escala de Kohlberg (1-6)
          </span>
          <span className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-1.5 text-sm text-zinc-300">
            Moralidad Com&uacute;n de Gert
          </span>
        </div>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#ranking"
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
          >
            Ver candidatos
          </a>
          <Link
            href="/metodologia"
            className="rounded-lg border border-zinc-600 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            &iquest;C&oacute;mo se calcula?
          </Link>
        </div>

      </section>

      {/* Ranking */}
      <section id="ranking" className="mx-auto max-w-3xl px-4 py-12">
        <h2 className="mb-2 text-center text-xl font-semibold text-zinc-100">
          Candidatos presidenciales
        </h2>
        <p className="mb-6 text-center text-sm text-zinc-500">
          Ordenados por score moral. Sin evaluar al final.
        </p>

        {loading ? (
          <p className="text-center text-zinc-400">Cargando...</p>
        ) : entidades.length === 0 ? (
          <p className="text-center text-zinc-400">No hay registros a&uacute;n.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {entidades.map((e) => (
              <EntidadCard key={e.id} entidad={e} />
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/registrar"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <span className="text-lg leading-none">+</span>
            Registrar
          </Link>
        </div>
      </section>
    </div>
  );
}
