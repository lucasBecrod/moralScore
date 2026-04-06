/**
 * Seed de fuentes del Debate Presidencial JNE 2026
 * Idempotente: usa slug como ID del documento.
 *
 * Uso: NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true npx tsx scripts/seed-fuentes-debate-jne.ts
 */

import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, setDoc, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "demo",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "moral-score",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true" || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  try {
    connectFirestoreEmulator(db, "localhost", 8080);
    console.log("Conectado al emulador Firestore");
  } catch {}
}

interface Fuente {
  url: string;
  tipo: "debate" | "entrevista" | "articulo" | "conferencia";
  titulo: string;
  medio: string;
  fechaFuente: string;
  entidadId: string;
  estado: "pendiente" | "aprobada";
  calidadIA: null;
  creadaPor: "moralscore-bot" | "lucas";
  createdAt: string;
}

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 80)
    .trim();
}

const FUENTES: Omit<Fuente, "calidadIA" | "creadaPor" | "createdAt">[] = [
  // === KEIKO FUJIMORI ===
  {
    url: "https://elcomercio.pe/politica/debate-presidencial-jne-2026-miercoles-25-keiko-fujimori-en-vivo-hoy-mario-vizcarra-jorge-nieto-candidatos-temas-y-planes-de-gobierno-a-poco-de-las-elecciones-generales-peru-2026-noticia/",
    tipo: "debate",
    titulo: "Debate JNE 25/03 — Fujimori vs Nieto vs Vizcarra",
    medio: "El Comercio",
    fechaFuente: "2026-03-25",
    entidadId: "keiko-sofia-fujimori-higuchi",
    estado: "aprobada",
  },
  {
    url: "https://elcomercio.pe/politica/elecciones/rafael-lopez-aliaga-keiko-fujimori-y-marisol-perez-tello-se-lanzan-pullas-durante-el-debate-presidencial-del-jne-elecciones-2026-noticia/",
    tipo: "debate",
    titulo: "Debate JNE 31/03 — Fujimori vs López Aliaga vs Pérez Tello",
    medio: "El Comercio",
    fechaFuente: "2026-03-31",
    entidadId: "keiko-sofia-fujimori-higuchi",
    estado: "aprobada",
  },
  {
    url: "https://larepublica.pe/politica/2026/03/25/keiko-fujimori-se-lava-las-manos-las-leyes-son-papeles-el-fujimorismo-no-ha-gobernado-ni-yo-tampoco-hnews-325025",
    tipo: "debate",
    titulo: '"Las leyes son papeles, el fujimorismo no ha gobernado"',
    medio: "La República",
    fechaFuente: "2026-03-25",
    entidadId: "keiko-sofia-fujimori-higuchi",
    estado: "aprobada",
  },
  {
    url: "https://rpp.pe/politica/elecciones/debate-presidencial-2026-cruces-entre-keiko-fujimori-mesias-guevara-y-roberto-sanchez-noticia-1682458",
    tipo: "debate",
    titulo: "Cruces entre Fujimori, Guevara y Sánchez",
    medio: "RPP",
    fechaFuente: "2026-03-31",
    entidadId: "keiko-sofia-fujimori-higuchi",
    estado: "aprobada",
  },

  // === RAFAEL LÓPEZ ALIAGA ===
  {
    url: "https://elcomercio.pe/politica/debate-presidencial-jne-2026-lunes-23-rafael-lopez-aliaga-en-vivo-hoy-candidato-ternas-propuestas-y-planes-de-gobierno-a-poco-de-las-elecciones-generales-peru-2026-video-noticia/",
    tipo: "debate",
    titulo: "Debate JNE 23/03 — López Aliaga primera fecha",
    medio: "El Comercio",
    fechaFuente: "2026-03-23",
    entidadId: "rafael-bernardo-lopez-aliaga-cazorla",
    estado: "aprobada",
  },
  {
    url: "https://elcomercio.pe/politica/rafael-lopez-aliaga-participa-en-debate-presidencial-2026-martes-31-incidentes-temas-pullas-y-planes-de-gobierno-previo-a-las-elecciones-generales-peru-2026-video-noticia/",
    tipo: "debate",
    titulo: "Debate JNE 31/03 — López Aliaga propone 6 ministerios",
    medio: "El Comercio",
    fechaFuente: "2026-03-31",
    entidadId: "rafael-bernardo-lopez-aliaga-cazorla",
    estado: "aprobada",
  },
  {
    url: "https://larepublica.pe/politica/2026/04/01/rafael-lopez-aliaga-lanza-amenaza-contra-jefe-de-la-onpe-si-me-hacen-eso-a-mi-voy-a-ver-las-oficinas-y-no-se-si-quede-vivo-elecciones-2026-hnews-42829",
    tipo: "entrevista",
    titulo: "López Aliaga amenaza contra jefe de la ONPE",
    medio: "La República",
    fechaFuente: "2026-04-01",
    entidadId: "rafael-bernardo-lopez-aliaga-cazorla",
    estado: "aprobada",
  },

  // === GEORGE FORSYTH ===
  {
    url: "https://elcomercio.pe/politica/george-forsyth-en-debate-presidencial-2026-lunes-30-incidentes-temas-pullas-y-planes-de-gobierno-previo-a-las-elecciones-generales-peru-2026-video-noticia/",
    tipo: "debate",
    titulo: "Debate JNE 30/03 — Forsyth sobre educación e infraestructura",
    medio: "El Comercio",
    fechaFuente: "2026-03-30",
    entidadId: "george-patrick-forsyth-sommer",
    estado: "aprobada",
  },
  {
    url: "https://elcomercio.pe/politica/debate-presidencial-jne-2026-martes-24-en-vivo-hoy-george-forsyth-fechas-candidatos-temas-y-planes-de-gobierno-a-poco-de-las-elecciones-generales-peru-2026-noticia/",
    tipo: "debate",
    titulo: 'Forsyth propone "jurado popular" anticorrupción',
    medio: "El Comercio",
    fechaFuente: "2026-03-24",
    entidadId: "george-patrick-forsyth-sommer",
    estado: "aprobada",
  },
  {
    url: "https://rpp.pe/politica/elecciones/george-forsyth-asegura-que-desde-el-primer-dia-tomara-el-control-de-los-penales-con-los-militares-noticia-1681570",
    tipo: "debate",
    titulo: "Forsyth: control militar de penales desde el primer día",
    medio: "RPP",
    fechaFuente: "2026-03-23",
    entidadId: "george-patrick-forsyth-sommer",
    estado: "aprobada",
  },

  // === CÉSAR ACUÑA ===
  {
    url: "https://elcomercio.pe/politica/debate-presidencial-jne-2026-lunes-23-cesar-acuna-en-vivo-hoy-candidato-de-app-propuestas-ternas-y-planes-de-gobierno-a-poco-de-las-elecciones-generales-peru-2026-noticia/",
    tipo: "debate",
    titulo: "Debate JNE 23/03 — Acuña primera fecha",
    medio: "El Comercio",
    fechaFuente: "2026-03-23",
    entidadId: "cesar-acuna-peralta",
    estado: "aprobada",
  },
  {
    url: "https://larepublica.pe/politica/2026/04/01/debate-presidencial-2026-en-vivo-alfonso-lopezchau-cesar-acuna-y-jorge-nieto-se-enfrentan-hnews-2453464",
    tipo: "debate",
    titulo: "Debate JNE 01/04 — Acuña vs López Chau vs Nieto (última jornada)",
    medio: "La República",
    fechaFuente: "2026-04-01",
    entidadId: "cesar-acuna-peralta",
    estado: "aprobada",
  },

  // === JORGE NIETO ===
  {
    url: "https://elcomercio.pe/politica/debate-presidencial-jne-2026-miercoles-25-keiko-fujimori-en-vivo-hoy-mario-vizcarra-jorge-nieto-candidatos-temas-y-planes-de-gobierno-a-poco-de-las-elecciones-generales-peru-2026-noticia/",
    tipo: "debate",
    titulo: "Debate JNE 25/03 — Nieto vs Fujimori vs Vizcarra",
    medio: "El Comercio",
    fechaFuente: "2026-03-25",
    entidadId: "jorge-nieto-montesinos",
    estado: "aprobada",
  },
  {
    url: "https://larepublica.pe/politica/2026/04/01/debate-presidencial-2026-en-vivo-alfonso-lopezchau-cesar-acuna-y-jorge-nieto-se-enfrentan-hnews-2453464",
    tipo: "debate",
    titulo: "Debate JNE 01/04 — Nieto vs Acuña vs López Chau",
    medio: "La República",
    fechaFuente: "2026-04-01",
    entidadId: "jorge-nieto-montesinos",
    estado: "aprobada",
  },

  // === ALFONSO LÓPEZ CHAU ===
  {
    url: "https://larepublica.pe/politica/2026/04/01/debate-presidencial-2026-en-vivo-alfonso-lopezchau-cesar-acuna-y-jorge-nieto-se-enfrentan-hnews-2453464",
    tipo: "debate",
    titulo: "Debate JNE 01/04 — López Chau vs Acuña vs Nieto",
    medio: "La República",
    fechaFuente: "2026-04-01",
    entidadId: "pablo-alfonso-lopez-chau-nava",
    estado: "aprobada",
  },
];

async function seed() {
  console.log(`\nSeeding ${FUENTES.length} fuentes del debate JNE...\n`);

  for (const f of FUENTES) {
    const id = toSlug(`${f.entidadId}-${f.fechaFuente}-${f.medio}`);
    const ref = doc(db, "fuentes", id);

    await setDoc(ref, {
      ...f,
      calidadIA: null,
      creadaPor: "moralscore-bot",
      createdAt: new Date().toISOString(),
    }, { merge: true });

    console.log(`  + ${f.entidadId} — ${f.titulo}`);
  }

  console.log(`\n${FUENTES.length} fuentes procesadas\n`);
}

seed().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
