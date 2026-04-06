import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebase/client";
import type { Candidato } from "@/schemas/candidato.schema";
import type { Fuente, SubirFuenteInput } from "@/schemas/fuente.schema";
import type { Evaluacion } from "@/schemas/evaluacion.schema";

// Verifica si Firebase está configurado (env vars presentes)
function isFirebaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
}

// --- Candidatos ---

export async function getCandidatos(): Promise<Candidato[]> {
  if (!isFirebaseConfigured()) return [];

  const snap = await getDocs(collection(db, "candidatos"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Candidato);
}

export async function getCandidatoById(
  id: string
): Promise<Candidato | null> {
  if (!isFirebaseConfigured()) return null;

  const ref = doc(db, "candidatos", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Candidato;
}

// --- Fuentes ---

export async function getFuentesByCandidato(
  candidatoId: string
): Promise<Fuente[]> {
  if (!isFirebaseConfigured()) return [];

  const q = query(
    collection(db, "fuentes"),
    where("candidatoId", "==", candidatoId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Fuente);
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
    candidatoId: input.candidatoId,
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

export async function getEvaluacionesByCandidato(
  candidatoId: string
): Promise<Evaluacion[]> {
  if (!isFirebaseConfigured()) return [];

  const q = query(
    collection(db, "evaluaciones"),
    where("candidatoId", "==", candidatoId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Evaluacion);
}
