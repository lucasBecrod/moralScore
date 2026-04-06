"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getEntidades } from "@/firebase/queries";
import { EntidadCard } from "./EntidadCard";
import type { Entidad } from "@/schemas/entidad.schema";

export function RankingPage() {
  const [entidades, setEntidades] = useState<Entidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [shuffleKey, setShuffleKey] = useState(0);

  useEffect(() => {
    getEntidades()
      .then((data) => {
        const sorted = data.sort((a, b) => {
          // Primero: candidatos con evaluaciones arriba
          if (a.totalEvaluaciones > 0 && b.totalEvaluaciones === 0) return -1;
          if (a.totalEvaluaciones === 0 && b.totalEvaluaciones > 0) return 1;
          // Segundo: más evidencia procesada primero
          if (a.totalEvaluaciones !== b.totalEvaluaciones) return b.totalEvaluaciones - a.totalEvaluaciones;
          // Empate: alfabético
          return a.nombre.localeCompare(b.nombre);
        });
        setEntidades(sorted);
      })
      .finally(() => setLoading(false));
  }, []);

  // Rotar retratos del hero cada 20s
  useEffect(() => {
    const interval = setInterval(() => setShuffleKey((k) => k + 1), 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* Hero section */}
      <section className="border-b border-zinc-800 bg-zinc-950 px-4 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          El fin de la amnesia
          <br className="hidden sm:block" />
          pol&iacute;tica.
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-balance text-lg leading-relaxed text-zinc-400">
          Un algoritmo que procesa la vida p&uacute;blica de los candidatos
          para revelar c&oacute;mo razonan realmente.
        </p>
        <p className="mt-1 text-sm tracking-wide text-zinc-500">
          Sin ideolog&iacute;a. Sin olvidos. Solo evidencia.
        </p>

        {/* Retratos solapados — formato vertical para fotos del JNE */}
        {!loading && entidades.length > 0 && (
          <div className="mx-auto mt-8 flex items-center justify-center gap-3">
            <div className="flex -space-x-2">
              {[...entidades.filter((e) => e.foto)]
                .sort(() => Math.random() - 0.5 + shuffleKey * 0)
                .slice(0, 7)
                .map((e) => (
                  <img
                    key={e.id}
                    src={e.foto!}
                    alt={e.nombre}
                    title={e.nombre}
                    className="h-14 w-10 rounded-lg border-2 border-zinc-950 object-cover object-top shadow-md"
                  />
                ))}
              {entidades.length > 7 && (
                <span className="flex h-14 w-10 items-center justify-center rounded-lg border-2 border-zinc-950 bg-zinc-800 text-xs font-medium text-zinc-300">
                  +{entidades.length - 7}
                </span>
              )}
            </div>
            <a href="#ranking" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">
              Ver candidatos &darr;
            </a>
          </div>
        )}

        {/* CTA secundario */}
        <div className="mt-10 flex items-center justify-center">
          <Link
            href="/metodologia"
            className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-300"
          >
            C&oacute;mo funciona el algoritmo &rarr;
          </Link>
        </div>
      </section>

      {/* Ranking */}
      <section id="ranking" className="mx-auto max-w-3xl px-4 py-12">
        <h2 className="mb-2 text-center text-xl font-semibold text-zinc-100">
          Auditor&iacute;a P&uacute;blica de Candidatos
        </h2>
        <p className="mb-6 text-center text-sm text-zinc-500">
          El score es resultado directo de las fuentes subidas. Si falta evidencia, s&uacute;bela.
        </p>

        {loading ? (
          <p className="text-center text-zinc-400">Cargando...</p>
        ) : entidades.length === 0 ? (
          <p className="text-center text-zinc-400">No hay registros a&uacute;n.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
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
