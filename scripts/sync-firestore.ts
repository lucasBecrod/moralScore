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

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { initializeApp, applicationDefault, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { createHash } from "crypto";
import { PESO_FRICCION, TECHO_GERT, UMBRAL_EVIDENCIA_MATERIAL } from "../src/shared/config/kohlberg-stages";

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
  idField = "id",
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
      const compareKeys = Object.keys(data).filter(k => !ignoreFieldsOnCompare.includes(k));
      const pick = (src: Record<string, unknown>) => Object.fromEntries(compareKeys.map(k => [k, src[k]]));
      if (hash(pick(existing)) === hash(pick(data))) { skipped++; continue; }
      await ref.set({ ...data, ...(existing.createdAt ? { createdAt: existing.createdAt } : {}) });
      updated++;
    } else {
      await ref.set({ ...data, createdAt: new Date().toISOString() });
      created++;
    }
  }
  return { created, updated, skipped };
}

type EvalForScore = { estadio: number; reglaGert?: string; gertCumplida?: boolean; fuenteId: string };

/** V2 Colapso de Techo: mediana retórica limitada por techo Gert en evidencia dura. */
function scoreV2(
  evaluaciones: EvalForScore[],
  fuentes: Array<{ id: string; tipo: string }>
): { score: number; medianaRetorica: number; techoMaterial: number; reglaColapsada?: string } | null {
  if (evaluaciones.length === 0) return null;
  const fuenteMap = Object.fromEntries(fuentes.map(f => [f.id, f]));
  const medianaRetorica = median(evaluaciones.map(e => e.estadio));
  let techoMaterial = 6.0;
  let reglaColapsada: string | undefined;
  for (const ev of evaluaciones) {
    if (!ev.reglaGert || ev.reglaGert === "ninguna" || ev.gertCumplida !== false) continue;
    const peso = PESO_FRICCION[fuenteMap[ev.fuenteId]?.tipo ?? ""] ?? 0.3;
    if (peso >= UMBRAL_EVIDENCIA_MATERIAL) {
      const techo = TECHO_GERT[ev.reglaGert] ?? 6.0;
      if (techo < techoMaterial) { techoMaterial = techo; reglaColapsada = ev.reglaGert; }
    }
  }
  const score = Number(Math.min(medianaRetorica, techoMaterial).toFixed(2));
  return { score, medianaRetorica, techoMaterial, reglaColapsada };
}

// --- Main ---
async function main() {
  console.log("👤 Usuarios...");
  const usuarios = loadJson<Record<string, unknown>>("usuarios.json");
  const userResult = await syncCollection("usuarios", usuarios, "id");
  console.log(`   ${userResult.created} nuevos, ${userResult.updated} actualizados, ${userResult.skipped} sin cambios`);

  console.log("📋 Candidatos...");
  const candidatos = loadJson<Record<string, unknown>>("candidatos.json");
  const candResult = await syncCollection("entidades", candidatos, "id", ["scoreHistorico", "totalEvaluacionesHistoricas"]);
  console.log(`   ${candResult.created} nuevos, ${candResult.updated} actualizados, ${candResult.skipped} sin cambios`);

  console.log("📰 Fuentes...");
  const fuentes = loadJson<Record<string, unknown>>("fuentes.json");
  const fuenteResult = await syncCollection("fuentes", fuentes.map(f => ({
    ...f,
    calidadIA: null,
    userId: (f as Record<string, unknown>).userId || "bot-moralscore",
  })), "id", ["createdAt"]);
  console.log(`   ${fuenteResult.created} nuevas, ${fuenteResult.updated} actualizadas, ${fuenteResult.skipped} sin cambios`);

  console.log("🧠 Evaluaciones...");
  const evaluaciones = loadJson<Record<string, unknown>>("evaluaciones.json");
  const evalResult = await syncCollection("evaluaciones", evaluaciones.map(e => ({
    ...e,
    userId: (e as Record<string, unknown>).userId || "lucasbecrod",
    validadoPor: null,
  })), "id", ["createdAt"]);
  console.log(`   ${evalResult.created} nuevas, ${evalResult.updated} actualizadas, ${evalResult.skipped} sin cambios`);

  console.log("🗳️ Procesos...");
  const procResult = await syncCollection("procesos", loadJson("procesos.json"));
  console.log(`   ${procResult.created} nuevos, ${procResult.updated} actualizados, ${procResult.skipped} sin cambios`);

  console.log("🎯 Candidaturas...");
  const candResult2 = await syncCollection("candidaturas", loadJson("candidaturas.json"), "id", ["scoreCandidatura", "evaluacionesCandidatura"]);
  console.log(`   ${candResult2.created} nuevas, ${candResult2.updated} actualizadas, ${candResult2.skipped} sin cambios`);

  // 6. Recalcular scores — fuentes leídas una vez, reutilizadas en candidaturas
  const fuenteSnap = await db.collection("fuentes").get();
  const allFuentes = fuenteSnap.docs.map(d => ({ id: d.id, tipo: (d.data().tipo as string) ?? "" }));

  if (evalResult.created > 0 || evalResult.updated > 0) {
    console.log("\n📊 Recalculando scores (V2 Colapso de Techo)...");
    const evalSnap = await db.collection("evaluaciones").get();
    const byEntidad: Record<string, EvalForScore[]> = {};
    evalSnap.forEach((d) => {
      const data = d.data();
      if (data.entidadId && data.estadio) {
        if (!byEntidad[data.entidadId]) byEntidad[data.entidadId] = [];
        byEntidad[data.entidadId].push({
          estadio: data.estadio,
          reglaGert: data.reglaGert,
          gertCumplida: data.gertCumplida,
          fuenteId: data.fuenteId ?? "",
        });
      }
    });

    for (const [id, evals] of Object.entries(byEntidad)) {
      const result = scoreV2(evals, allFuentes);
      if (!result) continue;
      const { score, medianaRetorica, techoMaterial, reglaColapsada } = result;
      const ref = db.collection("entidades").doc(id);
      const snap = await ref.get();
      const current = snap.data();

      if (current?.scoreHistorico !== score || current?.totalEvaluacionesHistoricas !== evals.length) {
        await ref.set({ scoreHistorico: score, totalEvaluacionesHistoricas: evals.length }, { merge: true });
        if (techoMaterial < medianaRetorica) {
          console.log(`   ${id} → ${score} (mediana: ${medianaRetorica}, techo Gert: ${techoMaterial} — ${reglaColapsada}) (${evals.length} evals)`);
        } else {
          console.log(`   ${id} → ${score} (${evals.length} evals)`);
        }
      }
    }
  } else {
    console.log("\n📊 Sin cambios en evaluaciones, scores intactos.");
  }

  // Recalculate candidatura scores (time-bounded, V2 Colapso de Techo)
  console.log("\n🎯 Recalculando scores de candidaturas...");
  const activeProcesos = await db.collection("procesos").where("activa", "==", true).get();

  for (const procDoc of activeProcesos.docs) {
    const fechaCorte = procDoc.data().fechaCorte;
    const candSnap = await db.collection("candidaturas").where("procesoId", "==", procDoc.id).get();

    for (const candDoc of candSnap.docs) {
      const cand = candDoc.data();
      const evalSnap2 = await db.collection("evaluaciones")
        .where("entidadId", "==", cand.entidadId).get();
      const filtered: EvalForScore[] = evalSnap2.docs
        .map(d => d.data())
        .filter(e => e.fechaEvento && e.fechaEvento <= fechaCorte)
        .map(e => ({
          estadio: e.estadio,
          reglaGert: e.reglaGert,
          gertCumplida: e.gertCumplida,
          fuenteId: e.fuenteId ?? "",
        }));

      const result = scoreV2(filtered, allFuentes);
      const score = result?.score ?? null;
      const count = filtered.length;

      if (cand.scoreCandidatura !== score || cand.evaluacionesCandidatura !== count) {
        await db.collection("candidaturas").doc(candDoc.id).update({
          scoreCandidatura: score,
          evaluacionesCandidatura: count,
        });
        if (result && result.techoMaterial < result.medianaRetorica) {
          console.log(`   ${candDoc.id} → ${score} (mediana: ${result.medianaRetorica}, techo Gert: ${result.techoMaterial} — ${result.reglaColapsada}) (${count} evals, corte: ${fechaCorte})`);
        } else {
          console.log(`   ${candDoc.id} → ${score} (${count} evals, corte: ${fechaCorte})`);
        }
      }
    }
  }

  // 7. Escribir métricas globales → metricas/global
  console.log("\n📈 Actualizando métricas globales...");
  const totalFuentes = fuenteSnap.size;
  const evalSnapGlobal = await db.collection("evaluaciones").get();
  const totalEvaluaciones = evalSnapGlobal.size;
  const totalCandidatos = (await db.collection("candidaturas").get()).size;
  const totalProcesos = (await db.collection("procesos").get()).size;

  const metricasGlobales = {
    totalFuentes,
    totalEvaluaciones,
    totalCandidatos,
    totalProcesos,
    updatedAt: new Date().toISOString(),
  };

  await db.collection("metricas").doc("global").set(metricasGlobales);
  console.log(`   fuentes: ${totalFuentes}, evaluaciones: ${totalEvaluaciones}, candidatos: ${totalCandidatos}, procesos: ${totalProcesos}`);

  // 8. Generar JSON estáticos → public/api/ (CDN, 0 reads Firestore)
  console.log("\n📦 Generando JSON estáticos...");
  const apiDir = join(process.cwd(), "public", "api");
  mkdirSync(apiDir, { recursive: true });

  writeFileSync(join(apiDir, "metricas.json"), JSON.stringify(metricasGlobales));
  console.log("   public/api/metricas.json ✓");

  // Leer candidaturas finales con scores recalculados
  const allCandSnap = await db.collection("candidaturas").get();
  const candidaturasJson = allCandSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  writeFileSync(join(apiDir, "candidaturas.json"), JSON.stringify(candidaturasJson));
  console.log(`   public/api/candidaturas.json (${candidaturasJson.length} registros) ✓`);

  console.log("\n✅ Sync completado.\n");
}

main().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
