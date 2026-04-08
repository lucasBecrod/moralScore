"use client";

import { useEffect, useState } from "react";
import { getMetricasGlobales } from "@/firebase/queries";
import type { MetricasGlobales } from "@/schemas/metrica.schema";

let cached: MetricasGlobales | null = null;

export function useMetricasGlobales() {
  const [metricas, setMetricas] = useState<MetricasGlobales | null>(cached);
  const [loading, setLoading] = useState(cached === null);

  useEffect(() => {
    if (cached) {
      setMetricas(cached);
      setLoading(false);
      return;
    }
    getMetricasGlobales()
      .then((data) => {
        cached = data;
        setMetricas(data);
      })
      .finally(() => setLoading(false));
  }, []);

  return { metricas, loading };
}
