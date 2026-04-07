"use client";

import { useEffect, useState, useCallback } from "react";
import { getCandidaturas } from "@/firebase/queries";
import type { Candidatura } from "@/schemas/candidatura.schema";

let cachedCandidaturas: Candidatura[] | null = null;
let lastFetchTime = 0;
const STALE_MS = 60_000;

export function useCandidaturas(procesoId?: string) {
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>(cachedCandidaturas || []);
  const [loading, setLoading] = useState(cachedCandidaturas === null);

  const refresh = useCallback(async () => {
    try {
      const data = await getCandidaturas(procesoId);
      cachedCandidaturas = data;
      lastFetchTime = Date.now();
      setCandidaturas(data);
    } finally {
      setLoading(false);
    }
  }, [procesoId]);

  useEffect(() => {
    if (cachedCandidaturas !== null) {
      setCandidaturas(cachedCandidaturas);
      setLoading(false);
      if (Date.now() - lastFetchTime > STALE_MS) refresh();
    } else {
      refresh();
    }
  }, [refresh]);

  return { candidaturas, loading, refresh };
}
