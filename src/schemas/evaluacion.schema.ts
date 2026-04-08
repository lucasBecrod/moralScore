import { z } from "zod/v4";

export const CitaSchema = z.object({
  texto: z.string().describe("Cita textual del candidato"),
  ubicacion: z.string().describe("Timestamp (3:42) o número de párrafo"),
  indicador: z.string().describe("Qué indicador de Kohlberg refleja esta cita"),
});

export type Cita = z.infer<typeof CitaSchema>;

export const EvaluacionSchema = z.object({
  id: z.string().describe("ID único (Firestore auto-ID)"),
  entidadId: z.string().describe("FK a la entidad evaluada"),
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
  fechaEvento: z.string().describe("ISO 8601 date del acto evaluado — heredado de la fuente"),
  userId: z.string().describe("FK a usuarios/{uid} — quién realizó la evaluación"),
  validadoPor: z
    .string()
    .nullable()
    .describe("UID del usuario que validó, null si no validada"),
  validacionesCiudadanas: z.number().int().min(0).optional().describe("Cantidad de ciudadanos que validaron esta evaluación"),
  createdAt: z.string().describe("ISO 8601 timestamp"),
});

export type Evaluacion = z.infer<typeof EvaluacionSchema>;
