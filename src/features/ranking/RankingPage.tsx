import { CandidatoCard } from "./CandidatoCard";
import type { Candidato } from "@/schemas/candidato.schema";

const CANDIDATOS_SEED: Candidato[] = [
  {
    id: "keiko-fujimori",
    nombre: "Keiko Fujimori",
    partido: "Fuerza Popular",
    intencionVoto: "8.0% - 10.0%",
    planGobierno: "",
    foto: "",
    scoreActual: null,
    totalEvaluaciones: 0,
  },
  {
    id: "rafael-lopez-aliaga",
    nombre: "Rafael López Aliaga",
    partido: "Renovación Popular",
    intencionVoto: "8.7% - 12.0%",
    planGobierno: "",
    foto: "",
    scoreActual: null,
    totalEvaluaciones: 0,
  },
  {
    id: "carlos-alvarez",
    nombre: "Carlos Álvarez",
    partido: "País para Todos",
    intencionVoto: "4.0%",
    planGobierno: "",
    foto: "",
    scoreActual: null,
    totalEvaluaciones: 0,
  },
  {
    id: "jorge-nieto",
    nombre: "Jorge Nieto Montesinos",
    partido: "Partido del Buen Gobierno",
    intencionVoto: "2.0%",
    planGobierno: "",
    foto: "",
    scoreActual: null,
    totalEvaluaciones: 0,
  },
];

export function RankingPage() {
  const candidatos = CANDIDATOS_SEED;

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          Candidatos &mdash; Elecciones Per&uacute; 2026
        </h1>
        <p className="mt-3 text-base text-zinc-500">
          Score de razonamiento moral basado en la escala de Kohlberg (1-6)
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2">
        {candidatos.map((c) => (
          <CandidatoCard key={c.id} candidato={c} />
        ))}
      </div>
    </section>
  );
}
