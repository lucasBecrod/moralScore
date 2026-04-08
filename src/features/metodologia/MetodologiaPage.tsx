import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { SectionHowItWorks } from "./SectionHowItWorks";
import { MetodologiaTabs } from "./MetodologiaTabs";
import { PilarCards } from "./PilarCards";
import { OpenSourceCTA } from "@/shared/ui/OpenSourceCTA";

function loadDocContents(): Record<string, string> {
  const docsDir = join(process.cwd(), "public", "docs");
  const contents: Record<string, string> = {};
  try {
    const files = readdirSync(docsDir).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      contents[file] = readFileSync(join(docsDir, file), "utf-8");
    }
  } catch {
    // Docs dir not available
  }
  return contents;
}

export function MetodologiaPage() {
  const docContents = loadDocContents();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
      {/* Capa 1: Hero + Motor Visual */}
      <h1 className="font-serif text-3xl font-bold tracking-tight text-zinc-100">
        Ret&oacute;rica vs. Realidad
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
        El discurso define el potencial (Kohlberg). La evidencia material
        fija el l&iacute;mite (Gert). Si un candidato habla como estadista pero
        tiene sentencias o votos pol&eacute;micos, su score colapsa.
        Algoritmo, prompts y fuentes son p&uacute;blicos.
      </p>

      {/* 3 pilares — clickeables con info expandible */}
      <div className="mt-6">
        <PilarCards />
      </div>

      {/* Motor: 6 pasos */}
      <div className="mt-10">
        <SectionHowItWorks />
      </div>

      {/* Capa 2: Tabs — Fundamentos / Datos / Gobernanza */}
      <div className="mt-12">
        <MetodologiaTabs docContents={docContents} />
      </div>

      <OpenSourceCTA />
    </div>
  );
}
