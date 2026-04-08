"use client";

import { useEffect, useState } from "react";
import type { MetricasGlobales } from "@/schemas/metrica.schema";

let cached: MetricasGlobales | null = null;

async function fetchMetricas(): Promise<MetricasGlobales | null> {
  const res = await fetch("/api/metricas.json");
  if (!res.ok) return null;
  return res.json();
}

export function useMetricasGlobales() {
  const [metricas, setMetricas] = useState<MetricasGlobales | null>(cached);
  const [loading, setLoading] = useState(cached === null);

  useEffect(() => {
    if (cached) {
      setMetricas(cached);
      setLoading(false);
      return;
    }
    fetchMetricas()
      .then((data) => {
        cached = data;
        setMetricas(data);
      })
      .finally(() => setLoading(false));
  }, []);

  return { metricas, loading };
}
