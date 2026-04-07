import { z } from "zod/v4";

export const ProcesoTipo = z.enum(["nacional", "regional", "municipal"]);
export type ProcesoTipo = z.infer<typeof ProcesoTipo>;

export const ProcesoSchema = z.object({
  id: z.string().describe("Slug del proceso: presidenciales-2026"),
  nombre: z.string().describe("Nombre oficial del proceso electoral"),
  tipo: ProcesoTipo.describe("Alcance del proceso"),
  activa: z.boolean().describe("Si el proceso está vigente"),
  fechaCorte: z.string().describe("ISO 8601 date. Evaluaciones con fechaEvento <= este valor se incluyen en el snapshot"),
});
export type Proceso = z.infer<typeof ProcesoSchema>;
