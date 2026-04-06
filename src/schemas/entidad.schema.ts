import { z } from "zod/v4";

export const EntidadTipo = z.enum(["persona", "organizacion"]);
export type EntidadTipo = z.infer<typeof EntidadTipo>;

export const EntidadRol = z.enum([
  "presidente",
  "vicepresidente-1",
  "vicepresidente-2",
  "congresista",
  "otro",
]);
export type EntidadRol = z.infer<typeof EntidadRol>;

export const EntidadSchema = z.object({
  // Obligatorios
  id: z.string().describe("URL-safe slug: keiko-fujimori"),
  nombre: z.string().describe("Nombre público / comercial"),
  foto: z.string().describe("URL de foto o ruta local"),

  // Clasificación
  tipo: EntidadTipo.optional().describe("persona u organización"),
  rol: EntidadRol.optional().describe("Rol en la fórmula electoral"),
  partido: z.string().optional().describe("Nombre del partido político (agrupa entidades)"),
  logoPartido: z.string().optional().describe("URL del logo del partido político"),

  // Opcionales
  nombreLegal: z.string().optional().describe("Nombre legal completo"),
  dniRuc: z.string().optional().describe("DNI o RUC"),
  cargo: z.string().optional().describe("Cargo actual o al que aspira"),
  region: z.string().optional().describe("Región de origen"),
  bio: z.string().optional().describe("Descripción breve"),

  // Score (calculado)
  scoreActual: z.number().min(1).max(6).nullable().describe("Mediana Kohlberg, null si no hay evaluaciones"),
  totalEvaluaciones: z.number().int().min(0).describe("Cantidad de evaluaciones completadas"),
});

export type Entidad = z.infer<typeof EntidadSchema>;
