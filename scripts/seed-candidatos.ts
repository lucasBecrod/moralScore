/**
 * Seed de candidatos presidenciales — Elecciones 2026
 *
 * Idempotente: usa el slug como document ID.
 * Si el doc ya existe, lo actualiza (merge). No crea duplicados.
 *
 * Uso:
 *   npx tsx scripts/seed-candidatos.ts
 *
 * Requiere: emulador Firestore corriendo en localhost:8080
 *           o credenciales de producción en .env.local
 */

import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, setDoc, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "demo",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "moral-score",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// Conectar al emulador si está disponible
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true" || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  try {
    connectFirestoreEmulator(db, "localhost", 8080);
    console.log("🔌 Conectado al emulador Firestore (localhost:8080)");
  } catch {
    // Ya conectado
  }
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quitar acentos
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

interface Candidato {
  nombre: string;
  partido: string;
  foto: string;
  logoPartido: string;
}

// Fotos: https://mpesije.jne.gob.pe/apidocs/{uuid}.jpg
// Logos: https://votoinformado.jne.gob.pe/LogoOp/{id}.jpg
const CANDIDATOS: Candidato[] = [
  { nombre: "Pablo Alfonso López Chau Nava", partido: "Ahora Nación - AN", foto: "https://mpesije.jne.gob.pe/apidocs/ddfa74eb-cae3-401c-a34c-35543ae83c57.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2980.jpg" },
  { nombre: "Ronald Darwin Atencio Sotomayor", partido: "Alianza Electoral Venceremos", foto: "https://mpesije.jne.gob.pe/apidocs/bac0288d-3b21-45ac-8849-39f9177fb020.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/3025.jpg" },
  { nombre: "César Acuña Peralta", partido: "Alianza para el Progreso", foto: "https://mpesije.jne.gob.pe/apidocs/d6fe3cac-7061-474b-8551-0aa686a54bad.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/1257.jpg" },
  { nombre: "José Daniel Williams Zapata", partido: "Avanza País", foto: "https://mpesije.jne.gob.pe/apidocs/b60c471f-a6bb-4b42-a4b2-02ea38acbb0d.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2173.jpg" },
  { nombre: "Álvaro Gonzalo Paz de la Barra Freigeiro", partido: "Fe en el Perú", foto: "https://votoinformado.jne.gob.pe/assets/images/candidatos/ALVARO%20PAZ%20DE%20LA%20BARRA.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2898.jpg" },
  { nombre: "Keiko Sofía Fujimori Higuchi", partido: "Fuerza Popular", foto: "https://mpesije.jne.gob.pe/apidocs/251cd1c0-acc7-4338-bd8a-439ccb9238d0.jpeg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/1366.jpg" },
  { nombre: "Fiorella Giannina Molinelli Aristondo", partido: "Fuerza y Libertad", foto: "https://mpesije.jne.gob.pe/apidocs/1de656b5-7593-4c60-ab7a-83d618a3d80d.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/3024.jpg" },
  { nombre: "Roberto Helbert Sánchez Palomino", partido: "Juntos por el Perú", foto: "https://mpesije.jne.gob.pe/apidocs/bb7c7465-9c6e-44eb-ac7d-e6cc7f872a1a.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/1264.jpg" },
  { nombre: "Rafael Jorge Belaúnde Llosa", partido: "Libertad Popular", foto: "https://mpesije.jne.gob.pe/apidocs/3302e45b-55c8-4979-a60b-2b11097abf1d.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2933.jpg" },
  { nombre: "Pitter Enrique Valderrama Peña", partido: "Partido Aprista Peruano", foto: "https://mpesije.jne.gob.pe/apidocs/d72c4b29-e173-42b8-b40d-bdb6d01a526a.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2930.jpg" },
  { nombre: "Ricardo Pablo Belmont Cassinelli", partido: "Partido Cívico Obras", foto: "https://mpesije.jne.gob.pe/apidocs/78647f15-d5d1-4ed6-8ac6-d599e83eeea3.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2941.jpg" },
  { nombre: "Jorge Nieto Montesinos", partido: "Partido del Buen Gobierno", foto: "https://mpesije.jne.gob.pe/apidocs/9ae56ed5-3d0f-49ff-8bb9-0390bad71816.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2961.jpg" },
  { nombre: "Charlie Carrasco Salazar", partido: "Partido Demócrata Unido Perú", foto: "https://mpesije.jne.gob.pe/apidocs/12fa17db-f28f-4330-9123-88549539b538.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2867.jpg" },
  { nombre: "Alex Gonzales Castillo", partido: "Partido Demócrata Verde", foto: "https://mpesije.jne.gob.pe/apidocs/c0ae56bf-21c1-4810-890a-b25c8465bdd9.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2895.jpg" },
  { nombre: "Armando Joaquín Massé Fernández", partido: "Partido Democrático Federal", foto: "https://mpesije.jne.gob.pe/apidocs/cb1adeb7-7d2f-430c-ae87-519137d8edfa.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2986.jpg" },
  { nombre: "George Patrick Forsyth Sommer", partido: "Partido Democrático Somos Perú", foto: "https://mpesije.jne.gob.pe/apidocs/b1d60238-c797-4cba-936e-f13de6a34cc7.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/14.jpg" },
  { nombre: "Luis Fernando Olivera Vega", partido: "Partido Frente de la Esperanza 2021", foto: "https://mpesije.jne.gob.pe/apidocs/3e2312e1-af79-4954-abfa-a36669c1a9e9.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2857.jpg" },
  { nombre: "Mesías Antonio Guevara Amasifuén", partido: "Partido Morado", foto: "https://mpesije.jne.gob.pe/apidocs/1b861ca7-3a5e-48b4-9024-08a92371e33b.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2840.jpg" },
  { nombre: "Carlos Gonzalo Álvarez Loayza", partido: "Partido País para Todos", foto: "https://mpesije.jne.gob.pe/apidocs/2bd18177-d665-413d-9694-747d729d3e39.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2956.jpg" },
  { nombre: "Herbert Caller Gutiérrez", partido: "Partido Patriótico del Perú", foto: "https://mpesije.jne.gob.pe/apidocs/6ad6c5ff-0411-4ddd-9cf7-b0623f373fcf.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2869.jpg" },
  { nombre: "Yonhy Lescano Ancieta", partido: "Partido Político Cooperación Popular", foto: "https://mpesije.jne.gob.pe/apidocs/b9db2b5c-02ff-4265-ae51-db9b1001ad70.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2995.jpg" },
  { nombre: "Wolfgang Mario Grozo Costa", partido: "Partido Político Integridad Democrática", foto: "https://mpesije.jne.gob.pe/apidocs/064360d1-ce49-4abe-939c-f4de8b0130a2.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2985.jpg" },
  { nombre: "Vladimir Roy Cerrón Rojas", partido: "Partido Político Nacional Perú Libre", foto: "https://mpesije.jne.gob.pe/apidocs/82ee0ff2-2336-4aba-9590-e576f7564315.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2218.jpg" },
  { nombre: "Francisco Ernesto Diez-Canseco Távara", partido: "Partido Político Perú Acción", foto: "https://mpesije.jne.gob.pe/apidocs/2d1bf7f2-6e88-4ea9-8ed2-975c1ae5fb92.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2932.jpg" },
  { nombre: "Mario Enrique Vizcarra Cornejo", partido: "Partido Político Perú Primero", foto: "https://mpesije.jne.gob.pe/apidocs/ee7a080e-bc81-4c81-9e5e-9fd95ff459ab.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2925.jpg" },
  { nombre: "Walter Gilmer Chirinos Purizaga", partido: "Partido Político PRIN", foto: "https://mpesije.jne.gob.pe/apidocs/a2d0f631-fe47-4c41-92ba-7ed9f4095520.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2921.jpg" },
  { nombre: "Alfonso Carlos Espá y Garcés-Alvear", partido: "Partido Sicreo", foto: "https://mpesije.jne.gob.pe/apidocs/85935f77-6c46-4eab-8c7e-2494ffbcece0.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2935.jpg" },
  { nombre: "Carlos Ernesto Jaico Carranza", partido: "Perú Moderno", foto: "https://mpesije.jne.gob.pe/apidocs/7d91e14f-4417-4d61-89ba-3e686dafaa95.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2924.jpg" },
  { nombre: "José León Luna Gálvez", partido: "Podemos Perú", foto: "https://mpesije.jne.gob.pe/apidocs/a669a883-bf8a-417c-9296-c14b943c3943.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2731.jpg" },
  { nombre: "María Soledad Pérez Tello de Rodríguez", partido: "Primero la Gente", foto: "https://mpesije.jne.gob.pe/apidocs/073703ca-c427-44f0-94b1-a782223a5e10.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2931.jpg" },
  { nombre: "Paul Davis Jaimes Blanco", partido: "Progresemos", foto: "https://mpesije.jne.gob.pe/apidocs/929e1a63-335d-4f3a-ba26-f3c7ff136213.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2967.jpg" },
  { nombre: "Rafael Bernardo López Aliaga Cazorla", partido: "Renovación Popular", foto: "https://mpesije.jne.gob.pe/apidocs/b2e00ae2-1e50-4ad3-a103-71fc7e4e8255.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/22.jpg" },
  { nombre: "Antonio Ortiz Villano", partido: "Salvemos al Perú", foto: "https://mpesije.jne.gob.pe/apidocs/8e6b9124-2883-4143-8768-105f2ce780eb.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2927.jpg" },
  { nombre: "Rosario del Pilar Fernández Bazán", partido: "Un Camino Diferente", foto: "https://mpesije.jne.gob.pe/apidocs/ac0b0a59-ead5-4ef1-8ef8-8967e322d6ca.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2998.jpg" },
  { nombre: "Roberto Enrique Chiabra León", partido: "Unidad Nacional", foto: "https://mpesije.jne.gob.pe/apidocs/5c703ce9-ba1e-4490-90bf-61006740166f.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/3023.jpg" },
];

async function seed() {
  console.log(`\n📋 Seeding ${CANDIDATOS.length} candidatos presidenciales...\n`);

  let created = 0;
  let updated = 0;

  for (const c of CANDIDATOS) {
    const id = toSlug(c.nombre);
    const ref = doc(db, "entidades", id);

    // Usar rutas locales si las imágenes fueron cacheadas
    const ext = c.foto.endsWith(".jpeg") ? "jpeg" : "jpg";
    const fotoLocal = `/img/entidades/${id}.${ext}`;
    const logoLocal = c.logoPartido ? `/img/partidos/${c.logoPartido.split("/").pop()?.replace(".jpg", "")}.jpg` : "";

    await setDoc(ref, {
      nombre: c.nombre,
      foto: fotoLocal,
      fotoOriginal: c.foto, // conservar URL original por si se necesita
      tipo: "persona",
      rol: "presidente",
      partido: c.partido,
      logoPartido: logoLocal || "",
      logoPartidoOriginal: c.logoPartido, // conservar URL original
      scoreActual: null,
      totalEvaluaciones: 0,
    }, { merge: true });

    console.log(`  ✓ ${id} — ${c.nombre} (${c.partido})`);
    created++;
  }

  console.log(`\n✅ ${created} candidatos procesados (merge: sin duplicados)\n`);
}

seed().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
