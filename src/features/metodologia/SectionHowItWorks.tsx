const STEPS = [
  { num: 1, text: "Se sube una URL (video, entrevista, articulo)" },
  { num: 2, text: "La IA extrae el contenido" },
  { num: 3, text: "Analiza con rubrica Kohlberg + reglas Gert" },
  { num: 4, text: "Retorna: estadio + confianza + citas textuales" },
  { num: 5, text: "Validacion humana (Lucas + Lady)" },
  { num: 6, text: "Score publicado con evidencia" },
];

export function SectionHowItWorks() {
  return (
    <section>
      <h2 className="font-serif text-2xl font-semibold text-zinc-100">
        Como funciona
      </h2>
      <div className="mt-6 space-y-0">
        {STEPS.map((step, i) => (
          <div key={step.num} className="flex gap-3">
            {/* Vertical line + circle */}
            <div className="flex flex-col items-center">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600/20 text-sm font-bold text-violet-400">
                {step.num}
              </div>
              {i < STEPS.length - 1 && (
                <div className="w-px flex-1 bg-zinc-700" />
              )}
            </div>
            <p className="pb-6 pt-1 text-sm text-zinc-300">{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
