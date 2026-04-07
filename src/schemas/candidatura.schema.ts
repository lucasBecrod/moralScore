import { z } from "zod/v4";

export const CandidaturaRol = z.enum([
  "presidente", "vicepresidente-1", "vicepresidente-2",
  "congresista", "alcalde", "gobernador", "otro",
]);
export type CandidaturaRol = z.infer<typeof CandidaturaRol>;

export const CandidaturaSchema = z.object({
  id: z.string().describe("Compound: {entidadId}_{procesoId}"),
  entidadId: z.string().describe("FK a entidades/{id}"),
  procesoId: z.string().describe("FK a procesos/{id}"),
  partido: z.string().optional().describe("Nombre del partido político"),
  logoPartido: z.string().optional().describe("URL del logo del partido"),
  rol: CandidaturaRol.optional().describe("Rol en la fórmula electoral"),
  nombre: z.string().describe("Desnormalizado de entidad.nombre"),
  foto: z.string().describe("Desnormalizado de entidad.foto"),
  scoreCandidatura: z.number().min(1).max(6).nullable().describe("Mediana time-bounded"),
  evaluacionesCandidatura: z.number().int().min(0).describe("Total evaluaciones en snapshot"),
});
export type Candidatura = z.infer<typeof CandidaturaSchema>;
