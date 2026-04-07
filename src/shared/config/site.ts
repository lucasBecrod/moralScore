export const SITE_CONFIG = {
  name: "MoralScore",
  tagline: "Razonamiento moral verificable. Democracia basada en evidencia.",
  description:
    "Plataforma que evalúa el razonamiento moral de candidatos políticos peruanos usando la escala de Kohlberg (1-6). Cada score es verificable con fuentes originales.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://web--moral-score.us-east4.hosted.app",
  repo: "https://github.com/lucasBecrod/moralScore",
  authors: ["Lucas Becrod", "Lady"],
  context: "Elecciones Generales del Perú 2026",
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Candidatos" },
  { href: "/metodologia", label: "Metodología" },
] as const;
