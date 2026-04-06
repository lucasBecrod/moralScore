import { z } from "zod/v4";

export const CandidatoSchema = z.object({
  id: z.string().describe("URL-safe slug: keiko-fujimori"),
  nombre: z.string().describe("Nombre completo para mostrar"),
  partido: z.string().describe("Nombre del partido político"),
  intencionVoto: z.string().describe("Rango de intención de voto: '8.0% - 10.0%'"),
  planGobierno: z.string().describe("Nombre del plan de gobierno"),
  foto: z.string().describe("Ruta a foto en /public/img/candidatos/"),
  scoreActual: z.number().min(1).max(6).nullable().describe("Mediana actual del estadio Kohlberg, null si no hay evaluaciones"),
  totalEvaluaciones: z.number().int().min(0).describe("Cantidad de evaluaciones completadas"),
});

export type Candidato = z.infer<typeof CandidatoSchema>;
