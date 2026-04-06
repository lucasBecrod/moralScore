import { DocumentCard } from "./DocumentCard";

const DOCUMENTS = [
  {
    title: "R\u00fabrica de evaluaci\u00f3n Kohlberg",
    description: "System prompt con los 6 estadios, indicadores y formato de respuesta.",
    file: "system-evaluador-kohlberg.md",
  },
  {
    title: "10 Reglas de Gert para gesti\u00f3n p\u00fablica",
    description: "Moralidad com\u00fan adaptada al contexto pol\u00edtico peruano.",
    file: "reglas-gert-gestion-publica.md",
  },
  {
    title: "Criterios de calidad de fuentes",
    description: "Qu\u00e9 URLs se aceptan y cu\u00e1les se rechazan autom\u00e1ticamente.",
    file: "criterios-calidad-fuente.md",
  },
  {
    title: "System prompt del agente investigador",
    description: "Instrucciones del bot que busca fuentes autom\u00e1ticamente.",
    file: "system-agente-investigador.md",
  },
  {
    title: "Plan de investigaci\u00f3n",
    description: "Hip\u00f3tesis, taxonom\u00eda de fuentes y algoritmo de calidad.",
    file: "plan-investigacion.md",
  },
  {
    title: "Investigaci\u00f3n fundacional",
    description: "An\u00e1lisis estructural y \u00e9tico de las elecciones 2026.",
    file: "investigacion-voto-informado.md",
  },
  {
    title: "Viabilidad y cr\u00edtica del proyecto",
    description: "An\u00e1lisis de viabilidad, riesgos y cr\u00edticas al enfoque de MoralScore.",
    file: "plan-viabilidad-critica.md",
  },
];

interface SectionTransparencyProps {
  docContents: Record<string, string>;
}

export function SectionTransparency({ docContents }: SectionTransparencyProps) {
  return (
    <section>
      <h2 className="font-serif text-2xl font-semibold text-zinc-100">
        Transparencia total
      </h2>
      <p className="mt-2 text-sm text-zinc-400">
        Todos los prompts, r&uacute;bricas y criterios que usa la IA son p&uacute;blicos.
        Puedes leerlos, copiarlos y auditarlos.
      </p>
      <div className="mt-4 space-y-2">
        {DOCUMENTS.map((doc) => (
          <DocumentCard
            key={doc.file}
            title={doc.title}
            description={doc.description}
            content={docContents[doc.file] || "(Documento no disponible)"}
          />
        ))}
      </div>
    </section>
  );
}
