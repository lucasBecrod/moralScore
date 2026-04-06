"use client";

import { useState } from "react";
import { EscalaKohlberg } from "./EscalaKohlberg";
import { SectionGertRules } from "./SectionGertRules";
import { SectionSourceQuality } from "./SectionSourceQuality";
import { SectionLimitations } from "./SectionLimitations";

const TABS = [
  { id: "fundamentos", label: "Fundamentos" },
  { id: "datos", label: "Datos" },
  { id: "gobernanza", label: "Gobernanza" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface MetodologiaTabsProps {
  docContents: Record<string, string>;
}

export function MetodologiaTabs({ docContents }: MetodologiaTabsProps) {
  const [active, setActive] = useState<TabId>("fundamentos");

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              active === tab.id
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-6">
        {active === "fundamentos" && <TabFundamentos />}
        {active === "datos" && <TabDatos />}
        {active === "gobernanza" && <TabGobernanza docContents={docContents} />}
      </div>
    </div>
  );
}

function TabFundamentos() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-zinc-100">
          Escala de Kohlberg &mdash; 6 estadios
        </h3>
        <p className="mt-1 text-xs text-zinc-500">
          Mide C&Oacute;MO razona moralmente el candidato.
        </p>
        <div className="mt-4">
          <EscalaKohlberg />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-zinc-100">
          10 Reglas de Gert
        </h3>
        <p className="mt-1 text-xs text-zinc-500">
          Mide QU&Eacute; normas morales transgrede en su discurso p&uacute;blico.
        </p>
        <div className="mt-4">
          <SectionGertRules />
        </div>
      </div>

      <p className="rounded border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-xs text-zinc-500">
        Kohlberg mide <strong className="text-zinc-400">C&Oacute;MO</strong>{" "}
        razona. Gert mide{" "}
        <strong className="text-zinc-400">QU&Eacute;</strong> transgrede.
        Son complementarios.
      </p>
    </div>
  );
}

function TabDatos() {
  return <SectionSourceQuality />;
}

function TabGobernanza({ docContents }: { docContents: Record<string, string> }) {
  return (
    <div className="space-y-8">
      <SectionLimitations />

      <section>
        <h3 className="text-lg font-semibold text-zinc-100">
          Documentaci&oacute;n t&eacute;cnica
        </h3>
        <p className="mt-1 text-xs text-zinc-500">
          Prompts, r&uacute;bricas y criterios p&uacute;blicos. Haz clic para leer o copiar.
        </p>
        <div className="mt-4 space-y-2">
          {TECH_DOCS.map((doc) => (
            <DocCard
              key={doc.file}
              title={doc.title}
              desc={doc.desc}
              content={docContents[doc.file] || ""}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function DocCard({ title, desc, content }: { title: string; desc: string; content: string }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-lg border border-zinc-800">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-900"
      >
        <svg className="h-4 w-4 shrink-0 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-zinc-300">{title}</p>
          <p className="text-xs text-zinc-500">{desc}</p>
        </div>
        <svg
          className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && content && (
        <div className="border-t border-zinc-800 px-4 pb-4 pt-3">
          <div className="mb-2 flex justify-end">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded border border-zinc-700 px-2.5 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
            >
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
          <div className="max-h-80 overflow-auto rounded-lg bg-zinc-950 p-4 text-xs leading-relaxed text-zinc-400 whitespace-pre-wrap break-words">
            {content}
          </div>
        </div>
      )}

      {expanded && !content && (
        <div className="border-t border-zinc-800 px-4 py-3">
          <p className="text-xs text-zinc-600">Documento no disponible.</p>
        </div>
      )}
    </div>
  );
}

const TECH_DOCS = [
  { title: "R\u00fabrica Kohlberg", desc: "System prompt con los 6 estadios e indicadores", file: "system-evaluador-kohlberg.md" },
  { title: "Reglas de Gert", desc: "Moralidad com\u00fan adaptada al contexto peruano", file: "reglas-gert-gestion-publica.md" },
  { title: "Criterios de calidad", desc: "Qu\u00e9 URLs se aceptan y cu\u00e1les se rechazan", file: "criterios-calidad-fuente.md" },
  { title: "Agente investigador", desc: "Instrucciones del bot buscador de fuentes", file: "system-agente-investigador.md" },
  { title: "Plan de investigaci\u00f3n", desc: "Hip\u00f3tesis, taxonom\u00eda y algoritmo de calidad", file: "plan-investigacion.md" },
  { title: "Investigaci\u00f3n fundacional", desc: "An\u00e1lisis estructural de elecciones 2026", file: "investigacion-voto-informado.md" },
  { title: "Viabilidad y cr\u00edtica", desc: "Riesgos y cr\u00edticas al enfoque", file: "plan-viabilidad-critica.md" },
];
