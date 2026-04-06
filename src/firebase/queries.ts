import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebase/client";
import type { Entidad } from "@/schemas/entidad.schema";
import type { Fuente, SubirFuenteInput } from "@/schemas/fuente.schema";
import type { Evaluacion } from "@/schemas/evaluacion.schema";

// Verifica si Firebase está configurado (env vars presentes)
function isFirebaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
}

// --- Entidades ---

export async function getEntidades(): Promise<Entidad[]> {
  if (!isFirebaseConfigured()) return [];

  const snap = await getDocs(collection(db, "entidades"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Entidad);
}

export async function getEntidadById(
  id: string
): Promise<Entidad | null> {
  if (!isFirebaseConfigured()) return null;

  const ref = doc(db, "entidades", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Entidad;
}

export async function createEntidad(
  data: Omit<Entidad, "scoreActual" | "totalEvaluaciones">
): Promise<string> {
  if (!isFirebaseConfigured()) {
    return "mock-entidad-" + Date.now();
  }

  const ref = doc(db, "entidades", data.id);
  await setDoc(ref, {
    ...data,
    scoreActual: null,
    totalEvaluaciones: 0,
  });
  return data.id;
}

// --- Fuentes ---

export async function getFuentesByEntidad(
  entidadId: string
): Promise<Fuente[]> {
  if (!isFirebaseConfigured()) return [];

  const q = query(
    collection(db, "fuentes"),
    where("entidadId", "==", entidadId)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as Fuente)
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}

export async function createFuente(
  input: SubirFuenteInput
): Promise<string> {
  if (!isFirebaseConfigured()) {
    // Mock: retorna un ID falso para desarrollo
    return "mock-fuente-" + Date.now();
  }

  const now = new Date().toISOString();
  const data: Omit<Fuente, "id"> = {
    url: input.url,
    tipo: input.tipo,
    entidadId: input.entidadId,
    titulo: input.url, // se enriquecerá después
    estado: "pendiente",
    calidadIA: null,
    creadaPor: "publico",
    createdAt: now,
  };

  const ref = await addDoc(collection(db, "fuentes"), data);
  return ref.id;
}

// --- Evaluaciones ---

export async function getEvaluacionesByEntidad(
  entidadId: string
): Promise<Evaluacion[]> {
  if (!isFirebaseConfigured()) return [];

  const q = query(
    collection(db, "evaluaciones"),
    where("entidadId", "==", entidadId)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as Evaluacion)
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}
