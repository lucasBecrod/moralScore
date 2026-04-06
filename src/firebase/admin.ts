// Firebase Admin SDK — server-side only
// Requiere: pnpm add firebase-admin
// Env vars: FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let adminDb: any = null;

try {
  const { initializeApp, getApps, cert } = require("firebase-admin/app");
  const { getFirestore } = require("firebase-admin/firestore");

  if (
    process.env.FIREBASE_ADMIN_PROJECT_ID &&
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
    process.env.FIREBASE_ADMIN_PRIVATE_KEY
  ) {
    const app =
      getApps().length === 0
        ? initializeApp({
            credential: cert({
              projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
              clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
              // La private key viene con \n escapados en la env var
              privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
                /\\n/g,
                "\n"
              ),
            }),
          })
        : getApps()[0];

    adminDb = getFirestore(app);
  } else {
    console.warn(
      "Firebase Admin: env vars no configuradas, adminDb será null"
    );
  }
} catch {
  // firebase-admin no instalado — degradación silenciosa
  console.warn(
    "Firebase Admin SDK no disponible. Instalar con: pnpm add firebase-admin"
  );
}

export { adminDb };
