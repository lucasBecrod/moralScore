import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { createEntidad } from "@/firebase/queries";
import { EntidadTipo } from "@/schemas/entidad.schema";

const CrearEntidadInput = z.object({
  nombre: z.string().min(1).describe("Nombre público de la entidad"),
  foto: z.string().min(1).describe("Ruta a la foto"),
  tipo: EntidadTipo.optional(),
  nombreLegal: z.string().optional(),
  dniRuc: z.string().optional(),
  partido: z.string().optional(),
  cargo: z.string().optional(),
  region: z.string().optional(),
  intencionVoto: z.string().optional(),
  planGobierno: z.string().optional(),
  bio: z.string().optional(),
  links: z.array(z.string()).optional(),
});

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = CrearEntidadInput.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error },
        { status: 400 }
      );
    }

    const id = toSlug(parsed.data.nombre);

    const entidadData = {
      id,
      ...parsed.data,
    };

    await createEntidad(entidadData);

    return NextResponse.json(
      { id, message: "Entidad registrada" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en POST /api/entidad:", error);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}
