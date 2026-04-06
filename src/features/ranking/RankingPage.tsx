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
      <section className="border-b border-zinc-800 bg-zinc-950 px-4 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          &iquest;C&oacute;mo razonan moralmente
          <br className="hidden sm:block" />
          tus candidatos?
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-balance text-lg leading-relaxed text-zinc-400">
          Analizamos el discurso p&uacute;blico de cada candidato presidencial
          con inteligencia artificial.
        </p>
        <p className="mt-1 text-sm tracking-wide text-zinc-500">
          Sin ideolog&iacute;a. Solo evidencia.
        </p>

        {/* Avatares apilados — solo fotos, overlap agresivo */}
        {!loading && entidades.length > 0 && (
          <div className="mx-auto mt-8 flex items-center justify-center gap-3">
            <div className="flex -space-x-3">
              {entidades
                .filter((e) => e.foto)
                .slice(0, 8)
                .map((e) => (
                  <img
                    key={e.id}
                    src={e.foto!}
                    alt={e.nombre}
                    title={e.nombre}
                    className="h-10 w-10 rounded-full border-2 border-zinc-950 object-cover object-top ring-1 ring-zinc-800"
                  />
                ))}
              {entidades.length > 8 && (
                <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-zinc-950 bg-zinc-800 text-xs font-medium text-zinc-300 ring-1 ring-zinc-800">
                  +{entidades.length - 8}
                </span>
              )}
            </div>
            <span className="text-sm text-zinc-500">
              {entidades.length} candidatos analizados
            </span>
          </div>
        )}

        {/* CTA principal */}
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href="#ranking"
            className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-zinc-900 shadow-lg shadow-white/5 transition-all hover:bg-zinc-100 hover:shadow-white/10"
          >
            Explorar candidatos
          </a>
          <Link
            href="/metodologia"
            className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-300"
          >
            &iquest;C&oacute;mo se calcula? &rarr;
          </Link>
        </div>
      </section>

      {/* Ranking */}
      <section id="ranking" className="mx-auto max-w-3xl px-4 py-12">
        <h2 className="mb-2 text-center text-xl font-semibold text-zinc-100">
          Candidatos presidenciales
        </h2>
        <p className="mb-4 text-center text-sm text-zinc-500">
          Ordenados por score moral. Sin evaluar al final.
        </p>
        <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-500">
            Escala de Kohlberg (1-6)
          </span>
          <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-500">
            Moralidad Com&uacute;n de Gert
          </span>
        </div>

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
