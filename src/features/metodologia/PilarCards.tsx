"use client";

import { useState } from "react";

const PILARES = [
  {
    id: "kohlberg",
    title: "Kohlberg",
    subtitle: "C\u00f3mo razona",
    color: "text-violet-400",
    border: "border-violet-500/30",
    bg: "bg-violet-500/5",
    info: "Lawrence Kohlberg (1927\u20131987) fue un psic\u00f3logo de Harvard que identific\u00f3 6 estadios universales del razonamiento moral. Su escala mide c\u00f3mo una persona justifica sus decisiones \u2014 desde el miedo al castigo (estadio 1) hasta principios \u00e9ticos universales (estadio 6). MoralScore aplica esta escala al discurso p\u00fablico de los candidatos.",
  },
  {
    id: "gert",
    title: "Gert",
    subtitle: "Qu\u00e9 transgrede",
    color: "text-emerald-400",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/5",
    info: "Bernard Gert (1934\u20132011) fue un fil\u00f3sofo de Dartmouth que defini\u00f3 10 reglas morales universales que toda persona racional aceptar\u00eda. MoralScore adapta estas reglas al contexto de la gesti\u00f3n p\u00fablica peruana para detectar qu\u00e9 normas \u00e9ticas transgrede un candidato en su discurso.",
  },
  {
    id: "trazabilidad",
    title: "Trazabilidad",
    subtitle: "C\u00f3digo abierto",
    color: "text-blue-400",
    border: "border-blue-500/30",
    bg: "bg-blue-500/5",
    info: "Cada score est\u00e1 vinculado a citas textuales verificables del candidato. Los prompts, r\u00fabricas y criterios de evaluaci\u00f3n son p\u00fablicos en GitHub. Cualquier persona puede auditar c\u00f3mo la IA lleg\u00f3 a cada resultado.",
  },
] as const;

export function PilarCards() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-3 gap-3">
      {PILARES.map((p) => {
        const isOpen = open === p.id;
        return (
          <div key={p.id} className="col-span-3 sm:col-span-1">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : p.id)}
              className={`w-full rounded-lg border p-3 text-center transition-all ${
                isOpen
                  ? `${p.border} ${p.bg}`
                  : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
              }`}
            >
              <p className={`text-lg font-bold ${p.color}`}>{p.title}</p>
              <p className="mt-0.5 text-[11px] text-zinc-500">{p.subtitle}</p>
            </button>
            {isOpen && (
              <p className={`mt-2 rounded-lg border px-3 py-2.5 text-xs leading-relaxed text-zinc-400 ${p.border} ${p.bg}`}>
                {p.info}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
