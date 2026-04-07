import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { z } from "zod/v4";
import { EntidadSchema } from "../src/schemas/entidad.schema";
import { FuenteSchema } from "../src/schemas/fuente.schema";
import { EvaluacionSchema } from "../src/schemas/evaluacion.schema";

const load = (file: string) =>
  JSON.parse(readFileSync(new URL(file, import.meta.url), "utf-8"));

const candidatos: unknown[] = load("./candidatos.json");
const fuentes: unknown[] = load("./fuentes.json");
const evaluaciones: unknown[] = load("./evaluaciones.json");

// JSON files omit Firestore-managed fields; build data-level schemas
const CandidatoData = EntidadSchema.pick({
  id: true, nombre: true, foto: true, tipo: true,
  rol: true, partido: true, logoPartido: true,
});

const FuenteData = FuenteSchema
  .pick({
    id: true, url: true, titulo: true, medio: true,
    fechaFuente: true, entidadId: true, estado: true,
  })
  .extend({ tipo: z.string() });

const EvaluacionData = EvaluacionSchema
  .pick({
    id: true, entidadId: true, fuenteId: true, estadio: true,
    confianza: true, justificacion: true, citas: true,
    estadioAlternativo: true, notas: true,
  })
  .extend({ evaluador: z.string() });

let ok = true;
const fail = (msg: string) => { ok = false; console.log(`   ❌ ${msg}`); };
const pass = (msg: string) => console.log(`   ✅ ${msg}`);

console.log("\n🔍 Test pre-migración — snapshot de integridad\n");

// --- Candidatos ---
console.log(`📋 Candidatos: ${candidatos.length}`);

try { assert.equal(candidatos.length, 35); pass("Count: 35"); }
catch { fail("Count != 35"); }

const cErrors: string[] = [];
for (const c of candidatos) {
  const r = CandidatoData.safeParse(c);
  if (!r.success) cErrors.push(`${(c as any).id}: ${z.prettifyError(r.error)}`);
}
cErrors.length === 0
  ? pass("Estructura válida")
  : (fail(`Estructura inválida (${cErrors.length})`), cErrors.forEach(e => console.log(`      ${e}`)));

const cIds = candidatos.map((c: any) => c.id as string);
const cIdSet = new Set(cIds);
cIdSet.size === cIds.length ? pass("IDs únicos") : fail(`${cIds.length - cIdSet.size} IDs duplicados`);

const withPartido = candidatos.filter((c: any) => c.partido).length;
const withLogo = candidatos.filter((c: any) => c.logoPartido).length;
const withRol = candidatos.filter((c: any) => c.rol).length;
console.log(`   ℹ️  partido: ${withPartido}/${candidatos.length}, logoPartido: ${withLogo}/${candidatos.length}, rol: ${withRol}/${candidatos.length}`);

// --- Fuentes ---
console.log(`\n📰 Fuentes: ${fuentes.length}`);

try { assert.equal(fuentes.length, 276); pass("Count: 276"); }
catch { fail("Count != 276"); }

const fErrors: string[] = [];
for (const f of fuentes) {
  const r = FuenteData.safeParse(f);
  if (!r.success) fErrors.push(`${(f as any).id}: ${z.prettifyError(r.error)}`);
}
fErrors.length === 0
  ? pass("Estructura válida")
  : (fail(`Estructura inválida (${fErrors.length})`), fErrors.forEach(e => console.log(`      ${e}`)));

const fIds = fuentes.map((f: any) => f.id as string);
const fIdSet = new Set(fIds);
fIdSet.size === fIds.length ? pass("IDs únicos") : fail(`${fIds.length - fIdSet.size} IDs duplicados`);

const orphanF = fuentes.filter((f: any) => !cIdSet.has(f.entidadId));
orphanF.length === 0
  ? pass("Integridad referencial (entidadId → candidatos)")
  : fail(`${orphanF.length} fuentes con entidadId huérfano: ${orphanF.map((f: any) => f.id).join(", ")}`);

const withFecha = fuentes.filter((f: any) => f.fechaFuente).length;
console.log(`   ℹ️  fechaFuente: ${withFecha}/${fuentes.length}`);

// --- Evaluaciones ---
console.log(`\n🧠 Evaluaciones: ${evaluaciones.length}`);

try { assert.equal(evaluaciones.length, 272); pass("Count: 272"); }
catch { fail("Count != 272"); }

const eErrors: string[] = [];
for (const ev of evaluaciones) {
  const r = EvaluacionData.safeParse(ev);
  if (!r.success) eErrors.push(`${(ev as any).id}: ${z.prettifyError(r.error)}`);
}
eErrors.length === 0
  ? pass("Estructura válida")
  : (fail(`Estructura inválida (${eErrors.length})`), eErrors.forEach(e => console.log(`      ${e}`)));

const eIds = evaluaciones.map((e: any) => e.id as string);
const eIdSet = new Set(eIds);
eIdSet.size === eIds.length ? pass("IDs únicos") : fail(`${eIds.length - eIdSet.size} IDs duplicados`);

const orphanEE = evaluaciones.filter((e: any) => !cIdSet.has(e.entidadId));
orphanEE.length === 0
  ? pass("Integridad referencial (entidadId → candidatos)")
  : fail(`${orphanEE.length} evaluaciones con entidadId huérfano`);

const orphanEF = evaluaciones.filter((e: any) => !fIdSet.has(e.fuenteId));
orphanEF.length === 0
  ? pass("Integridad referencial (fuenteId → fuentes)")
  : fail(`${orphanEF.length} evaluaciones con fuenteId huérfano: ${orphanEF.map((e: any) => e.id).join(", ")}`);

// --- Result ---
console.log("");
if (ok) console.log("✅ Pre-migración: todos los checks pasaron\n");
else { console.log("❌ Pre-migración: hay checks fallidos\n"); process.exit(1); }
