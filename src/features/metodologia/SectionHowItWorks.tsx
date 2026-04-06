const PHASES = [
  {
    label: "Entrada",
    title: "Evidencia",
    desc: "Entrevistas, debates y prensa procesados para eliminar ruido subjetivo.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    label: "Transformaci\u00f3n",
    title: "Auditor\u00eda \u00c9tica",
    desc: "Marcos Kohlberg y Gert aplicados para mapear razonamiento moral.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  {
    label: "Salida",
    title: "MoralScore",
    desc: "Score vinculado a citas textuales verificables. Prompt y c\u00f3digo p\u00fablicos.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
];

export function SectionHowItWorks() {
  return (
    <section>
      <h2 className="font-serif text-2xl font-semibold text-zinc-100">
        C&oacute;mo funciona
      </h2>
      <div className="mt-4 grid grid-cols-3 gap-0">
        {PHASES.map((phase, i) => (
          <div key={phase.label} className="flex items-stretch">
            <div className={`flex-1 rounded-lg border p-4 ${phase.bg} ${phase.border}`}>
              <p className={`text-[11px] font-medium uppercase tracking-wider ${phase.color}`}>
                {phase.label}
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-100">{phase.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">{phase.desc}</p>
            </div>
            {i < PHASES.length - 1 && (
              <div className="flex items-center px-2">
                <span className="text-zinc-600">&rarr;</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
