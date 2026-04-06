import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CopyButton } from "@/shared/ui/CopyButton";

const DOCS_DIR = join(process.cwd(), "public/docs");

const DOC_TITLES: Record<string, string> = {
  "system-evaluador-kohlberg": "Rúbrica de Evaluación — Escala de Kohlberg",
  "reglas-gert-gestion-publica": "10 Reglas de la Moralidad Común — Gert, Culver & Clouser",
  "criterios-calidad-fuente": "Criterios de Calidad de Fuentes",
  "system-agente-investigador": "System Prompt — Agente Investigador",
  "plan-investigacion": "Plan de Investigación — MoralScore",
  "investigacion-voto-informado": "Investigación Política para Voto Informado",
  "plan-viabilidad-critica": "Plan de Investigación MoralScore: Viabilidad y Crítica",
};

export function generateStaticParams() {
  if (!existsSync(DOCS_DIR)) return [];
  const files = readdirSync(DOCS_DIR).filter((f) => f.endsWith(".md"));
  return files.map((f) => ({ slug: f.replace(".md", "") }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = DOC_TITLES[slug] || slug;
  return {
    title: `${title} — MoralScore`,
    description: `Documentación de transparencia de MoralScore: ${title}`,
  };
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const filePath = join(DOCS_DIR, `${slug}.md`);

  let content: string;
  try {
    content = readFileSync(filePath, "utf-8");
  } catch {
    notFound();
  }

  const title = DOC_TITLES[slug] || slug;

  // Simple markdown to HTML (headers, bold, italic, lists, tables, code blocks)
  const html = markdownToHtml(content);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/metodologia"
        className="inline-flex items-center text-sm text-zinc-400 hover:text-white mb-6 transition-colors"
      >
        &larr; Metodolog&iacute;a
      </Link>

      <article className="prose-moralscore">
        <div className="flex items-start justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">{title}</h1>
          <CopyButton text={content} label="Copiar prompt" />
        </div>
        <div
          className="text-zinc-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>

      {/* CTA comunidad */}
      <div className="mt-12 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 text-center">
        <h3 className="text-sm font-semibold text-zinc-100">
          &iquest;Encontraste un error o quieres mejorar este documento?
        </h3>
        <p className="mt-2 text-xs text-zinc-400">
          MoralScore es de c&oacute;digo abierto. Aceptamos pull requests con sugerencias de mejora.
        </p>
        <a
          href="https://github.com/lucasBecrod/moralScore"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
        >
          Contribuir en GitHub
        </a>
      </div>
    </div>
  );
}

function markdownToHtml(md: string): string {
  let html = md
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-zinc-800 rounded-lg p-4 overflow-x-auto text-sm text-zinc-300 my-4"><code>$2</code></pre>')
    // Tables
    .replace(/\|(.+)\|\n\|[\s:|-]+\|\n((?:\|.+\|\n?)*)/g, (_, header, body) => {
      const ths = header.split("|").filter(Boolean).map((h: string) => `<th class="px-3 py-2 text-left text-xs font-semibold text-zinc-300 border-b border-zinc-700">${h.trim()}</th>`).join("");
      const rows = body.trim().split("\n").map((row: string) => {
        const tds = row.split("|").filter(Boolean).map((d: string) => `<td class="px-3 py-2 text-xs text-zinc-400 border-b border-zinc-800">${d.trim()}</td>`).join("");
        return `<tr>${tds}</tr>`;
      }).join("");
      return `<div class="overflow-x-auto my-4"><table class="w-full"><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table></div>`;
    })
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-zinc-100 mt-8 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-zinc-100 mt-10 mb-4">$1</h2>')
    .replace(/^# (.+)$/gm, '') // Remove h1 (we show title separately)
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-zinc-100">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-zinc-600 pl-4 text-zinc-400 italic my-3">$1</blockquote>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li class="text-zinc-400 ml-4 list-disc">$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li class="text-zinc-400 ml-4 list-decimal">$1</li>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-zinc-800 px-1.5 py-0.5 rounded text-sm text-zinc-300">$1</code>')
    // Paragraphs (double newlines)
    .replace(/\n\n/g, '</p><p class="my-3">')
    // Line breaks
    .replace(/\n/g, '<br/>');

  return `<p class="my-3">${html}</p>`;
}
