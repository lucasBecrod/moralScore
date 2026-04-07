/**
 * Sube imágenes de candidatos y partidos a Firebase Storage.
 * Idempotente: solo sube si el archivo no existe en Storage.
 *
 * Detección automática de entorno:
 *   - Si FIRESTORE_EMULATOR_HOST existe → emulador
 *   - Si no → producción (usa credenciales Admin SDK de .env.local)
 *
 * Uso:
 *   npx tsx --env-file=.env.local scripts/upload-images-to-storage.ts
 */

import { initializeApp, applicationDefault, cert, getApps } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join, extname } from "path";

// --- Detección de entorno ---
const isEmulator = Boolean(
  process.env.FIRESTORE_EMULATOR_HOST ||
  process.env.FIREBASE_STORAGE_EMULATOR_HOST
);

const STORAGE_BUCKET = "moral-score.firebasestorage.app";

if (getApps().length === 0) {
  if (isEmulator) {
    // Emulador: no necesita credenciales
    if (!process.env.FIREBASE_STORAGE_EMULATOR_HOST) {
      process.env.FIREBASE_STORAGE_EMULATOR_HOST = "127.0.0.1:9199";
    }
    initializeApp({
      projectId: "moral-score",
      storageBucket: STORAGE_BUCKET,
    });
    console.log("🔌 Emulador de Storage detectado\n");
  } else {
    // Producción: intenta ADC (firebase login) primero, luego service account
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || "moral-score";
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (clientEmail && privateKey) {
      initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
        storageBucket: STORAGE_BUCKET,
      });
      console.log("🌐 Producción (service account)\n");
    } else {
      initializeApp({
        credential: applicationDefault(),
        storageBucket: STORAGE_BUCKET,
      });
      console.log("🌐 Producción (firebase CLI credentials)\n");
    }
  }
}

const bucket = getStorage().bucket();

// --- Helpers ---
const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

async function uploadDir(localDir: string, storagePath: string) {
  if (!existsSync(localDir)) {
    console.log(`   ⚠️  No existe: ${localDir}`);
    return { uploaded: 0, skipped: 0 };
  }

  const files = readdirSync(localDir);
  let uploaded = 0;
  let skipped = 0;

  for (const file of files) {
    const ext = extname(file).toLowerCase();
    if (!MIME_TYPES[ext]) continue;

    const destination = `${storagePath}/${file}`;
    const storageFile = bucket.file(destination);

    const [exists] = await storageFile.exists();
    if (exists) {
      skipped++;
      continue;
    }

    const localPath = join(localDir, file);
    const content = readFileSync(localPath);

    await storageFile.save(content, {
      metadata: {
        contentType: MIME_TYPES[ext],
        cacheControl: "public, max-age=31536000",
      },
    });

    await storageFile.makePublic();
    uploaded++;
  }

  return { uploaded, skipped };
}

// --- Main ---
async function main() {
  const imgBase = join(process.cwd(), "public", "img");

  console.log("👤 Candidatos...");
  const entidades = await uploadDir(join(imgBase, "entidades"), "img/entidades");
  console.log(`   ${entidades.uploaded} subidas, ${entidades.skipped} ya existían`);

  console.log("🏛️  Partidos...");
  const partidos = await uploadDir(join(imgBase, "partidos"), "img/partidos");
  console.log(`   ${partidos.uploaded} subidas, ${partidos.skipped} ya existían`);

  const total = entidades.uploaded + partidos.uploaded;
  console.log(`\n✅ ${total} imágenes subidas a Storage.\n`);
}

main().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
