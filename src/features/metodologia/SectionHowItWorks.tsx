const STEPS = [
  { num: 1, title: "Fuente", desc: "Se sube una URL de entrevista, debate o art\u00edculo" },
  { num: 2, title: "Extracci\u00f3n", desc: "La IA extrae el contenido relevante" },
  { num: 3, title: "An\u00e1lisis", desc: "R\u00fabrica Kohlberg + reglas Gert aplicadas" },
  { num: 4, title: "Resultado", desc: "Estadio + confianza + citas textuales" },
  { num: 5, title: "Validaci\u00f3n", desc: "Revisi\u00f3n humana obligatoria" },
  { num: 6, title: "Publicaci\u00f3n", desc: "Score publicado con evidencia verificable" },
];

export function SectionHowItWorks() {
  return (
    <section>
      <h2 className="font-serif text-2xl font-semibold text-zinc-100">
        C&oacute;mo funciona
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {STEPS.map((step) => (
          <div
            key={step.num}
            className="rounded-lg border border-zinc-800 bg-zinc-900 p-3"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600/20 text-xs font-bold text-violet-400">
              {step.num}
            </span>
            <p className="mt-2 text-sm font-medium text-zinc-200">{step.title}</p>
            <p className="mt-0.5 text-xs text-zinc-500">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
