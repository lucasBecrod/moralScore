import { z } from "zod/v4";

export const ValidacionSchema = z.object({
  userId: z.string().describe("Firebase Auth UID del ciudadano que valida"),
  evaluacionId: z.string().describe("ID de la evaluación validada"),
  createdAt: z.string().describe("ISO 8601 timestamp"),
});

export type Validacion = z.infer<typeof ValidacionSchema>;
