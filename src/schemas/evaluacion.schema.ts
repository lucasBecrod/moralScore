import { z } from "zod/v4";

export const CitaSchema = z.object({
  texto: z.string().describe("Cita textual del candidato"),
  ubicacion: z.string().describe("Timestamp (3:42) o número de párrafo"),
  indicador: z.string().describe("Qué indicador de Kohlberg refleja esta cita"),
});

export type Cita = z.infer<typeof CitaSchema>;

export const EvaluacionSchema = z.object({
  id: z.string().describe("ID único (Firestore auto-ID)"),
  candidatoId: z.string().describe("FK al candidato"),
  fuenteId: z.string().describe("FK a la fuente evaluada"),
  estadio: z.number().int().min(1).max(6).describe("Estadio Kohlberg asignado (1-6)"),
  confianza: z.enum(["alta", "media", "baja"]).describe("Nivel de confianza de la evaluación"),
  justificacion: z.string().describe("Explicación de por qué se asignó este estadio"),
  citas: z.array(CitaSchema).min(1).describe("Al menos una cita textual que sustenta el score"),
  estadioAlternativo: z
    .number()
    .int()
    .min(1)
    .max(6)
    .nullable()
    .describe("Estadio alternativo si hay ambigüedad"),
  notas: z.string().nullable().describe("Observaciones adicionales"),
  evaluador: z.enum(["lucas", "lady"]).describe("Quién realizó la evaluación"),
  validadoPor: z
    .enum(["lucas", "lady"])
    .nullable()
    .describe("Quién validó (segunda revisión), null si no validada"),
  createdAt: z.string().describe("ISO 8601 timestamp"),
});

export type Evaluacion = z.infer<typeof EvaluacionSchema>;
