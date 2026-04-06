/**
 * Ronda 3 — Evaluaciones de historial de vida (pre-campaña)
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

function median(arr: number[]): number {
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 !== 0 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}

// Primero registrar las fuentes
const FUENTES = [
  { id: "fuente-keiko-tc-cocteles", url: "https://ojo-publico.com/5982/es-falso-que-el-tc-absolvio-keiko-fujimori-del-caso-cocteles", tipo: "articulo", titulo: "Ojo Público: Es falso que el TC absolvió a Keiko del caso Cócteles", medio: "Ojo Público", fechaFuente: "2025-10-30", entidadId: "keiko-sofia-fujimori-higuchi", estado: "evaluada" },
  { id: "fuente-rla-gestion-lima", url: "https://larepublica.pe/sociedad/2025/10/12/rafael-lopez-aliaga-dejaria-la-alcaldia-de-lima-sin-cumplir-25-promesas-de-su-plan-de-gobierno-municipal-hnews-167364", tipo: "articulo", titulo: "López Aliaga dejaría alcaldía sin cumplir 25 promesas", medio: "La República", fechaFuente: "2025-10-12", entidadId: "rafael-bernardo-lopez-aliaga-cazorla", estado: "evaluada" },
  { id: "fuente-rla-endeudamiento-mml", url: "https://larepublica.pe/politica/2026/03/22/rafael-lopez-aliaga-sera-investigado-por-presunta-colusion-y-negociacion-incompatible-tras-endeudamiento-de-la-mml-por-s4-mil-millones-hnews-1944052", tipo: "articulo", titulo: "López Aliaga investigado por endeudamiento de S/4 mil millones en MML", medio: "La República", fechaFuente: "2026-03-22", entidadId: "rafael-bernardo-lopez-aliaga-cazorla", estado: "evaluada" },
  { id: "fuente-forsyth-renuncia-victoria", url: "https://elcomercio.pe/politica/george-forsyth-podia-ser-10-anos-alcalde-de-la-victoria-y-no-iba-a-poder-cambiarla-mas-porque-no-funciona-el-estado-nndc-noticia/", tipo: "entrevista", titulo: "Forsyth: 'Podía ser 10 años alcalde y no cambiarla más'", medio: "El Comercio", fechaFuente: "2021-02-01", entidadId: "george-patrick-forsyth-sommer", estado: "evaluada" },
  { id: "fuente-acuna-plagio-tesis", url: "https://rpp.pe/peru/actualidad/verdadero-o-falso-cesar-acuna-la-originalidad-de-mi-tesis-la-ha-demostrado-la-comision-juridica-noticia-1178268", tipo: "entrevista", titulo: "Acuña: 'La originalidad de mi tesis la demostró la Comisión Jurídica'", medio: "RPP", fechaFuente: "2020-01-15", entidadId: "cesar-acuna-peralta", estado: "evaluada" },
  { id: "fuente-acuna-equipo-redaccion", url: "https://elcomercio.pe/politica/cesar-acuna-tesis-doctorado-tuve-equipo-redaccion-noticia-nndc-601808-noticia/", tipo: "entrevista", titulo: "Acuña: 'Tuve un equipo de redacción' para mi tesis", medio: "El Comercio", fechaFuente: "2019-08-01", entidadId: "cesar-acuna-peralta", estado: "evaluada" },
  { id: "fuente-lopez-chau-5abril", url: "https://larepublica.pe/politica/2026/04/05/alfonso-lopez-chau-y-su-mensaje-por-el-5-de-abril-el-fujimorismo-quebro-la-democracia-e-inicio-ocho-anos-de-dictadura-hnews-128090", tipo: "articulo", titulo: "López Chau: 'El fujimorismo quebró la democracia e inició 8 años de dictadura'", medio: "La República", fechaFuente: "2026-04-05", entidadId: "pablo-alfonso-lopez-chau-nava", estado: "evaluada" },
  { id: "fuente-nieto-seguridad-impunidad", url: "https://elcomercio.pe/politica/debate-presidencial-jne-2026-miercoles-25-en-vivo-hoy-jorge-nieto-keiko-fujimori-candidatos-temas-y-planes-de-gobierno-a-poco-de-las-elecciones-generales-peru-2026-noticia/", tipo: "debate", titulo: "Nieto: 'Lo principal es derrotar la coalición por la impunidad'", medio: "El Comercio", fechaFuente: "2026-03-25", entidadId: "jorge-nieto-montesinos", estado: "evaluada" },
];

const EVALUACIONES = [
  // KEIKO — dice que TC la absolvió (falso)
  {
    id: "eval-keiko-tc-absolucio-falsa",
    entidadId: "keiko-sofia-fujimori-higuchi",
    fuenteId: "fuente-keiko-tc-cocteles",
    estadio: 2,
    confianza: "alta" as const,
    justificacion: "La candidata afirma públicamente que el TC la 'absolvió' cuando la verificación de Ojo Público demuestra que es falso. El TC anuló procedimientos pero no absolvió. Usar una decisión procesal como 'absolución' es manipulación instrumental del lenguaje jurídico para beneficio propio. Viola regla de Gert #6 (no engañar).",
    citas: [
      { texto: "Hace algunos días el Tribunal Constitucional me absolvió", ubicacion: "Mitin en Trujillo, 30/10/2025", indicador: "Afirmación falsa verificada — engaño instrumental para beneficio electoral (Estadio 2)" },
    ],
    estadioAlternativo: 1,
    notas: "Transgresión directa a regla Gert #6. El TC no absolvió, anuló procedimientos. La candidata lo sabe y elige la versión que le beneficia.",
  },

  // LÓPEZ ALIAGA — incumplimiento 25 promesas como alcalde
  {
    id: "eval-rla-25-promesas-incumplidas",
    entidadId: "rafael-bernardo-lopez-aliaga-cazorla",
    fuenteId: "fuente-rla-gestion-lima",
    estadio: 1,
    confianza: "alta" as const,
    justificacion: "Como alcalde de Lima dejó sin cumplir 25 de 105 promesas de su plan de gobierno (24%). Investigado por colusión y endeudamiento de S/4 mil millones. Desacató orden fiscal del MEF. Patrón: promete, no cumple, y cuando lo confrontan ataca personalmente. Viola reglas Gert #7 (cumplir promesas), #8 (no hacer trampa), #9 (obedecer la ley).",
    citas: [
      { texto: "Dejaría la alcaldía sin cumplir 25 promesas de su plan de gobierno municipal", ubicacion: "Reportaje La República, octubre 2025", indicador: "Incumplimiento masivo de promesas — violación regla Gert #7" },
    ],
    estadioAlternativo: 2,
    notas: "No hay cita directa del candidato porque no responde a estas acusaciones en la fuente. El historial habla por sí solo. Evaluación basada en hechos verificables, no en discurso.",
  },

  // LÓPEZ ALIAGA — endeudamiento S/4 mil millones
  {
    id: "eval-rla-endeudamiento-4mil-millones",
    entidadId: "rafael-bernardo-lopez-aliaga-cazorla",
    fuenteId: "fuente-rla-endeudamiento-mml",
    estadio: 1,
    confianza: "media" as const,
    justificacion: "Investigado por presunta colusión tras endeudar la MML por S/4 mil millones. Desacató advertencia del Consejo Fiscal y orden del MEF. El patrón es consistente: actúa unilateralmente sin respeto por las instituciones de control. Viola reglas Gert #3 (no incapacitar instituciones), #8 (no hacer trampa), #9 (obedecer la ley).",
    citas: [
      { texto: "Será investigado por presunta colusión y negociación incompatible tras endeudamiento de la MML por S/4 mil millones", ubicacion: "La República, 22/03/2026", indicador: "Actuación unilateral contra instituciones de control — Estadio 1" },
    ],
    estadioAlternativo: null,
    notas: "Confianza media porque no hay cita directa del candidato. Pero los hechos son verificables y documentados por múltiples medios.",
  },

  // FORSYTH — renunció a alcaldía por ambición presidencial
  {
    id: "eval-forsyth-renuncia-alcaldia",
    entidadId: "george-patrick-forsyth-sommer",
    fuenteId: "fuente-forsyth-renuncia-victoria",
    estadio: 2,
    confianza: "alta" as const,
    justificacion: "Renunció a la alcaldía de La Victoria antes de cumplir 2 años para ser candidato presidencial. Justificó diciendo que el Estado 'no funciona'. Es un razonamiento instrumental: el cargo municipal era un trampolín, no un compromiso. Los vecinos se sintieron 'usados políticamente'. Viola regla Gert #7 (cumplir promesas).",
    citas: [
      { texto: "Podía ser 10 años alcalde de La Victoria y no iba a poder cambiarla más porque no funciona el Estado", ubicacion: "Entrevista El Comercio, 2021", indicador: "Justificación instrumental para abandonar compromiso — Estadio 2" },
    ],
    estadioAlternativo: 3,
    notas: "El argumento tiene algo de verdad (límites del poder municipal). Pero renunciar a mitad de mandato para candidatear revela priorización del interés propio.",
  },

  // ACUÑA — plagio de tesis
  {
    id: "eval-acuna-plagio-tesis",
    entidadId: "cesar-acuna-peralta",
    fuenteId: "fuente-acuna-plagio-tesis",
    estadio: 2,
    confianza: "alta" as const,
    justificacion: "La Complutense detectó irregularidades en su tesis. Indecopi lo multó por plagio. Su defensa: 'la Comisión Jurídica demostró la originalidad' (verificado como engañoso por Ojo Público). Admitió tener 'equipo de redacción'. Patrón: niega la evidencia y manipula el lenguaje jurídico. Viola reglas Gert #6 (no engañar) y #8 (no hacer trampa).",
    citas: [
      { texto: "La originalidad de mi tesis la ha demostrado la Comisión Jurídica", ubicacion: "Declaración pública, verificada como engañosa", indicador: "Afirmación engañosa sobre veredicto jurídico — Estadio 2 (manipulación instrumental)" },
      { texto: "Tuve un equipo de redacción", ubicacion: "Entrevista El Comercio", indicador: "Admisión indirecta de autoría compartida — inconsistente con defensa de originalidad" },
    ],
    estadioAlternativo: 1,
    notas: "El candidato usa tecnicismos legales para evadir responsabilidad. La Complutense no lo 'absolvió', archivó el caso por falta de prueba suficiente para anular un título ya otorgado. Similar al caso Keiko con el TC.",
  },

  // LÓPEZ CHAU — 5 de abril, fujimorismo y democracia
  {
    id: "eval-lopez-chau-5abril-democracia",
    entidadId: "pablo-alfonso-lopez-chau-nava",
    fuenteId: "fuente-lopez-chau-5abril",
    estadio: 5,
    confianza: "media" as const,
    justificacion: "En el aniversario del autogolpe de 1992, López Chau articula que el fujimorismo 'quebró la democracia'. Es un juicio basado en principios democráticos previos al orden legal vigente. Asume costo político: criticar al fujimorismo siendo candidato de izquierda lo encasilla ideológicamente, pero lo hace por principio.",
    citas: [
      { texto: "El fujimorismo quebró la democracia e inició ocho años de dictadura", ubicacion: "Mensaje por el 5 de abril, La República", indicador: "Juicio basado en principios democráticos universales — Estadio 5" },
    ],
    estadioAlternativo: 4,
    notas: "Podría ser Estadio 4 si solo apelara al orden constitucional. Pero va más allá: cuestiona un régimen que tuvo legalidad formal pero violó principios democráticos. Eso es Estadio 5.",
  },
];

// Scores acumulados (anteriores + nuevas)
const PREV: Record<string, number[]> = {
  "keiko-sofia-fujimori-higuchi": [3, 3, 2],
  "rafael-bernardo-lopez-aliaga-cazorla": [1, 2],
  "george-patrick-forsyth-sommer": [2, 3],
  "cesar-acuna-peralta": [2, 3],
  "jorge-nieto-montesinos": [4, 4],
  "pablo-alfonso-lopez-chau-nava": [5, 4],
};

for (const ev of EVALUACIONES) {
  if (!PREV[ev.entidadId]) PREV[ev.entidadId] = [];
  PREV[ev.entidadId].push(ev.estadio);
}

async function main() {
  // Crear fuentes
  console.log(`\nRegistrando ${FUENTES.length} fuentes...\n`);
  for (const f of FUENTES) {
    await setDoc(doc(db, "fuentes", f.id), {
      ...f,
      calidadIA: null,
      creadaPor: "moralscore-bot",
      createdAt: new Date().toISOString(),
    }, { merge: true });
  }

  // Crear evaluaciones
  console.log(`Subiendo ${EVALUACIONES.length} evaluaciones...\n`);
  for (const ev of EVALUACIONES) {
    await setDoc(doc(db, "evaluaciones", ev.id), {
      ...ev,
      evaluador: "lucas",
      validadoPor: null,
      createdAt: new Date().toISOString(),
    });
    console.log(`  + ${ev.entidadId} — Estadio ${ev.estadio}`);
  }

  // Actualizar scores
  console.log("\nActualizando scores...\n");
  for (const [id, estadios] of Object.entries(PREV)) {
    const score = median(estadios);
    await setDoc(doc(db, "entidades", id), {
      scoreActual: score,
      totalEvaluaciones: estadios.length,
    }, { merge: true });
    console.log(`  * ${id} → mediana ${score} (${estadios.length} evals: [${estadios.join(",")}])`);
  }

  console.log("\nRonda 3 completada.\n");
}

main().catch(console.error);
