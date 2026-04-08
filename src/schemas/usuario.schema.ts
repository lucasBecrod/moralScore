import { z } from "zod/v4";

export const UsuarioSchema = z.object({
  id: z.string().describe("Firebase Auth UID o slug fijo (ej: bot-moralscore)"),
  email: z.string().email().nullable().describe("Email de Google Auth, null para bots"),
  nombre: z.string().describe("displayName de Google Auth o nombre manual"),
  foto: z.string().nullable().optional().describe("photoURL de Google Auth"),
  createdAt: z.string().describe("ISO 8601 timestamp"),
});
export type Usuario = z.infer<typeof UsuarioSchema>;
