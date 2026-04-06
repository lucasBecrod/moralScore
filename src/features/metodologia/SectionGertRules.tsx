const GROUPS = [
  {
    label: "Protecci\u00f3n a la persona",
    rules: [
      { num: 1, rule: "No matar", pub: "Proteger la vida ciudadana frente al crimen organizado y la violencia estructural" },
      { num: 2, rule: "No causar dolor", pub: "Evitar sufrimiento econ\u00f3mico, desabastecimiento de servicios b\u00e1sicos, precarizaci\u00f3n laboral" },
      { num: 3, rule: "No incapacitar", pub: "No desmantelar instituciones fiscalizadoras, sistema de justicia ni procuradur\u00edas anticorrupci\u00f3n" },
      { num: 4, rule: "No privar de libertad", pub: "Garantizar derechos civiles, pol\u00edticos y de protesta pac\u00edfica" },
      { num: 5, rule: "No privar de placer", pub: "Fomentar desarrollo humano, prosperidad, calidad de vida urbana y rural" },
    ],
  },
  {
    label: "Protecci\u00f3n a las instituciones",
    rules: [
      { num: 6, rule: "No enga\u00f1ar", pub: "Transparencia total en funci\u00f3n p\u00fablica. Veracidad en declaraciones juradas ante el JNE" },
      { num: 7, rule: "Cumplir las promesas", pub: "Ejecutar fielmente los planes de gobierno. Respetar pactos sociales y electorales" },
      { num: 8, rule: "No hacer trampa", pub: "Tolerancia cero a corrupci\u00f3n, nepotismo, licitaciones ama\u00f1adas, tr\u00e1fico de influencias" },
      { num: 9, rule: "Obedecer la ley", pub: "Sometimiento al marco constitucional y dict\u00e1menes de cortes nacionales y supranacionales" },
      { num: 10, rule: "Cumplir con el deber", pub: "Ejecutar el presupuesto p\u00fablico eficientemente. Proveer servicios esenciales" },
    ],
  },
];

export function SectionGertRules() {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      {GROUPS.map((group) => (
        <div key={group.label}>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {group.label}
          </h4>
          <div className="space-y-1.5">
            {group.rules.map((r) => (
              <div
                key={r.num}
                className="relative rounded-lg border border-zinc-800 bg-white/[0.03] px-3 py-2.5"
              >
                <span className="absolute right-2.5 top-2.5 text-[11px] font-medium text-zinc-700">
                  {r.num}
                </span>
                <p className="pr-6 text-sm font-medium text-zinc-200">{r.rule}</p>
                <p className="mt-0.5 pr-6 text-xs text-zinc-500">{r.pub}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
