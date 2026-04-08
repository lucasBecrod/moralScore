import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { z } from "zod/v4";
import { EntidadSchema } from "../src/schemas/entidad.schema";
import { FuenteSchema } from "../src/schemas/fuente.schema";
import { EvaluacionSchema } from "../src/schemas/evaluacion.schema";
import { CandidaturaSchema } from "../src/schemas/candidatura.schema";
import { ProcesoSchema } from "../src/schemas/proceso.schema";

const load = (file: string) =>
  JSON.parse(readFileSync(new URL(file, import.meta.url), "utf-8"));

const candidatos: unknown[] = load("./candidatos.json");
const fuentes: unknown[] = load("./fuentes.json");
const evaluaciones: unknown[] = load("./evaluaciones.json");
const candidaturas: unknown[] = load("./candidaturas.json");
const procesos: unknown[] = load("./procesos.json");

// JSON files omit Firestore-managed fields; build data-level schemas
const CandidatoData = EntidadSchema.pick({
  id: true, nombre: true, foto: true, tipo: true,
});

const FuenteData = FuenteSchema
  .pick({
    id: true, url: true, titulo: true, medio: true,
    fechaEvento: true, entidadId: true, estado: true,
  })
  .extend({ tipo: z.string() });

const EvaluacionData = EvaluacionSchema
  .pick({
    id: true, entidadId: true, fuenteId: true, estadio: true,
    justificacion: true, citas: true, fechaEvento: true,
  })
  .extend({
    evaluador: z.string(),
    // V1 data may still have these fields; V2 data will have reglaGert/gertCumplida
    confianza: z.string().optional(),
    estadioAlternativo: z.number().nullable().optional(),
    notas: z.string().nullable().optional(),
    reglaGert: z.string().optional(),
    gertCumplida: z.boolean().optional(),
  });

const CandidaturaData = CandidaturaSchema;

const ProcesoData = ProcesoSchema;

let ok = true;
const fail = (msg: string) => { ok = false; console.log(`   ❌ ${msg}`); };
const pass = (msg: string) => console.log(`   ✅ ${msg}`);

console.log("\n🔍 Test de integridad — validación contra schemas\n");

// --- Entidades (candidatos.json) ---
console.log(`📋 Entidades: ${candidatos.length}`);

try { assert.equal(candidatos.length, 35); pass("Count: 35"); }
catch { fail("Count != 35"); }

const cErrors: string[] = [];
for (const c of candidatos) {
  const r = CandidatoData.safeParse(c);
  if (!r.success) cErrors.push(`${(c as any).id}: ${z.prettifyError(r.error)}`);
}
cErrors.length === 0
  ? pass("Estructura válida (schema post-migración)")
  : (fail(`Estructura inválida (${cErrors.length})`), cErrors.forEach(e => console.log(`      ${e}`)));

const cIds = candidatos.map((c: any) => c.id as string);
const cIdSet = new Set(cIds);
cIdSet.size === cIds.length ? pass("IDs únicos") : fail(`${cIds.length - cIdSet.size} IDs duplicados`);

// Verificar que NO quedan campos electorales huérfanos
const withOldFields = candidatos.filter((c: any) => c.partido || c.logoPartido || c.rol || c.cargo);
withOldFields.length === 0
  ? pass("Sin campos electorales huérfanos (partido, logoPartido, rol, cargo)")
  : fail(`${withOldFields.length} entidades con campos electorales huérfanos`);

// --- Candidaturas ---
console.log(`\n🎯 Candidaturas: ${candidaturas.length}`);

try { assert.equal(candidaturas.length, 35); pass("Count: 35"); }
catch { fail("Count != 35"); }

const candErrors: string[] = [];
for (const c of candidaturas) {
  const r = CandidaturaData.safeParse(c);
  if (!r.success) candErrors.push(`${(c as any).id}: ${z.prettifyError(r.error)}`);
}
candErrors.length === 0
  ? pass("Estructura válida (CandidaturaSchema)")
  : (fail(`Estructura inválida (${candErrors.length})`), candErrors.forEach(e => console.log(`      ${e}`)));

const candEntidadIds = candidaturas.map((c: any) => c.entidadId as string);
const orphanCand = candEntidadIds.filter(id => !cIdSet.has(id));
orphanCand.length === 0
  ? pass("Integridad referencial (entidadId → entidades)")
  : fail(`${orphanCand.length} candidaturas con entidadId huérfano`);

// --- Procesos ---
console.log(`\n🗳️  Procesos: ${procesos.length}`);

try { assert.ok(procesos.length >= 1); pass(`Count: ${procesos.length}`); }
catch { fail("Count: 0 (se necesita al menos 1)"); }

const procErrors: string[] = [];
for (const p of procesos) {
  const r = ProcesoData.safeParse(p);
  if (!r.success) procErrors.push(`${(p as any).id}: ${z.prettifyError(r.error)}`);
}
procErrors.length === 0
  ? pass("Estructura válida (ProcesoSchema)")
  : (fail(`Estructura inválida (${procErrors.length})`), procErrors.forEach(e => console.log(`      ${e}`)));

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
  ? pass("Estructura válida (fechaEvento, no fechaFuente)")
  : (fail(`Estructura inválida (${fErrors.length})`), fErrors.forEach(e => console.log(`      ${e}`)));

const fIds = fuentes.map((f: any) => f.id as string);
const fIdSet = new Set(fIds);
fIdSet.size === fIds.length ? pass("IDs únicos") : fail(`${fIds.length - fIdSet.size} IDs duplicados`);

const orphanF = fuentes.filter((f: any) => !cIdSet.has(f.entidadId));
orphanF.length === 0
  ? pass("Integridad referencial (entidadId → entidades)")
  : fail(`${orphanF.length} fuentes con entidadId huérfano`);

const withOldFecha = fuentes.filter((f: any) => f.fechaFuente);
withOldFecha.length === 0
  ? pass("Sin campo huérfano fechaFuente")
  : fail(`${withOldFecha.length} fuentes con fechaFuente (debería ser fechaEvento)`);

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
  ? pass("Estructura válida (con fechaEvento)")
  : (fail(`Estructura inválida (${eErrors.length})`), eErrors.forEach(e => console.log(`      ${e}`)));

const eIds = evaluaciones.map((e: any) => e.id as string);
const eIdSet = new Set(eIds);
eIdSet.size === eIds.length ? pass("IDs únicos") : fail(`${eIds.length - eIdSet.size} IDs duplicados`);

const orphanEE = evaluaciones.filter((e: any) => !cIdSet.has(e.entidadId));
orphanEE.length === 0
  ? pass("Integridad referencial (entidadId → entidades)")
  : fail(`${orphanEE.length} evaluaciones con entidadId huérfano`);

const orphanEF = evaluaciones.filter((e: any) => !fIdSet.has(e.fuenteId));
orphanEF.length === 0
  ? pass("Integridad referencial (fuenteId → fuentes)")
  : fail(`${orphanEF.length} evaluaciones con fuenteId huérfano`);

// --- Result ---
console.log("");
if (ok) console.log("✅ Integridad: todos los checks pasaron\n");
else { console.log("❌ Integridad: hay checks fallidos\n"); process.exit(1); }
