/**
 * Descarga fotos de candidatos y logos de partidos a public/img/
 * Idempotente: solo descarga si el archivo no existe o tiene 0 bytes.
 *
 * Uso: npx tsx scripts/cache-images.ts
 */

import { writeFileSync, existsSync, mkdirSync, statSync } from "fs";

const CANDIDATOS_DIR = "public/img/entidades";
const PARTIDOS_DIR = "public/img/partidos";

// Datos extraídos del seed
const IMAGES: { nombre: string; foto: string; logoPartido: string; slug: string; partidoId: string }[] = [
  { nombre: "Pablo Alfonso López Chau Nava", slug: "pablo-alfonso-lopez-chau-nava", foto: "https://mpesije.jne.gob.pe/apidocs/ddfa74eb-cae3-401c-a34c-35543ae83c57.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2980.jpg", partidoId: "2980" },
  { nombre: "Ronald Darwin Atencio Sotomayor", slug: "ronald-darwin-atencio-sotomayor", foto: "https://mpesije.jne.gob.pe/apidocs/bac0288d-3b21-45ac-8849-39f9177fb020.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/3025.jpg", partidoId: "3025" },
  { nombre: "César Acuña Peralta", slug: "cesar-acuna-peralta", foto: "https://mpesije.jne.gob.pe/apidocs/d6fe3cac-7061-474b-8551-0aa686a54bad.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/1257.jpg", partidoId: "1257" },
  { nombre: "José Daniel Williams Zapata", slug: "jose-daniel-williams-zapata", foto: "https://mpesije.jne.gob.pe/apidocs/b60c471f-a6bb-4b42-a4b2-02ea38acbb0d.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2173.jpg", partidoId: "2173" },
  { nombre: "Álvaro Gonzalo Paz de la Barra Freigeiro", slug: "alvaro-gonzalo-paz-de-la-barra-freigeiro", foto: "https://votoinformado.jne.gob.pe/assets/images/candidatos/ALVARO%20PAZ%20DE%20LA%20BARRA.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2898.jpg", partidoId: "2898" },
  { nombre: "Keiko Sofía Fujimori Higuchi", slug: "keiko-sofia-fujimori-higuchi", foto: "https://mpesije.jne.gob.pe/apidocs/251cd1c0-acc7-4338-bd8a-439ccb9238d0.jpeg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/1366.jpg", partidoId: "1366" },
  { nombre: "Fiorella Giannina Molinelli Aristondo", slug: "fiorella-giannina-molinelli-aristondo", foto: "https://mpesije.jne.gob.pe/apidocs/1de656b5-7593-4c60-ab7a-83d618a3d80d.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/3024.jpg", partidoId: "3024" },
  { nombre: "Roberto Helbert Sánchez Palomino", slug: "roberto-helbert-sanchez-palomino", foto: "https://mpesije.jne.gob.pe/apidocs/bb7c7465-9c6e-44eb-ac7d-e6cc7f872a1a.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/1264.jpg", partidoId: "1264" },
  { nombre: "Rafael Jorge Belaúnde Llosa", slug: "rafael-jorge-belaunde-llosa", foto: "https://mpesije.jne.gob.pe/apidocs/3302e45b-55c8-4979-a60b-2b11097abf1d.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2933.jpg", partidoId: "2933" },
  { nombre: "Pitter Enrique Valderrama Peña", slug: "pitter-enrique-valderrama-pena", foto: "https://mpesije.jne.gob.pe/apidocs/d72c4b29-e173-42b8-b40d-bdb6d01a526a.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2930.jpg", partidoId: "2930" },
  { nombre: "Ricardo Pablo Belmont Cassinelli", slug: "ricardo-pablo-belmont-cassinelli", foto: "https://mpesije.jne.gob.pe/apidocs/78647f15-d5d1-4ed6-8ac6-d599e83eeea3.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2941.jpg", partidoId: "2941" },
  { nombre: "Jorge Nieto Montesinos", slug: "jorge-nieto-montesinos", foto: "https://mpesije.jne.gob.pe/apidocs/9ae56ed5-3d0f-49ff-8bb9-0390bad71816.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2961.jpg", partidoId: "2961" },
  { nombre: "Charlie Carrasco Salazar", slug: "charlie-carrasco-salazar", foto: "https://mpesije.jne.gob.pe/apidocs/12fa17db-f28f-4330-9123-88549539b538.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2867.jpg", partidoId: "2867" },
  { nombre: "Alex Gonzales Castillo", slug: "alex-gonzales-castillo", foto: "https://mpesije.jne.gob.pe/apidocs/c0ae56bf-21c1-4810-890a-b25c8465bdd9.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2895.jpg", partidoId: "2895" },
  { nombre: "Armando Joaquín Massé Fernández", slug: "armando-joaquin-masse-fernandez", foto: "https://mpesije.jne.gob.pe/apidocs/cb1adeb7-7d2f-430c-ae87-519137d8edfa.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2986.jpg", partidoId: "2986" },
  { nombre: "George Patrick Forsyth Sommer", slug: "george-patrick-forsyth-sommer", foto: "https://mpesije.jne.gob.pe/apidocs/b1d60238-c797-4cba-936e-f13de6a34cc7.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/14.jpg", partidoId: "14" },
  { nombre: "Luis Fernando Olivera Vega", slug: "luis-fernando-olivera-vega", foto: "https://mpesije.jne.gob.pe/apidocs/3e2312e1-af79-4954-abfa-a36669c1a9e9.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2857.jpg", partidoId: "2857" },
  { nombre: "Mesías Antonio Guevara Amasifuén", slug: "mesias-antonio-guevara-amasifuen", foto: "https://mpesije.jne.gob.pe/apidocs/1b861ca7-3a5e-48b4-9024-08a92371e33b.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2840.jpg", partidoId: "2840" },
  { nombre: "Carlos Gonzalo Álvarez Loayza", slug: "carlos-gonzalo-alvarez-loayza", foto: "https://mpesije.jne.gob.pe/apidocs/2bd18177-d665-413d-9694-747d729d3e39.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2956.jpg", partidoId: "2956" },
  { nombre: "Herbert Caller Gutiérrez", slug: "herbert-caller-gutierrez", foto: "https://mpesije.jne.gob.pe/apidocs/6ad6c5ff-0411-4ddd-9cf7-b0623f373fcf.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2869.jpg", partidoId: "2869" },
  { nombre: "Yonhy Lescano Ancieta", slug: "yonhy-lescano-ancieta", foto: "https://mpesije.jne.gob.pe/apidocs/b9db2b5c-02ff-4265-ae51-db9b1001ad70.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2995.jpg", partidoId: "2995" },
  { nombre: "Wolfgang Mario Grozo Costa", slug: "wolfgang-mario-grozo-costa", foto: "https://mpesije.jne.gob.pe/apidocs/064360d1-ce49-4abe-939c-f4de8b0130a2.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2985.jpg", partidoId: "2985" },
  { nombre: "Vladimir Roy Cerrón Rojas", slug: "vladimir-roy-cerron-rojas", foto: "https://mpesije.jne.gob.pe/apidocs/82ee0ff2-2336-4aba-9590-e576f7564315.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2218.jpg", partidoId: "2218" },
  { nombre: "Francisco Ernesto Diez-Canseco Távara", slug: "francisco-ernesto-diez-canseco-tavara", foto: "https://mpesije.jne.gob.pe/apidocs/2d1bf7f2-6e88-4ea9-8ed2-975c1ae5fb92.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2932.jpg", partidoId: "2932" },
  { nombre: "Mario Enrique Vizcarra Cornejo", slug: "mario-enrique-vizcarra-cornejo", foto: "https://mpesije.jne.gob.pe/apidocs/ee7a080e-bc81-4c81-9e5e-9fd95ff459ab.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2925.jpg", partidoId: "2925" },
  { nombre: "Walter Gilmer Chirinos Purizaga", slug: "walter-gilmer-chirinos-purizaga", foto: "https://mpesije.jne.gob.pe/apidocs/a2d0f631-fe47-4c41-92ba-7ed9f4095520.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2921.jpg", partidoId: "2921" },
  { nombre: "Alfonso Carlos Espá y Garcés-Alvear", slug: "alfonso-carlos-espa-y-garces-alvear", foto: "https://mpesije.jne.gob.pe/apidocs/85935f77-6c46-4eab-8c7e-2494ffbcece0.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2935.jpg", partidoId: "2935" },
  { nombre: "Carlos Ernesto Jaico Carranza", slug: "carlos-ernesto-jaico-carranza", foto: "https://mpesije.jne.gob.pe/apidocs/7d91e14f-4417-4d61-89ba-3e686dafaa95.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2924.jpg", partidoId: "2924" },
  { nombre: "José León Luna Gálvez", slug: "jose-leon-luna-galvez", foto: "https://mpesije.jne.gob.pe/apidocs/a669a883-bf8a-417c-9296-c14b943c3943.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2731.jpg", partidoId: "2731" },
  { nombre: "María Soledad Pérez Tello de Rodríguez", slug: "maria-soledad-perez-tello-de-rodriguez", foto: "https://mpesije.jne.gob.pe/apidocs/073703ca-c427-44f0-94b1-a782223a5e10.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2931.jpg", partidoId: "2931" },
  { nombre: "Paul Davis Jaimes Blanco", slug: "paul-davis-jaimes-blanco", foto: "https://mpesije.jne.gob.pe/apidocs/929e1a63-335d-4f3a-ba26-f3c7ff136213.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2967.jpg", partidoId: "2967" },
  { nombre: "Rafael Bernardo López Aliaga Cazorla", slug: "rafael-bernardo-lopez-aliaga-cazorla", foto: "https://mpesije.jne.gob.pe/apidocs/b2e00ae2-1e50-4ad3-a103-71fc7e4e8255.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/22.jpg", partidoId: "22" },
  { nombre: "Antonio Ortiz Villano", slug: "antonio-ortiz-villano", foto: "https://mpesije.jne.gob.pe/apidocs/8e6b9124-2883-4143-8768-105f2ce780eb.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2927.jpg", partidoId: "2927" },
  { nombre: "Rosario del Pilar Fernández Bazán", slug: "rosario-del-pilar-fernandez-bazan", foto: "https://mpesije.jne.gob.pe/apidocs/ac0b0a59-ead5-4ef1-8ef8-8967e322d6ca.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/2998.jpg", partidoId: "2998" },
  { nombre: "Roberto Enrique Chiabra León", slug: "roberto-enrique-chiabra-leon", foto: "https://mpesije.jne.gob.pe/apidocs/5c703ce9-ba1e-4490-90bf-61006740166f.jpg", logoPartido: "https://votoinformado.jne.gob.pe/LogoOp/3023.jpg", partidoId: "3023" },
];

async function downloadIfMissing(url: string, path: string): Promise<boolean> {
  if (existsSync(path)) {
    const stat = statSync(path);
    if (stat.size > 0) return false; // ya existe
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.log(`  ⚠ ${res.status} ${url}`);
      return false;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    writeFileSync(path, buffer);
    return true;
  } catch (err) {
    console.log(`  ✗ Error: ${url} — ${err}`);
    return false;
  }
}

async function main() {
  mkdirSync(CANDIDATOS_DIR, { recursive: true });
  mkdirSync(PARTIDOS_DIR, { recursive: true });

  let downloaded = 0;
  let skipped = 0;

  console.log("\n📸 Descargando fotos de candidatos...\n");
  for (const c of IMAGES) {
    const ext = c.foto.endsWith(".jpeg") ? "jpeg" : "jpg";
    const path = `${CANDIDATOS_DIR}/${c.slug}.${ext}`;
    const isNew = await downloadIfMissing(c.foto, path);
    if (isNew) {
      console.log(`  ✓ ${c.slug}.${ext}`);
      downloaded++;
    } else {
      skipped++;
    }
  }

  console.log("\n🏛️ Descargando logos de partidos...\n");
  const seenPartidos = new Set<string>();
  for (const c of IMAGES) {
    if (seenPartidos.has(c.partidoId)) continue;
    seenPartidos.add(c.partidoId);
    const path = `${PARTIDOS_DIR}/${c.partidoId}.jpg`;
    const isNew = await downloadIfMissing(c.logoPartido, path);
    if (isNew) {
      console.log(`  ✓ partido-${c.partidoId}.jpg`);
      downloaded++;
    } else {
      skipped++;
    }
  }

  console.log(`\n✅ ${downloaded} descargadas, ${skipped} ya existían\n`);
}

main().catch(console.error);
