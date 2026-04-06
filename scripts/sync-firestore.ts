/**
 * Script ÚNICO de sincronización: data/*.json → Firestore
 *
 * Lee candidatos.json, fuentes.json, evaluaciones.json
 * Solo escribe si el documento es nuevo o cambió.
 * Recalcula scores con mediana decimal.
 *
 * Uso:
 *   npx tsx scripts/sync-firestore.ts                    # producción
 *   NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true npx tsx scripts/sync-firestore.ts  # emulador
 */

import { readFileSync } from "fs";
import { join } from "path";
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore, doc, getDoc, setDoc, getDocs,
  collection, connectFirestoreEmulator,
} from "firebase/firestore";
import { createHash } from "crypto";

// --- Firebase init ---
const app = getApps().length === 0
  ? initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "moral-score",
    })
  : getApps()[0];
const db = getFirestore(app);

if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
  try { connectFirestoreEmulator(db, "localhost", 8080); } catch {}
  console.log("🔌 Emulador\n");
} else {
  console.log("🌐 Producción\n");
}

// --- Helpers ---
function hash(obj: Record<string, unknown>): string {
  return createHash("md5").update(JSON.stringify(obj)).digest("hex");
}

function median(arr: number[]): number {
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  if (s.length % 2 !== 0) return s[m];
  return Number(((s[m - 1] + s[m]) / 2).toFixed(2));
}

function loadJson<T>(filename: string): T[] {
  const path = join(process.cwd(), "data", filename);
  return JSON.parse(readFileSync(path, "utf-8"));
}

// --- Sync function ---
async function syncCollection(
  collectionName: string,
  items: Record<string, unknown>[],
  idField: string = "id",
  ignoreFieldsOnCompare: string[] = [],
) {
  let created = 0, updated = 0, skipped = 0;

  for (const item of items) {
    const id = item[idField] as string;
    if (!id) continue;

    const ref = doc(db, collectionName, id);
    const snap = await getDoc(ref);

    // Build data without the id field (Firestore uses doc ID)
    const data = { ...item };
    delete data[idField];

    if (snap.exists()) {
      // Compare only fields we're writing, ignoring specified fields
      const existing = snap.data();
      const compareKeys = Object.keys(data).filter(k => !ignoreFieldsOnCompare.includes(k));
      const relevantExisting: Record<string, unknown> = {};
      const relevantNew: Record<string, unknown> = {};
      for (const key of compareKeys) {
        relevantExisting[key] = existing[key];
        relevantNew[key] = (data as Record<string, unknown>)[key];
      }

      if (hash(relevantExisting) === hash(relevantNew)) {
        skipped++;
        continue;
      }

      await setDoc(ref, data, { merge: true });
      updated++;
    } else {
      // New doc — add createdAt for Firestore rules compliance
      await setDoc(ref, { ...data, createdAt: new Date().toISOString() });
      created++;
    }
  }

  return { created, updated, skipped };
}

// --- Main ---
async function main() {
  const now = new Date().toISOString();

  // 1. Sync candidatos (sin sobreescribir scoreActual ni totalEvaluaciones)
  console.log("📋 Candidatos...");
  const candidatos = loadJson<Record<string, unknown>>("candidatos.json");
  const candResult = await syncCollection("entidades", candidatos, "id", ["scoreActual", "totalEvaluaciones"]);
  console.log(`   ${candResult.created} nuevos, ${candResult.updated} actualizados, ${candResult.skipped} sin cambios`);

  // 2. Sync fuentes
  console.log("📰 Fuentes...");
  const fuentes = loadJson<Record<string, unknown>>("fuentes.json");
  const fuenteResult = await syncCollection("fuentes", fuentes.map(f => ({
    ...f,
    calidadIA: null,
    creadaPor: (f as Record<string, unknown>).creadaPor || "moralscore-bot",
  })), "id", ["createdAt"]);
  console.log(`   ${fuenteResult.created} nuevas, ${fuenteResult.updated} actualizadas, ${fuenteResult.skipped} sin cambios`);

  // 3. Sync evaluaciones
  console.log("🧠 Evaluaciones...");
  const evaluaciones = loadJson<Record<string, unknown>>("evaluaciones.json");
  const evalResult = await syncCollection("evaluaciones", evaluaciones.map(e => ({
    ...e,
    evaluador: (e as Record<string, unknown>).evaluador || "lucas",
    validadoPor: null,
  })), "id", ["createdAt"]);
  console.log(`   ${evalResult.created} nuevas, ${evalResult.updated} actualizadas, ${evalResult.skipped} sin cambios`);

  // 4. Recalcular scores (solo si hubo cambios en evaluaciones)
  if (evalResult.created > 0 || evalResult.updated > 0) {
    console.log("\n📊 Recalculando scores...");
    const evalSnap = await getDocs(collection(db, "evaluaciones"));
    const byEntidad: Record<string, number[]> = {};
    evalSnap.forEach((d) => {
      const data = d.data();
      if (data.entidadId && data.estadio) {
        if (!byEntidad[data.entidadId]) byEntidad[data.entidadId] = [];
        byEntidad[data.entidadId].push(data.estadio);
      }
    });

    for (const [id, estadios] of Object.entries(byEntidad)) {
      const score = median(estadios);
      const ref = doc(db, "entidades", id);
      const snap = await getDoc(ref);
      const current = snap.data();

      // Solo actualizar si el score cambió
      if (current?.scoreActual !== score || current?.totalEvaluaciones !== estadios.length) {
        await setDoc(ref, { scoreActual: score, totalEvaluaciones: estadios.length }, { merge: true });
        console.log(`   ${id} → ${score} (${estadios.length} evals)`);
      }
    }
  } else {
    console.log("\n📊 Sin cambios en evaluaciones, scores intactos.");
  }

  console.log("\n✅ Sync completado.\n");
}

main().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
