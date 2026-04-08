import { z } from "zod/v4";

export const MetricasGlobalesSchema = z.object({
  totalFuentes: z.number().int().min(0).describe("Total de fuentes en el sistema"),
  totalEvaluaciones: z.number().int().min(0).describe("Total de evaluaciones Kohlberg generadas"),
  totalCandidatos: z.number().int().min(0).describe("Total de candidatos bajo auditoría"),
  totalProcesos: z.number().int().min(0).describe("Total de procesos electorales cubiertos"),
  updatedAt: z.string().describe("ISO 8601 timestamp de última actualización"),
});
export type MetricasGlobales = z.infer<typeof MetricasGlobalesSchema>;
