/**
 * Ronda 2 de evaluaciones — más fuentes para top 6 candidatos
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

const EVALUACIONES = [
  // === KEIKO FUJIMORI — leyes procrimen ===
  {
    id: "eval-keiko-leyes-procrimen",
    entidadId: "keiko-sofia-fujimori-higuchi",
    fuenteId: "keiko-sofia-fujimori-higuchi-2026-03-31-el-comercio",
    estadio: 3,
    confianza: "alta" as const,
    justificacion: "La candidata niega la narrativa de leyes procrimen aprobadas por su bancada sin articular un principio alternativo. No explica por qué las leyes no son procrimen, solo rechaza la etiqueta. Evita el conflicto central: la responsabilidad legislativa de su partido.",
    citas: [
      { texto: "No creo en esa narrativa de las leyes pro-crimen", ubicacion: "Entrevista El Comercio", indicador: "Rechazo de etiqueta sin argumentación sustantiva — Estadio 3 (evita conflicto)" },
    ],
    estadioAlternativo: 2,
    notas: "Consistente con evaluación anterior (debate 25/03). Patrón: evita responsabilidad del partido.",
  },
  {
    id: "eval-keiko-extorsion-militares",
    entidadId: "keiko-sofia-fujimori-higuchi",
    fuenteId: "keiko-sofia-fujimori-higuchi-2026-03-25-el-comercio",
    estadio: 2,
    confianza: "media" as const,
    justificacion: "Propone combatir extorsión con policías y militares en las calles. La solución es puramente de fuerza sin abordar causas estructurales ni marco institucional. Razonamiento instrumental: más fuerza = menos crimen.",
    citas: [
      { texto: "Enfrentaremos la extorsión con policías y militares en zonas industriales y barridos conjuntos en las zonas más peligrosas", ubicacion: "Foro de candidatos, seguridad", indicador: "Solución de fuerza sin articulación de principio institucional — Estadio 1-2" },
    ],
    estadioAlternativo: 1,
    notas: "Similar a Forsyth en militarización. Pero Keiko al menos menciona una estrategia (zonas industriales), no solo fuerza bruta.",
  },

  // === LÓPEZ ALIAGA — CADE seguridad jurídica ===
  {
    id: "eval-lopez-aliaga-cade-seguridad-juridica",
    entidadId: "rafael-bernardo-lopez-aliaga-cazorla",
    fuenteId: "rafael-bernardo-lopez-aliaga-cazorla-2026-03-23-el-comercio",
    estadio: 2,
    confianza: "alta" as const,
    justificacion: "El candidato divide el mundo en 'gente decente' vs 'delincuentes' y argumenta que la seguridad jurídica solo aplica a los primeros. No reconoce que la seguridad jurídica es un principio universal del Estado de derecho. Ataca personalmente al presidente de Confiep. Razonamiento binario sin matices institucionales.",
    citas: [
      { texto: "La seguridad jurídica es para gente decente, no para delincuentes", ubicacion: "CADE 2025, panel económico", indicador: "División binaria que niega universalidad del derecho — Estadio 2 (instrumental)" },
      { texto: "Nunca voy a pactar nunca con la corrupción", ubicacion: "CADE 2025, respuesta a Confiep", indicador: "Declaración de pureza moral sin mecanismo concreto — Estadio 3 (busca aprobación)" },
      { texto: "a mí no me tiembla la mano", ubicacion: "Sobre expulsión de mineros ilegales del partido", indicador: "Apelación a la fuerza personal — Estadio 1" },
    ],
    estadioAlternativo: 1,
    notas: "Patrón consistente: discurso de fuerza personal, ataques ad hominem, sin articulación institucional. Score 2 por el intento de justificar con concepto de seguridad jurídica aunque lo aplica selectivamente.",
  },

  // === FORSYTH — jurado popular ===
  {
    id: "eval-forsyth-jurado-popular",
    entidadId: "george-patrick-forsyth-sommer",
    fuenteId: "george-patrick-forsyth-sommer-2026-03-24-el-comercio",
    estadio: 3,
    confianza: "media" as const,
    justificacion: "Propone un 'jurado popular' para juzgar corrupción. La idea apela al sentimiento ciudadano de injusticia pero no articula cómo se integra con el sistema judicial existente. Es una propuesta que busca aprobación popular sin resolver el problema institucional de fondo.",
    citas: [
      { texto: "Propone instaurar un jurado popular para juzgar casos de corrupción", ubicacion: "Debate JNE 24/03", indicador: "Propuesta populista que busca aprobación sin articulación institucional — Estadio 3" },
    ],
    estadioAlternativo: 4,
    notas: "Si el jurado popular estuviera articulado con reforma constitucional y garantías procesales, podría ser Estadio 4-5. Pero la propuesta es un eslogan sin sustancia.",
  },

  // === ACUÑA — empleo y educación ===
  {
    id: "eval-acuna-crecimiento-6pct",
    entidadId: "cesar-acuna-peralta",
    fuenteId: "cesar-acuna-peralta-2026-03-23-el-comercio",
    estadio: 2,
    confianza: "alta" as const,
    justificacion: "El candidato promete crecimiento del 6% anual y adjudicación de 80,000 millones de dólares en proyectos. Las promesas son transaccionales: más inversión = más empleo. No articula un principio sobre para qué sirve el crecimiento ni cómo se distribuyen los beneficios. El 'apagón regulatorio' es desregulación sin justificación moral.",
    citas: [
      { texto: "un crecimiento del 3% anual es insuficiente para reducir las brechas sociales y económicas", ubicacion: "Debate JNE, bloque empleo", indicador: "Diagnóstico correcto pero solución puramente cuantitativa — Estadio 2" },
      { texto: "eliminación de más de mil barreras burocráticas mediante un apagón regulatorio", ubicacion: "Debate JNE, bloque empleo", indicador: "Desregulación como fin en sí mismo, sin criterio de qué se protege — Estadio 2" },
      { texto: "adjudicación de 80,000 millones de dólares en proyectos en todas las regiones", ubicacion: "Debate JNE, bloque empleo", indicador: "Promesa transaccional: dinero = solución — Estadio 2" },
    ],
    estadioAlternativo: 3,
    notas: "Acuña es consistentemente transaccional. Sus propuestas son numéricas sin articulación de principios. Estadio 2 claro.",
  },
  {
    id: "eval-acuna-anemia-alimentacion",
    entidadId: "cesar-acuna-peralta",
    fuenteId: "cesar-acuna-peralta-2026-04-01-la-republica",
    estadio: 3,
    confianza: "media" as const,
    justificacion: "Sobre anemia infantil, el candidato articula una cadena causal (agricultura → agua → alimentación → salud → cero anemia). Muestra más elaboración que sus propuestas económicas. Sin embargo, simplifica un problema multifactorial y no reconoce determinantes sociales ni institucionales.",
    citas: [
      { texto: "Lo fundamental para que no haya anemia es la alimentación, por eso vamos a invertir en agricultura. Para que haya agricultura tiene que haber agua", ubicacion: "Debate JNE, pregunta ciudadana", indicador: "Cadena causal simplificada pero con lógica interna — Estadio 3 (convencional)" },
    ],
    estadioAlternativo: 2,
    notas: "Mejor que su discurso económico pero sigue sin articular derechos ni principios. Estadio 3 por el intento de razonamiento causal.",
  },

  // === NIETO — seguridad y coalición ===
  {
    id: "eval-nieto-seguridad-coalicion",
    entidadId: "jorge-nieto-montesinos",
    fuenteId: "jorge-nieto-montesinos-2026-03-25-el-comercio",
    estadio: 4,
    confianza: "alta" as const,
    justificacion: "El candidato articula que la seguridad ciudadana depende de derrotar una 'coalición por la impunidad' — un argumento institucional que identifica el problema como sistémico, no individual. Apela al orden legal y a la derrota de la corrupción como prerrequisito para la seguridad.",
    citas: [
      { texto: "Lo principal para lograr la seguridad ciudadana es la derrota de la coalición por la impunidad", ubicacion: "Debate JNE 25/03, bloque seguridad", indicador: "Análisis sistémico: seguridad = derrotar impunidad institucional — Estadio 4 (ley y orden)" },
    ],
    estadioAlternativo: 5,
    notas: "Podría ser Estadio 5 si articulara que la impunidad viola derechos previos al sistema legal. Pero se queda en Estadio 4: respetar las instituciones y el orden.",
  },

  // === LÓPEZ CHAU — constitución y Estado ===
  {
    id: "eval-lopez-chau-constitucion",
    entidadId: "pablo-alfonso-lopez-chau-nava",
    fuenteId: "pablo-alfonso-lopez-chau-nava-2026-04-01-la-republica",
    estadio: 5,
    confianza: "media" as const,
    justificacion: "El candidato argumenta que se necesita una nueva Constitución, que el Estado está capturado por intereses criminales, y que todas las leyes han favorecido a sectores delincuenciales. Reconoce que el marco legal vigente puede ser injusto y propone reformarlo. Articula la nación como 'sistema de valores compartidos', no como ley impuesta.",
    citas: [
      { texto: "Yo creo que necesitamos una nueva Constitución", ubicacion: "Entrevista Ojo Público", indicador: "Reconoce que el marco legal puede ser injusto y propone reformarlo — Estadio 5" },
      { texto: "El Estado está tomado, infiltrado, capturado, sometido", ubicacion: "Entrevista Ojo Público", indicador: "Diagnóstico sistémico que trasciende el orden legal vigente — Estadio 5" },
      { texto: "Todas las leyes han favorecido a los sectores delincuenciales", ubicacion: "Entrevista Ojo Público", indicador: "Reconocimiento de que la legalidad formal puede ser inmoral — Estadio 5" },
      { texto: "La nación es como un verbo, es un sistema de valores compartidos", ubicacion: "Entrevista Ojo Público", indicador: "Concepción abstracta de la comunidad basada en principios, no en ley — Estadio 5-6" },
    ],
    estadioAlternativo: 4,
    notas: "ALERTA VENTRILOQUISMO: el discurso suena sofisticado. Pero hay congruencia: el candidato ha sido rector, tiene formación académica, y su propuesta de nueva Constitución es coherente con su diagnóstico. Test de costo: proponer nueva Constitución tiene costo político alto (lo asocian con la izquierda radical). Lo asume. Score 5 sostenido.",
  },
  {
    id: "eval-lopez-chau-policia-pip",
    entidadId: "pablo-alfonso-lopez-chau-nava",
    fuenteId: "pablo-alfonso-lopez-chau-nava-2026-04-01-la-republica",
    estadio: 4,
    confianza: "media" as const,
    justificacion: "Propone reorganizar la Policía 'desde arriba hacia abajo' y reinstalar la PIP. Es una propuesta institucional concreta que busca restaurar el orden mediante reforma institucional, no mediante fuerza bruta.",
    citas: [
      { texto: "La primera medida que se debiera tomar es reorganizar a toda la Policía, desde arriba hacia abajo", ubicacion: "Entrevista Ojo Público, seguridad", indicador: "Reforma institucional como solución — Estadio 4" },
      { texto: "Estaríamos proponiendo que se reinstale la honorable Policía de Investigación del Perú", ubicacion: "Entrevista Ojo Público, seguridad", indicador: "Restaurar institución histórica — Estadio 4 (orden y ley)" },
    ],
    estadioAlternativo: 3,
    notas: "Propuesta institucional concreta. Estadio 4 claro.",
  },
];

// Recalcular scores (mediana de evaluaciones)
function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

const SCORES_MAP: Record<string, number[]> = {};
// Incluir evaluaciones previas
SCORES_MAP["keiko-sofia-fujimori-higuchi"] = [3]; // eval anterior
SCORES_MAP["rafael-bernardo-lopez-aliaga-cazorla"] = [1]; // eval anterior
SCORES_MAP["george-patrick-forsyth-sommer"] = [2]; // eval anterior
SCORES_MAP["jorge-nieto-montesinos"] = [4]; // eval anterior

for (const ev of EVALUACIONES) {
  if (!SCORES_MAP[ev.entidadId]) SCORES_MAP[ev.entidadId] = [];
  SCORES_MAP[ev.entidadId].push(ev.estadio);
}

async function main() {
  console.log(`\nSubiendo ${EVALUACIONES.length} evaluaciones...\n`);

  for (const ev of EVALUACIONES) {
    await setDoc(doc(db, "evaluaciones", ev.id), {
      ...ev,
      evaluador: "lucas",
      validadoPor: null,
      createdAt: new Date().toISOString(),
    });
    console.log(`  + ${ev.entidadId} — Estadio ${ev.estadio}`);
  }

  // Actualizar scores (mediana)
  console.log("\nActualizando scores...\n");
  for (const [entidadId, estadios] of Object.entries(SCORES_MAP)) {
    const score = median(estadios);
    const total = estadios.length;
    await setDoc(doc(db, "entidades", entidadId), {
      scoreActual: score,
      totalEvaluaciones: total,
    }, { merge: true });
    console.log(`  * ${entidadId} → mediana ${score} (${total} evals: [${estadios.join(",")}])`);
  }

  console.log("\nListo.\n");
}

main().catch(console.error);
