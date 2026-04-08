export const KOHLBERG_STAGES = {
  1: {
    nivel: "Pre-convencional",
    nombre: "Castigo y obediencia",
    color: "#DC2626",
    colorTw: "text-red-600 bg-red-50 border-red-200",
    descripcion:
      "Justifica solo por miedo a consecuencias. No diferencia legalidad de moralidad.",
    ejemplo:
      '"Hay que meter presos a todos, mano dura y punto"',
  },
  2: {
    nivel: "Pre-convencional",
    nombre: "Intercambio instrumental",
    color: "#EA580C",
    colorTw: "text-orange-600 bg-orange-50 border-orange-200",
    descripcion:
      "Ve relaciones como transacciones. Clientelismo explícito.",
    ejemplo:
      '"Si me apoyas, te doy obras para tu distrito"',
  },
  3: {
    nivel: "Convencional",
    nombre: "Expectativas interpersonales",
    color: "#D97706",
    colorTw: "text-amber-600 bg-amber-50 border-amber-200",
    descripcion:
      "Busca aprobación. Apela a emociones y lealtades.",
    ejemplo:
      '"Es lo que el pueblo pide, yo escucho a la gente"',
  },
  4: {
    nivel: "Convencional",
    nombre: "Ley y orden social",
    color: "#2563EB",
    colorTw: "text-blue-600 bg-blue-50 border-blue-200",
    descripcion:
      "Apela a leyes, instituciones, procedimientos.",
    ejemplo:
      '"Debemos respetar la Constitución y fortalecer las instituciones"',
  },
  5: {
    nivel: "Post-convencional",
    nombre: "Contrato social",
    color: "#7C3AED",
    colorTw: "text-violet-600 bg-violet-50 border-violet-200",
    descripcion:
      "Reconoce que leyes pueden ser injustas. Apela a derechos universales.",
    ejemplo:
      '"Los derechos fundamentales están por encima de cualquier mayoría coyuntural"',
  },
  6: {
    nivel: "Post-convencional",
    nombre: "Principios éticos universales",
    color: "#059669",
    colorTw: "text-emerald-600 bg-emerald-50 border-emerald-200",
    descripcion:
      "Justicia y dignidad como fines absolutos. Acepta costos por coherencia.",
    ejemplo:
      '"Esta política es justa porque protege la dignidad humana sin importar el costo político"',
  },
} as const;

export type KohlbergStage = keyof typeof KOHLBERG_STAGES;

export function getStageColor(stage: number): string {
  return KOHLBERG_STAGES[stage as KohlbergStage]?.color ?? "#6B7280";
}

export function getStageName(stage: number): string {
  return KOHLBERG_STAGES[stage as KohlbergStage]?.nombre ?? "Desconocido";
}

// Etiquetas públicas — lenguaje ciudadano, sin jerga académica
const PUBLIC_LABELS: Record<number, string> = {
  1: "Autoritario / Punitivo",
  2: "Transaccional / Clientelista",
  3: "Busca aprobaci\u00f3n popular",
  4: "Institucionalista",
  5: "Defiende derechos universales",
  6: "Principios \u00e9ticos absolutos",
};

export function getPublicLabel(score: number): string {
  const rounded = Math.round(score);
  return PUBLIC_LABELS[rounded] ?? "Sin clasificar";
}

// Etiquetas de zona — resumen por nivel
const ZONE_LABELS: Record<string, string> = {
  "Pre-convencional": "Inter\u00e9s propio",
  "Convencional": "Normas y sistema",
  "Post-convencional": "Principios propios",
};

export function getZonePublicLabel(nivel: string): string {
  return ZONE_LABELS[nivel] ?? nivel;
}

/** Peso de fricción por tipo de fuente. Determinista — nunca lo asigna el LLM. */
export const PESO_FRICCION: Record<string, number> = {
  "voto-congreso":          1.0,
  "ejecucion-presupuestal": 0.9,
  "sentencia-judicial":     0.9,
  "declaracion-jurada":     0.8,
  "debate":                 0.7,
  "entrevista":             0.4,
  "conferencia":            0.4,
  "youtube":                0.3,
  "articulo":               0.3,
  "columna":                0.3,
  "mitin":                  0.2,
};

/** Techo máximo de score si se transgrede una regla de Gert con evidencia dura. */
export const TECHO_GERT: Record<string, number> = {
  "no-privar-libertad": 1.5,
  "no-engañar":         2.0,
  "no-hacer-trampa":    2.0,
  "no-causar-dolor":    2.0,
  "cumplir-deber":      3.0,
  "ninguna":            6.0,
};

/** Solo fuentes con peso >= este umbral pueden activar el colapso de techo Gert. */
export const UMBRAL_EVIDENCIA_MATERIAL = 0.7;
