// Carril 1: Redención — candidato colapsado por transgresión Gert
const RETOS_REDENCION: Record<string, string> = {
  "no-enga\u00f1ar":
    "Tu puntaje colaps\u00f3 por ocultar informaci\u00f3n o mentir en documentos oficiales. Para recuperar credibilidad, debes transparentar p\u00fablicamente lo oculto y someterte a las consecuencias legales.",
  "no-hacer-trampa":
    "Tu puntaje colaps\u00f3 por usar el poder para beneficio propio. Para reconstruir confianza, debes renunciar al beneficio obtenido e impulsar leyes que eliminen los vac\u00edos legales que usaste.",
  "no-privar-libertad":
    "Tu puntaje colaps\u00f3 por avalar leyes o acciones que protegen la impunidad. Para salir de este fondo, debes impulsar la derogaci\u00f3n de las normas que blindan a los transgresores.",
  "no-causar-dolor":
    "Tu puntaje colaps\u00f3 porque tu negligencia tuvo consecuencias humanas graves. El \u00fanico camino es proponer reparaci\u00f3n concreta, con plazos y presupuesto auditables.",
  "cumplir-deber":
    "Tu puntaje est\u00e1 limitado por tu incapacidad documentada para ejecutar presupuesto. Menos promesas, m\u00e1s actas: demuestra ejecuci\u00f3n superior al 80% en tu pr\u00f3ximo cargo.",
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
          Ruta de redenci&oacute;n &mdash; transgres&iacute;on: {transgresionDominante}
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
