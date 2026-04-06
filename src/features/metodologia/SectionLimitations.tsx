const LIMITATIONS = [
  "Medimos razonamiento p\u00fablico observable, no moralidad interna.",
  "La IA puede alucinar \u2014 por eso el motor usa validaci\u00f3n cruzada (Kohlberg vs Gert) y cada score incluye trazabilidad absoluta al video original para auditor\u00eda p\u00fablica.",
  "Fuentes limitadas a discurso p\u00fablico (entrevistas, debates, conferencias).",
  "El score no es un juicio de valor absoluto: es un indicador basado en evidencia.",
  "El sistema mejora con cada nueva fuente evaluada y cada impugnaci\u00f3n ciudadana.",
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
