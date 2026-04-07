import { z } from "zod/v4";

export const EntidadTipo = z.enum(["persona", "organizacion"]);
export type EntidadTipo = z.infer<typeof EntidadTipo>;

export const EntidadSchema = z.object({
  id: z.string().describe("URL-safe slug: keiko-fujimori"),
  nombre: z.string().describe("Nombre público / comercial"),
  foto: z.string().describe("URL de foto o ruta local"),
  tipo: EntidadTipo.optional().describe("persona u organización"),
  nombreLegal: z.string().optional().describe("Nombre legal completo"),
  dniRuc: z.string().optional().describe("DNI o RUC"),
  region: z.string().optional().describe("Región de origen"),
  bio: z.string().optional().describe("Descripción breve"),
  scoreHistorico: z.number().min(1).max(6).nullable().describe("Score Kohlberg histórico (todas las evaluaciones), null si no hay"),
  totalEvaluacionesHistoricas: z.number().int().min(0).describe("Cantidad total de evaluaciones históricas"),
  totalLikes: z.number().int().min(0).optional().describe("Total de likes ciudadanos (denormalizado)"),
});

export type Entidad = z.infer<typeof EntidadSchema>;
