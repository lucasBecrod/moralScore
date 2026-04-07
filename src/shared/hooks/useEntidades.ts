"use client";

import { useEffect, useState, useCallback } from "react";
import { getEntidades } from "@/firebase/queries";
import type { Entidad } from "@/schemas/entidad.schema";

/**
 * Cache en memoria — persiste entre navegaciones sin refetch.
 * Patrón stale-while-revalidate: muestra datos cacheados al instante,
 * refresca en background si han pasado más de STALE_MS.
 */
let cachedEntidades: Entidad[] | null = null;
let lastFetchTime = 0;
const STALE_MS = 60_000; // 1 minuto

export function useEntidades() {
  const [entidades, setEntidades] = useState<Entidad[]>(cachedEntidades || []);
  const [loading, setLoading] = useState(cachedEntidades === null);

  const refresh = useCallback(async () => {
    try {
      const data = await getEntidades();
      cachedEntidades = data;
      lastFetchTime = Date.now();
      setEntidades(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (cachedEntidades !== null) {
      // Cache hit — mostrar datos al instante
      setEntidades(cachedEntidades);
      setLoading(false);

      // Refrescar en background si están stale
      if (Date.now() - lastFetchTime > STALE_MS) {
        refresh();
      }
    } else {
      // Primera carga
      refresh();
    }
  }, [refresh]);

  return { entidades, loading, refresh };
}
