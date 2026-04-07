import { z } from "zod/v4";

export const LikeSchema = z.object({
  userId: z.string().describe("Firebase Auth UID del usuario"),
  entidadId: z.string().describe("ID de la entidad que recibe el like"),
  createdAt: z.string().describe("ISO 8601 timestamp"),
});

export type Like = z.infer<typeof LikeSchema>;
