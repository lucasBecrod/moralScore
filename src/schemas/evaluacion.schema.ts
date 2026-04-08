import { z } from "zod/v4";

export const CitaSchema = z.object({
  texto: z.string().describe("Cita textual del candidato"),
  ubicacion: z.string().describe("Timestamp (3:42) o número de párrafo"),
  indicador: z.string().describe("Qué indicador de Kohlberg refleja esta cita"),
});

export type Cita = z.infer<typeof CitaSchema>;

// Reglas morales de Bernard Gert — las 10 reglas morales categóricas
export const ReglaGert = z.enum([
  "cumplir-deber",       // Regla 10: ejecución presupuestal, asistencia
  "no-engañar",          // Regla 6: DJHV, transparencia
  "no-hacer-trampa",     // Regla 8: conflicto de interés
  "no-privar-libertad",  // Regla 4: leyes procrimen, impunidad
  "no-causar-dolor",     // Regla 3: negligencia con consecuencias
  "ninguna",             // Sin transgresión material detectada
]);

export type ReglaGert = z.infer<typeof ReglaGert>;

export const EvaluacionSchema = z.object({
  id: z.string().describe("ID único (Firestore auto-ID)"),
  entidadId: z.string().describe("FK a la entidad evaluada"),
  fuenteId: z.string().describe("FK a la fuente evaluada"),
  estadio: z.number().int().min(1).max(6).describe("Estadio Kohlberg asignado (1-6)"),
  justificacion: z.string().describe("Explicación de por qué se asignó este estadio"),
  citas: z.array(CitaSchema).min(1).describe("Al menos una cita textual que sustenta el score"),
  reglaGert: ReglaGert.describe("Regla de Gert más relevante"),
  gertCumplida: z.boolean().describe("true = cumplió, false = transgredió"),
  fechaEvento: z.string().describe("ISO 8601 date del acto evaluado — heredado de la fuente"),
  userId: z.string().describe("FK a usuarios/{uid} — quién realizó la evaluación"),
  validadoPor: z.string().nullable().describe("UID del usuario que validó, null si no validada"),
  validacionesCiudadanas: z.number().int().min(0).optional().describe("Cantidad de ciudadanos que validaron esta evaluación"),
  createdAt: z.string().describe("ISO 8601 timestamp"),
});

export type Evaluacion = z.infer<typeof EvaluacionSchema>;
