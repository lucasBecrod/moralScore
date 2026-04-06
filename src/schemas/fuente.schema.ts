import { z } from "zod/v4";

export const FuenteTipo = z.enum(["youtube", "articulo", "entrevista", "debate"]);
export type FuenteTipo = z.infer<typeof FuenteTipo>;

export const FuenteEstado = z.enum(["pendiente", "aprobada", "rechazada", "evaluada"]);
export type FuenteEstado = z.infer<typeof FuenteEstado>;

export const FuenteSchema = z.object({
  id: z.string().describe("ID único de la fuente (Firestore auto-ID)"),
  url: z.url().describe("URL original de la fuente"),
  tipo: FuenteTipo.describe("Tipo de contenido"),
  titulo: z.string().describe("Título de la fuente para mostrar"),
  medio: z.string().optional().describe("Medio de comunicación (ej: RPP, Canal N)"),
  fechaFuente: z.string().optional().describe("Fecha del contenido original"),
  candidatoId: z.string().describe("FK al candidato evaluado"),
  estado: FuenteEstado.describe("Estado en el pipeline de revisión"),
  calidadIA: z
    .object({
      aprobada: z.boolean().describe("Si la IA aprobó la calidad"),
      razon: z.string().describe("Explicación de la decisión de calidad"),
    })
    .nullable()
    .describe("Resultado del filtro IA de calidad, null si no procesada"),
  creadaPor: z.enum(["publico", "lucas", "lady"]).describe("Quién subió la fuente"),
  createdAt: z.string().describe("ISO 8601 timestamp de creación"),
});

export type Fuente = z.infer<typeof FuenteSchema>;

// Schema para el formulario público (solo lo que envía el usuario)
export const SubirFuenteInput = z.object({
  url: z.url().describe("URL de la fuente"),
  tipo: FuenteTipo.describe("Tipo de contenido"),
  candidatoId: z.string().describe("ID del candidato"),
});

export type SubirFuenteInput = z.infer<typeof SubirFuenteInput>;
