import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { SectionHowItWorks } from "./SectionHowItWorks";
import { MetodologiaTabs } from "./MetodologiaTabs";
import { PilarCards } from "./PilarCards";

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
        Juicio &eacute;tico basado en evidencia
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
        Analizamos c&oacute;mo razonan moralmente los candidatos usando IA
        y marcos acad&eacute;micos. Prompts, r&uacute;bricas y fuentes son p&uacute;blicos.
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

      {/* CTA GitHub */}
      <section className="mt-12 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 text-center">
        <h2 className="text-lg font-semibold text-zinc-100">
          C&oacute;digo abierto
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
          Prompts, r&uacute;bricas y criterios son p&uacute;blicos.
          Aceptamos correcciones y nuevas fuentes.
        </p>
        <a
          href="https://github.com/lucasBecrod/moralScore"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          Ver en GitHub
        </a>
      </section>
    </div>
  );
}
