import { NextResponse } from "next/server";
import { SubirFuenteInput } from "@/schemas/fuente.schema";
import { createFuente } from "@/firebase/queries";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = SubirFuenteInput.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error },
        { status: 400 }
      );
    }

    const id = await createFuente({
      ...parsed.data,
      titulo: body.titulo,
      medio: body.medio,
    });

    return NextResponse.json(
      { id, message: "Fuente registrada como pendiente" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en POST /api/fuente:", error);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}
