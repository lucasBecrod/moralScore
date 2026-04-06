const SOURCE_TYPES = [
  { type: "Debate", utility: "ALTA", weight: "1.0" },
  { type: "Entrevista adversarial", utility: "ALTA", weight: "0.9" },
  { type: "Conferencia de prensa", utility: "MEDIA", weight: "0.7" },
  { type: "Articulo con citas directas", utility: "DEPENDE", weight: "0.6" },
  { type: "Entrevista amigable", utility: "MEDIA-BAJA", weight: "0.5" },
  { type: "Discurso / mitin", utility: "BAJA", weight: "0.3" },
  { type: "Red social (tweet, post)", utility: "BAJA", weight: "0.2" },
  { type: "Spot / publicidad", utility: "NULA", weight: "0.0" },
];

function utilityColor(u: string) {
  if (u === "ALTA") return "text-emerald-400";
  if (u.startsWith("MEDIA")) return "text-amber-400";
  if (u === "DEPENDE") return "text-blue-400";
  return "text-red-400";
}

export function SectionSourceQuality() {
  return (
    <section>
      <h2 className="font-serif text-2xl font-semibold text-zinc-100">
        Criterios de calidad de fuentes
      </h2>
      <p className="mt-2 text-sm text-zinc-400">
        La fuente es util si el candidato responde a un dilema o pregunta
        dificil con su propia justificacion. Cuanto mas espontaneo, mejor.
      </p>

      {/* Mobile-friendly stacked cards instead of table */}
      <div className="mt-4 space-y-2">
        {SOURCE_TYPES.map((s) => (
          <div
            key={s.type}
            className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-zinc-200">{s.type}</p>
              <p className={`text-xs font-medium ${utilityColor(s.utility)}`}>
                {s.utility}
              </p>
            </div>
            <span className="text-lg font-bold text-zinc-300">{s.weight}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
