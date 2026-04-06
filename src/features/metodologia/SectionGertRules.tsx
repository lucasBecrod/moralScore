const GERT_RULES = [
  { num: 1, rule: "No matar", pub: "Proteger la vida ciudadana frente al crimen organizado y la violencia estructural" },
  { num: 2, rule: "No causar dolor", pub: "Evitar sufrimiento economico, desabastecimiento de servicios basicos, precarizacion laboral" },
  { num: 3, rule: "No incapacitar", pub: "No desmantelar instituciones fiscalizadoras, sistema de justicia ni procuradurias anticorrupcion" },
  { num: 4, rule: "No privar de libertad", pub: "Garantizar derechos civiles, politicos y de protesta pacifica" },
  { num: 5, rule: "No privar de placer", pub: "Fomentar desarrollo humano, prosperidad, calidad de vida urbana y rural" },
  { num: 6, rule: "No enganar", pub: "Transparencia total en funcion publica. Veracidad en declaraciones juradas ante el JNE" },
  { num: 7, rule: "Cumplir las promesas", pub: "Ejecutar fielmente los planes de gobierno. Respetar pactos sociales y electorales" },
  { num: 8, rule: "No hacer trampa", pub: "Tolerancia cero a corrupcion, nepotismo, licitaciones amanadas, trafico de influencias" },
  { num: 9, rule: "Obedecer la ley", pub: "Sometimiento al marco constitucional y dictamenes de cortes nacionales y supranacionales" },
  { num: 10, rule: "Cumplir con el deber", pub: "Ejecutar el presupuesto publico eficientemente. Proveer servicios esenciales" },
];

export function SectionGertRules() {
  return (
    <div className="space-y-2">
      {GERT_RULES.map((r) => (
        <div
          key={r.num}
          className="flex gap-3 rounded-lg border border-zinc-700 bg-zinc-900 p-3"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600/20 text-xs font-bold text-emerald-400">
            {r.num}
          </span>
          <div>
            <p className="text-sm font-medium text-zinc-200">{r.rule}</p>
            <p className="mt-0.5 text-xs text-zinc-400">{r.pub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
