import { z } from "zod/v4";
import { CitaSchema } from "./evaluacion.schema";

// Shape del JSON que retorna Claude Code al analizar una intervención.
// Se usa para validar el output antes de subirlo a Firestore.
export const AnalisisResponseSchema = z.object({
  estadio: z.number().int().min(1).max(6).describe("Estadio Kohlberg dominante"),
  confianza: z.enum(["alta", "media", "baja"]).describe("Nivel de confianza"),
  justificacion: z.string().describe("Explicación del razonamiento"),
  citas: z.array(CitaSchema).min(1).describe("Citas textuales de sustento"),
  estadioAlternativo: z
    .number()
    .int()
    .min(1)
    .max(6)
    .nullable()
    .describe("Estadio alternativo si hay ambigüedad"),
  notas: z.string().nullable().describe("Observaciones relevantes"),
});

export type AnalisisResponse = z.infer<typeof AnalisisResponseSchema>;
