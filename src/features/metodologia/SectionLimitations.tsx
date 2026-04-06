const LIMITATIONS = [
  "Medimos razonamiento publico observable, no moralidad interna.",
  "La IA puede equivocarse — por eso hay validacion humana obligatoria.",
  "Fuentes limitadas a discurso publico (entrevistas, debates, conferencias).",
  "El score no es un juicio de valor absoluto: es un indicador basado en evidencia.",
  "El sistema mejora con cada fuente evaluada y cada revision humana.",
];

export function SectionLimitations() {
  return (
    <section>
      <h2 className="font-serif text-2xl font-semibold text-zinc-100">
        Limitaciones
      </h2>
      <ul className="mt-4 space-y-2">
        {LIMITATIONS.map((l) => (
          <li
            key={l}
            className="flex gap-2 text-sm text-zinc-400"
          >
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-600" />
            {l}
          </li>
        ))}
      </ul>
    </section>
  );
}
