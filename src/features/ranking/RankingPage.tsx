"use client";

import { useEffect, useLayoutEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCandidaturas } from "@/shared/hooks/useCandidaturas";
import { useAuthContext } from "@/shared/providers/AuthProvider";
import { AuthModal } from "@/shared/ui/AuthModal";
import { OpenSourceCTA } from "@/shared/ui/OpenSourceCTA";
import { EntidadCard } from "./EntidadCard";

const SORT_OPTIONS = [
  { value: "evidencia" as const, label: "M\u00e1s evidencia" },
  { value: "score" as const, label: "Mayor score" },
  { value: "az" as const, label: "A\u2013Z" },
];

const SCROLL_KEY = "ranking-scroll-y";

export function RankingPage() {
  const { candidaturas, loading } = useCandidaturas("presidenciales-2026");
  const [shuffleKey, setShuffleKey] = useState(0);
  const [sortBy, setSortBy] = useState<"evidencia" | "score" | "az">("evidencia");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user } = useAuthContext();
  const router = useRouter();
  const restoredRef = useRef(false);

  // Guardar posición de scroll al salir
  useEffect(() => {
    const save = () => sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
    window.addEventListener("beforeunload", save);
    return () => {
      save();
      window.removeEventListener("beforeunload", save);
    };
  }, []);

  // Restaurar posición cuando los datos están listos
  useLayoutEffect(() => {
    if (!loading && candidaturas.length > 0 && !restoredRef.current) {
      const saved = sessionStorage.getItem(SCROLL_KEY);
      if (saved) {
        requestAnimationFrame(() => window.scrollTo(0, parseInt(saved, 10)));
      }
      restoredRef.current = true;
    }
  }, [loading, candidaturas]);

  const sorted = useMemo(() => {
    const list = [...candidaturas];
    switch (sortBy) {
      case "evidencia":
        return list.sort((a, b) => {
          if (a.evaluacionesCandidatura > 0 && b.evaluacionesCandidatura === 0) return -1;
          if (a.evaluacionesCandidatura === 0 && b.evaluacionesCandidatura > 0) return 1;
          if (a.evaluacionesCandidatura !== b.evaluacionesCandidatura) return b.evaluacionesCandidatura - a.evaluacionesCandidatura;
          return a.nombre.localeCompare(b.nombre);
        });
      case "score":
        return list.sort((a, b) => {
          if (a.scoreCandidatura !== null && b.scoreCandidatura !== null) return b.scoreCandidatura - a.scoreCandidatura;
          if (a.scoreCandidatura !== null) return -1;
          if (b.scoreCandidatura !== null) return 1;
          return a.nombre.localeCompare(b.nombre);
        });
      case "az":
        return list.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }
  }, [candidaturas, sortBy]);

  // Rotar retratos del hero cada 20s
  useEffect(() => {
    const interval = setInterval(() => setShuffleKey((k) => k + 1), 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* Hero section */}
      <section className="border-b border-zinc-800 bg-zinc-950 px-4 py-20 text-center">
        <h1 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl">
          El fin de la hipocres&iacute;a pol&iacute;tica.
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-balance text-lg leading-relaxed text-zinc-400">
          Un algoritmo de c&oacute;digo abierto que audita el discurso
          de los candidatos y lo estrella contra su historial material.
        </p>
        <p className="mt-2 text-sm tracking-wide text-zinc-500">
          La ret&oacute;rica define su potencial. Sus actos fijan su l&iacute;mite.
        </p>

        {/* Retratos solapados — formato vertical para fotos del JNE */}
        {!loading && candidaturas.length > 0 && (
          <div className="mx-auto mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <div className="flex -space-x-2">
              {(() => {
                const withFoto = [...candidaturas.filter((c) => c.foto)]
                  .sort(() => Math.random() - 0.5 + shuffleKey * 0);
                const main = withFoto.slice(0, 7);
                const logos = [...new Set(withFoto.map((c) => c.logoPartido).filter(Boolean))]
                  .sort(() => Math.random() - 0.5 + shuffleKey * 0)
                  .slice(0, 2);
                return (
                  <>
                    {main.map((c) => (
                      <img
                        key={c.id}
                        src={c.foto!}
                        alt={c.nombre}
                        title={c.nombre}
                        className="h-14 w-10 rounded-lg border-2 border-zinc-950 object-cover object-top shadow-md"
                      />
                    ))}
                    {logos.length > 0 && (
                      <div className="grid h-14 w-10 grid-cols-1 grid-rows-2 gap-px overflow-hidden rounded-lg border-2 border-zinc-950 bg-zinc-800 shadow-md">
                        {logos.map((logo) => (
                          <img
                            key={logo}
                            src={logo!}
                            alt="Partido"
                            className="h-full w-full object-contain bg-white p-px"
                          />
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
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
        <p className="mb-4 text-center text-sm text-zinc-500">
          El discurso define la mediana. La evidencia dura activa el colapso.
          &iquest;Conoces un voto pol&eacute;mico o una sentencia? S&uacute;bela.
        </p>

        {/* Sort chips */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                sortBy === opt.value
                  ? "bg-zinc-700 text-zinc-100"
                  : "border border-zinc-800 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-zinc-400">Cargando...</p>
        ) : sorted.length === 0 ? (
          <p className="text-center text-zinc-400">No hay registros a&uacute;n.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {sorted.map((c) => (
              <EntidadCard key={c.id} candidatura={c} />
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <button
            onClick={() => {
              if (user) {
                router.push("/registrar");
              } else {
                setAuthModalOpen(true);
              }
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <span className="text-lg leading-none">+</span>
            Registrar
          </button>
          <AuthModal
            open={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
            onSuccess={() => {
              setAuthModalOpen(false);
              router.push("/registrar");
            }}
          />
        </div>
      </section>

      <OpenSourceCTA />
    </div>
  );
}
