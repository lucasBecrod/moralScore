import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  increment,
} from "firebase/firestore";
import { db } from "@/firebase/client";
import type { Entidad } from "@/schemas/entidad.schema";
import type { Fuente, SubirFuenteInput } from "@/schemas/fuente.schema";
import type { Evaluacion } from "@/schemas/evaluacion.schema";
import type { Candidatura } from "@/schemas/candidatura.schema";
import type { Proceso } from "@/schemas/proceso.schema";
import type { Usuario } from "@/schemas/usuario.schema";

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
  data: Omit<Entidad, "scoreHistorico" | "totalEvaluacionesHistoricas">
): Promise<string> {
  if (!isFirebaseConfigured()) {
    return "mock-entidad-" + Date.now();
  }

  const ref = doc(db, "entidades", data.id);
  await setDoc(ref, {
    ...data,
    scoreHistorico: null,
    totalEvaluacionesHistoricas: 0,
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

interface CreateFuenteInput extends SubirFuenteInput {
  userId: string;
  titulo?: string;
  medio?: string;
  imagen?: string;
}

export async function createFuente(
  input: CreateFuenteInput
): Promise<string> {
  if (!isFirebaseConfigured()) {
    return "mock-fuente-" + Date.now();
  }

  const now = new Date().toISOString();
  const data: Omit<Fuente, "id"> = {
    url: input.url,
    tipo: input.tipo,
    entidadId: input.entidadId,
    titulo: input.titulo || input.url,
    medio: input.medio,
    fechaEvento: now.slice(0, 10),
    estado: "pendiente",
    calidadIA: null,
    userId: input.userId,
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

// --- Candidaturas ---

export async function getCandidaturas(procesoId?: string): Promise<Candidatura[]> {
  if (!isFirebaseConfigured()) return [];
  const ref = collection(db, "candidaturas");
  const q = procesoId
    ? query(ref, where("procesoId", "==", procesoId))
    : ref;
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Candidatura);
}

export async function getCandidaturaById(id: string): Promise<Candidatura | null> {
  if (!isFirebaseConfigured()) return null;
  const ref = doc(db, "candidaturas", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Candidatura;
}

export async function getCandidaturasByEntidad(entidadId: string): Promise<Candidatura[]> {
  if (!isFirebaseConfigured()) return [];
  const q = query(collection(db, "candidaturas"), where("entidadId", "==", entidadId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Candidatura);
}

// --- Procesos ---

export async function getProcesoActivo(): Promise<Proceso | null> {
  if (!isFirebaseConfigured()) return null;
  const q = query(collection(db, "procesos"), where("activa", "==", true));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Proceso;
}

// --- Validaciones ciudadanas ---

function validacionDocId(userId: string, evaluacionId: string): string {
  return `${userId}_${evaluacionId}`;
}

/** Verifica si el usuario ya validó una evaluación — llamar solo al expandir FuenteCard */
export async function getValidacionStatus(
  userId: string,
  evaluacionId: string
): Promise<boolean> {
  if (!isFirebaseConfigured()) return false;
  const ref = doc(db, "validaciones", validacionDocId(userId, evaluacionId));
  const snap = await getDoc(ref);
  return snap.exists();
}

/** Toggle validación ciudadana. Retorna nuevo estado (true = validado) */
export async function toggleValidacion(
  userId: string,
  evaluacionId: string
): Promise<boolean> {
  if (!isFirebaseConfigured()) return false;

  const id = validacionDocId(userId, evaluacionId);
  const ref = doc(db, "validaciones", id);
  const snap = await getDoc(ref);
  const evalRef = doc(db, "evaluaciones", evaluacionId);

  if (snap.exists()) {
    await deleteDoc(ref);
    await updateDoc(evalRef, { validacionesCiudadanas: increment(-1) });
    return false;
  } else {
    await setDoc(ref, {
      userId,
      evaluacionId,
      createdAt: new Date().toISOString(),
    });
    await updateDoc(evalRef, { validacionesCiudadanas: increment(1) });
    return true;
  }
}

// --- Usuarios ---

export async function getOrCreateUsuario(
  uid: string,
  nombre: string,
  email: string | null,
  foto: string | null,
): Promise<void> {
  if (!isFirebaseConfigured()) return;
  const ref = doc(db, "usuarios", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      id: uid,
      nombre,
      email,
      foto,
      createdAt: new Date().toISOString(),
    });
  }
}
