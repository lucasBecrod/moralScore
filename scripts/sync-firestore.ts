/**
 * Script ÚNICO de sincronización: data/*.json → Firestore
 *
 * Usa Admin SDK (bypasea security rules).
 * Detección automática de entorno:
 *   - FIRESTORE_EMULATOR_HOST presente → emulador
 *   - Si no → producción (ADC de gcloud/firebase CLI)
 *
 * Uso:
 *   npx tsx --env-file=.env.local scripts/sync-firestore.ts
 */

import { readFileSync } from "fs";
import { join } from "path";
import { initializeApp, applicationDefault, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { createHash } from "crypto";

// --- Detección de entorno ---
const isEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);

if (getApps().length === 0) {
  if (isEmulator) {
    initializeApp({ projectId: "moral-score" });
    console.log("🔌 Emulador\n");
  } else {
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (clientEmail && privateKey) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || "moral-score",
          clientEmail,
          privateKey,
        }),
      });
      console.log("🌐 Producción (service account)\n");
    } else {
      initializeApp({ credential: applicationDefault() });
      console.log("🌐 Producción (ADC)\n");
    }
  }
}

const db = getFirestore();

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

    const ref = db.collection(collectionName).doc(id);
    const snap = await ref.get();

    const data = { ...item };
    delete data[idField];

    if (snap.exists) {
      const existing = snap.data() || {};
      const createdAt = existing.createdAt;
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

      await ref.set({ ...data, ...(createdAt ? { createdAt } : {}) });
      updated++;
    } else {
      await ref.set({ ...data, createdAt: new Date().toISOString() });
      created++;
    }
  }

  return { created, updated, skipped };
}

// --- Main ---
async function main() {
  // 1. Sync candidatos
  console.log("📋 Candidatos...");
  const candidatos = loadJson<Record<string, unknown>>("candidatos.json");
  const candResult = await syncCollection("entidades", candidatos, "id", ["scoreHistorico", "totalEvaluacionesHistoricas"]);
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

  // 4. Sync procesos
  console.log("🗳️ Procesos...");
  const procesos = loadJson<Record<string, unknown>>("procesos.json");
  const procResult = await syncCollection("procesos", procesos);
  console.log(`   ${procResult.created} nuevos, ${procResult.updated} actualizados, ${procResult.skipped} sin cambios`);

  // 5. Sync candidaturas
  console.log("🎯 Candidaturas...");
  const candidaturas = loadJson<Record<string, unknown>>("candidaturas.json");
  const candResult2 = await syncCollection("candidaturas", candidaturas, "id", ["scoreCandidatura", "evaluacionesCandidatura"]);
  console.log(`   ${candResult2.created} nuevas, ${candResult2.updated} actualizadas, ${candResult2.skipped} sin cambios`);

  // 6. Recalcular scores
  if (evalResult.created > 0 || evalResult.updated > 0) {
    console.log("\n📊 Recalculando scores...");
    const evalSnap = await db.collection("evaluaciones").get();
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
      const ref = db.collection("entidades").doc(id);
      const snap = await ref.get();
      const current = snap.data();

      if (current?.scoreHistorico !== score || current?.totalEvaluacionesHistoricas !== estadios.length) {
        await ref.set({ scoreHistorico: score, totalEvaluacionesHistoricas: estadios.length }, { merge: true });
        console.log(`   ${id} → ${score} (${estadios.length} evals)`);
      }
    }
  } else {
    console.log("\n📊 Sin cambios en evaluaciones, scores intactos.");
  }

  // Recalculate candidatura scores (time-bounded)
  console.log("\n🎯 Recalculando scores de candidaturas...");
  const activeProcesos = await db.collection("procesos").where("activa", "==", true).get();

  for (const procDoc of activeProcesos.docs) {
    const fechaCorte = procDoc.data().fechaCorte;
    const candSnap = await db.collection("candidaturas").where("procesoId", "==", procDoc.id).get();

    for (const candDoc of candSnap.docs) {
      const cand = candDoc.data();
      const evalSnap2 = await db.collection("evaluaciones")
        .where("entidadId", "==", cand.entidadId).get();
      const filtered = evalSnap2.docs
        .map(d => d.data())
        .filter(e => e.fechaEvento && e.fechaEvento <= fechaCorte);
      const estadios = filtered.map(e => e.estadio).sort((a, b) => a - b);
      const score = estadios.length > 0 ? median(estadios) : null;

      if (cand.scoreCandidatura !== score || cand.evaluacionesCandidatura !== estadios.length) {
        await db.collection("candidaturas").doc(candDoc.id).update({
          scoreCandidatura: score,
          evaluacionesCandidatura: estadios.length,
        });
        console.log(`   ${candDoc.id} → ${score} (${estadios.length} evals, corte: ${fechaCorte})`);
      }
    }
  }

  console.log("\n✅ Sync completado.\n");
}

main().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
