import { z } from "zod/v4";
import { CitaSchema, ReglaGert } from "./evaluacion.schema";

// Shape del JSON que retorna el evaluador al analizar una intervención.
// Se usa para validar el output antes de subirlo a Firestore.
export const AnalisisResponseSchema = z.object({
  estadio: z.number().int().min(1).max(6).describe("Estadio Kohlberg dominante"),
  justificacion: z.string().describe("Explicación del razonamiento"),
  citas: z.array(CitaSchema).min(1).describe("Citas textuales de sustento"),
  reglaGert: ReglaGert.describe("Regla de Gert más relevante"),
  gertCumplida: z.boolean().describe("true = cumplió, false = transgredió"),
});

export type AnalisisResponse = z.infer<typeof AnalisisResponseSchema>;
