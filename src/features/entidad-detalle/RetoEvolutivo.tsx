// Carril 1: Contraste material — evidencia fáctica limita el puntaje retórico
const RETOS_REDENCION: Record<string, string> = {
  "no-enga\u00f1ar":
    "El puntaje ret\u00f3rico de este candidato est\u00e1 limitado por evidencia de omisi\u00f3n o falsedad en documentos oficiales. Para que el l\u00edmite se levante, debe transparentar lo oculto y someterse al proceso correspondiente.",
  "no-hacer-trampa":
    "El puntaje ret\u00f3rico de este candidato est\u00e1 limitado por evidencia de conflicto de inter\u00e9s o beneficio propio desde el cargo. Para que el l\u00edmite se levante, debe renunciar al beneficio obtenido e impulsar la correcci\u00f3n normativa.",
  "no-privar-libertad":
    "El puntaje ret\u00f3rico de este candidato est\u00e1 limitado por evidencia de respaldo a normas que protegen la impunidad. Para que el l\u00edmite se levante, debe impulsar la derogaci\u00f3n de esas normas.",
  "no-causar-dolor":
    "El puntaje ret\u00f3rico de este candidato est\u00e1 limitado por evidencia de negligencia con consecuencias humanas documentadas. Para que el l\u00edmite se levante, debe proponer reparaci\u00f3n concreta con plazos y presupuesto auditables.",
  "cumplir-deber":
    "El puntaje ret\u00f3rico de este candidato est\u00e1 limitado por evidencia de baja ejecuci\u00f3n presupuestal en gestiones previas. Para que el l\u00edmite se levante, debe demostrar ejecuci\u00f3n superior al 80% con indicadores p\u00fablicos.",
};

// Carril 2: Evolutivo vertical — sin transgresión, empuje N+1
const RETOS_EVOLUTIVOS: Record<number, { reto: string; siguiente: string }> = {
  1: {
    reto: "Este perfil opera bajo la ley del m\u00e1s fuerte. Para evolucionar, debe demostrar que puede negociar acuerdos sin apelar a la amenaza o la represi\u00f3n.",
    siguiente: "Intercambio instrumental",
  },
  2: {
    reto: "Este perfil ve la pol\u00edtica como intercambio de favores. Para evolucionar, debe proponer pol\u00edticas que beneficien a grupos fuera de su red de clientelaje.",
    siguiente: "Expectativas interpersonales",
  },
  3: {
    reto: "Este perfil dice lo que la tribuna quiere escuchar. Para evolucionar, debe asumir el costo pol\u00edtico de defender el orden institucional aunque pierda votos.",
    siguiente: "Ley y orden social",
  },
  4: {
    reto: "Este perfil defiende la ley de forma r\u00edgida. Para evolucionar, debe proponer la reforma de una ley injusta bas\u00e1ndose en derechos fundamentales, sin romper el sistema.",
    siguiente: "Contrato social",
  },
  5: {
    reto: "Este perfil articula principios superiores. El reto final es la coherencia absoluta: sacrificar su carrera antes que traicionar la dignidad humana.",
    siguiente: "Principios \u00e9ticos universales",
  },
};

interface RetoEvolutivoProps {
  score: number;
  transgresionDominante: string | null;
}

export function RetoEvolutivo({ score, transgresionDominante }: RetoEvolutivoProps) {
  const estadio = Math.round(score);
  if (estadio >= 6) return null;

  // Carril 1: Redención
  if (transgresionDominante && RETOS_REDENCION[transgresionDominante]) {
    return (
      <div className="mb-6 rounded-lg border border-red-900/50 bg-red-950/20 px-4 py-3">
        <p className="text-xs font-medium text-red-400">
          L&iacute;mite material activo &mdash; {transgresionDominante}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-zinc-400">
          {RETOS_REDENCION[transgresionDominante]}
        </p>
      </div>
    );
  }

  // Carril 2: Evolutivo
  const reto = RETOS_EVOLUTIVOS[estadio];
  if (!reto) return null;

  return (
    <div className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
      <p className="text-xs font-medium text-zinc-500">
        Reto p&uacute;blico &rarr; Estadio {estadio + 1}: {reto.siguiente}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-zinc-400">
        {reto.reto}
      </p>
    </div>
  );
}
