/**
 * Primera evaluación real — Keiko Fujimori, Debate JNE 25/03/2026
 */

import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, setDoc, connectFirestoreEmulator } from "firebase/firestore";

const app = getApps().length === 0
  ? initializeApp({ apiKey: "demo", projectId: "moral-score" })
  : getApps()[0];
const db = getFirestore(app);

if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true" || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  try { connectFirestoreEmulator(db, "localhost", 8080); } catch {}
}

async function main() {
  // 1. Crear evaluación
  const evalId = "eval-keiko-debate-25mar-seguridad";
  await setDoc(doc(db, "evaluaciones", evalId), {
    entidadId: "keiko-sofia-fujimori-higuchi",
    fuenteId: "keiko-sofia-fujimori-higuchi-2026-03-25-la-republica",
    estadio: 3,
    confianza: "alta",
    justificacion: "La candidata evita asumir responsabilidad por la acción legislativa de su partido desestimando las leyes como 'papeles'. No articula un principio moral para justificar esta posición, sino que apela a la necesidad de obtener el poder ejecutivo como solución. El razonamiento busca aprobación del electorado sin asumir el costo político de reconocer la responsabilidad del fujimorismo en el Congreso.",
    citas: [
      {
        texto: "las leyes son papeles, son intenciones. Para poder recuperar la seguridad se necesita ganar la presidencia",
        ubicacion: "Bloque preguntas ciudadanas, seguridad",
        indicador: "Evita el conflicto central (responsabilidad legislativa) apelando a una solución futura vaga — Estadio 3",
      },
      {
        texto: "el fujimorismo no ha gobernado, ni yo tampoco",
        ubicacion: "Continuación preguntas ciudadanas",
        indicador: "Deslinde de responsabilidad sin principio articulado — entre Estadio 2 y Estadio 3",
      },
    ],
    estadioAlternativo: 2,
    notas: "El anti-ventriloquismo funciona: un LLM sin corrección podría inflar a Estadio 4 porque menciona 'leyes' e 'instituciones', pero la candidata las desestima en vez de defenderlas.",
    evaluador: "lucas",
    validadoPor: null,
    createdAt: new Date().toISOString(),
  });
  console.log("+ Evaluación creada:", evalId);

  // 2. Actualizar la fuente a estado "evaluada"
  const fuenteId = "keiko-sofia-fujimori-higuchi-2026-03-25-la-republica";
  await setDoc(doc(db, "fuentes", fuenteId), { estado: "evaluada" }, { merge: true });
  console.log("+ Fuente actualizada a 'evaluada':", fuenteId);

  // 3. Actualizar scoreActual de la entidad
  await setDoc(doc(db, "entidades", "keiko-sofia-fujimori-higuchi"), {
    scoreActual: 3,
    totalEvaluaciones: 1,
  }, { merge: true });
  console.log("+ Entidad actualizada: scoreActual=3, totalEvaluaciones=1");

  console.log("\nPrimera evaluación real completada.");
}

main().catch(console.error);
