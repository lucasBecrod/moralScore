import { doc, setDoc, increment } from "firebase/firestore";
import { db } from "@/firebase/client";

type MetricField = "shares_wa" | "shares_tw" | "shares_fb" | "shares_copy" | "validaciones_dadas" | "validaciones_quitadas" | "fuentes_subidas";

function todayDocId(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `diaria-${yyyy}${mm}${dd}`;
}

export function trackMetric(field: MetricField): void {
  try {
    const ref = doc(db, "metricas", todayDocId());
    setDoc(ref, { [field]: increment(1) }, { merge: true });
  } catch {
    // Fire-and-forget
  }
}
