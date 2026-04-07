import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { createEntidad, getProcesoActivo } from "@/firebase/queries";
import { EntidadTipo } from "@/schemas/entidad.schema";
import { checkRateLimit, getClientIP } from "@/shared/lib/rate-limit";
import { setDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/client";

const CrearEntidadInput = z.object({
  nombre: z.string().min(1).describe("Nombre público de la entidad"),
  foto: z.string().min(1).describe("Ruta a la foto"),
  tipo: EntidadTipo.optional(),
  nombreLegal: z.string().optional(),
  dniRuc: z.string().optional(),
  region: z.string().optional(),
  bio: z.string().optional(),
  // Electoral fields — for candidatura, not stored in entidad
  partido: z.string().optional(),
  rol: z.string().optional(),
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
  const ip = getClientIP(request.headers);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta en un minuto." },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();

    const parsed = CrearEntidadInput.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error },
        { status: 400 }
      );
    }

    const { partido, rol, ...entidadFields } = parsed.data;
    const id = toSlug(entidadFields.nombre);

    await createEntidad({ id, ...entidadFields });

    // Create candidatura if electoral fields present
    if (partido || rol) {
      const procesoActivo = await getProcesoActivo();
      if (procesoActivo) {
        const candidaturaId = `${id}_${procesoActivo.id}`;
        await setDoc(doc(db, "candidaturas", candidaturaId), {
          entidadId: id,
          procesoId: procesoActivo.id,
          partido: partido || undefined,
          rol: rol || undefined,
          nombre: entidadFields.nombre,
          foto: entidadFields.foto,
          scoreCandidatura: null,
          evaluacionesCandidatura: 0,
        });
      }
    }

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
