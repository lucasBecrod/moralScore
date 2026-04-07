/**
 * Reconcilia scoreActual y totalEvaluaciones de todas las entidades.
 * Corre este script después de cada oleada de seed o cuando haya divergencia.
 *
 * Uso: npx tsx --env-file=.env.local scripts/reconcile-scores.ts
 */

import { reconcileAll } from "../src/firebase/queries";

async function main() {
  console.log("Reconciliando scores de todas las entidades...");
  const { updated } = await reconcileAll();
  console.log(`Listo. ${updated} entidades actualizadas.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
