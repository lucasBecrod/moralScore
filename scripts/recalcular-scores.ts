/**
 * Recalcula scoreActual de todas las entidades usando mediana con decimales.
 * Lee todas las evaluaciones de Firestore y actualiza cada entidad.
 *
 * Uso: NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true npx tsx scripts/recalcular-scores.ts
 */

import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, connectFirestoreEmulator } from "firebase/firestore";

const app = getApps().length === 0
  ? initializeApp({ apiKey: "demo", projectId: "moral-score" })
  : getApps()[0];
const db = getFirestore(app);

if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true" || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  try { connectFirestoreEmulator(db, "localhost", 8080); } catch {}
}

function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 !== 0) return sorted[mid];
  // Decimal median
  return Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2));
}

async function main() {
  // 1. Leer todas las evaluaciones
  const evalSnap = await getDocs(collection(db, "evaluaciones"));
  const evals: { entidadId: string; estadio: number }[] = [];
  evalSnap.forEach((d) => {
    const data = d.data();
    if (data.entidadId && data.estadio) {
      evals.push({ entidadId: data.entidadId, estadio: data.estadio });
    }
  });

  // 2. Agrupar por entidad
  const byEntidad: Record<string, number[]> = {};
  for (const ev of evals) {
    if (!byEntidad[ev.entidadId]) byEntidad[ev.entidadId] = [];
    byEntidad[ev.entidadId].push(ev.estadio);
  }

  // 3. Calcular mediana con decimales y actualizar
  console.log(`\nRecalculando scores para ${Object.keys(byEntidad).length} entidades...\n`);

  for (const [entidadId, estadios] of Object.entries(byEntidad)) {
    const score = median(estadios);
    await setDoc(doc(db, "entidades", entidadId), {
      scoreActual: score,
      totalEvaluaciones: estadios.length,
    }, { merge: true });
    console.log(`  ${entidadId} → ${score.toFixed(2)} (${estadios.length} evals: [${estadios.join(",")}])`);
  }

  console.log(`\nListo. ${evals.length} evaluaciones procesadas.\n`);
}

main().catch(console.error);
