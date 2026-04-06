/**
 * Batch de evaluaciones — candidatos top del debate JNE 2026
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

interface Evaluacion {
  id: string;
  entidadId: string;
  fuenteId: string;
  estadio: number;
  confianza: "alta" | "media" | "baja";
  justificacion: string;
  citas: { texto: string; ubicacion: string; indicador: string }[];
  estadioAlternativo: number | null;
  notas: string;
  evaluador: "lucas";
  validadoPor: null;
}

const EVALUACIONES: Evaluacion[] = [
  // === LÓPEZ ALIAGA — Amenaza ONPE ===
  {
    id: "eval-lopez-aliaga-amenaza-onpe",
    entidadId: "rafael-bernardo-lopez-aliaga-cazorla",
    fuenteId: "rafael-bernardo-lopez-aliaga-cazorla-2026-04-01-la-republica",
    estadio: 1,
    confianza: "alta",
    justificacion: "El candidato justifica su posición mediante amenaza directa y apelación a la fuerza. No articula un principio legal ni institucional — su razonamiento es puramente de poder y consecuencias físicas. La frase 'no sé si quede vivo' es una amenaza velada que opera en la lógica de castigo/obediencia.",
    citas: [
      {
        texto: "Si me hacen eso a mí, voy a ver las oficinas y no sé si quede vivo",
        ubicacion: "Entrevista post-debate, sobre ONPE",
        indicador: "Amenaza velada basada en consecuencias físicas — Estadio 1 (castigo/obediencia)",
      },
      {
        texto: "este es un sinvergüenza. No confío",
        ubicacion: "Sobre el jefe de la ONPE Corvetto",
        indicador: "Ataque personal sin argumentación institucional — Estadio 1",
      },
      {
        texto: "ya nos han robado una elección, ya han llevado al Perú al carajo",
        ubicacion: "Sobre elecciones 2021",
        indicador: "Narrativa de agravio sin propuesta de reforma institucional — entre Estadio 1 y 2",
      },
    ],
    estadioAlternativo: 2,
    notas: "El candidato tiene 90 mil personeros (Estadio 4 sería respetar el proceso). Pero su justificación no es institucional sino de fuerza y desconfianza personal.",
    evaluador: "lucas",
    validadoPor: null,
  },

  // === FORSYTH — Control militar de penales ===
  {
    id: "eval-forsyth-penales-militares",
    entidadId: "george-patrick-forsyth-sommer",
    fuenteId: "george-patrick-forsyth-sommer-2026-03-23-rpp",
    estadio: 2,
    confianza: "media",
    justificacion: "El candidato apela a la empatía emocional ('no me van a contar lo que sufren las madres') para justificar una acción de fuerza (militares en penales). La justificación combina Estadio 3 (busca aprobación emocional) con Estadio 1 (solución punitiva). No articula por qué la militarización resuelve el problema estructural ni qué marco legal lo soporta.",
    citas: [
      {
        texto: "A mí no me van a contar lo que sufren las madres, a mí no me van a contar lo que sufren los transportistas que hoy pagan cupos",
        ubicacion: "Debate JNE, bloque seguridad",
        indicador: "Apelación emocional para justificar acción de fuerza — Estadio 3 (busca aprobación)",
      },
      {
        texto: "voy a tomar control de forma inmediata con las fuerzas armadas de las cárceles",
        ubicacion: "Debate JNE, bloque seguridad",
        indicador: "Solución punitiva sin marco institucional — Estadio 1-2",
      },
      {
        texto: "un delincuente no persigue a un delincuente",
        ubicacion: "Debate JNE, sobre policía",
        indicador: "Descalificación institucional de la policía sin propuesta de reforma — Estadio 2",
      },
    ],
    estadioAlternativo: 3,
    notas: "El discurso mezcla empatía genuina con soluciones autoritarias. La congruencia es baja: dice entender el sufrimiento pero propone fuerza militar sin articular por qué eso soluciona el problema de fondo.",
    evaluador: "lucas",
    validadoPor: null,
  },

  // === NIETO — Última jornada ===
  {
    id: "eval-nieto-coalicion-mal",
    entidadId: "jorge-nieto-montesinos",
    fuenteId: "jorge-nieto-montesinos-2026-04-01-la-republica",
    estadio: 4,
    confianza: "media",
    justificacion: "El candidato apela al orden institucional y al rechazo de la corrupción como transgresión del sistema. Su lenguaje es institucionalista ('coalición de mal y corrupta' implica que hay un orden que fue violado). Sin embargo, la evidencia es limitada — solo dos citas disponibles, una de las cuales es una disculpa por llegar tarde.",
    citas: [
      {
        texto: "¿Vamos a seguir gobernados por una coalición de mal y corrupta?",
        ubicacion: "Mensaje final del debate",
        indicador: "Apelación al orden institucional violado por la corrupción — Estadio 4",
      },
      {
        texto: "Quisiera tomar unos segundos para pedir perdón por mi tardanza",
        ubicacion: "Inicio del debate",
        indicador: "Reconocimiento de falta y disculpa pública — coherente con Estadio 4 (respeto a reglas)",
      },
    ],
    estadioAlternativo: 3,
    notas: "Evidencia insuficiente para una evaluación robusta. Solo dos citas de un debate completo. Se necesitan más fuentes. La confianza es media por falta de material, no por ambigüedad en el razonamiento.",
    evaluador: "lucas",
    validadoPor: null,
  },
];

// Score por entidad: { entidadId: estadio }
const SCORES: Record<string, { score: number; total: number }> = {
  "rafael-bernardo-lopez-aliaga-cazorla": { score: 1, total: 1 },
  "george-patrick-forsyth-sommer": { score: 2, total: 1 },
  "jorge-nieto-montesinos": { score: 4, total: 1 },
};

async function main() {
  console.log(`\nSubiendo ${EVALUACIONES.length} evaluaciones...\n`);

  for (const ev of EVALUACIONES) {
    await setDoc(doc(db, "evaluaciones", ev.id), {
      ...ev,
      createdAt: new Date().toISOString(),
    });
    console.log(`  + ${ev.entidadId} — Estadio ${ev.estadio}`);

    // Marcar fuente como evaluada
    await setDoc(doc(db, "fuentes", ev.fuenteId), { estado: "evaluada" }, { merge: true });
  }

  // Actualizar scores
  for (const [entidadId, { score, total }] of Object.entries(SCORES)) {
    await setDoc(doc(db, "entidades", entidadId), {
      scoreActual: score,
      totalEvaluaciones: total,
    }, { merge: true });
    console.log(`  * ${entidadId} → score ${score}`);
  }

  console.log(`\nListo. ${EVALUACIONES.length} evaluaciones + ${Object.keys(SCORES).length} scores actualizados.\n`);
}

main().catch(console.error);
