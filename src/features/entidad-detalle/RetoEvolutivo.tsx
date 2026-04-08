const RETOS: Record<number, { reto: string; siguiente: string }> = {
  1: {
    reto: "Este candidato opera bajo la ley del m\u00e1s fuerte. Para subir al Estadio 2, debe demostrar capacidad de negociar sin recurrir a amenazas o castigos.",
    siguiente: "Intercambio instrumental",
  },
  2: {
    reto: "Este candidato opera por c\u00e1lculo transaccional puro. Para subir al Estadio 3, debe demostrar capacidad de proponer soluciones de consenso que no impliquen intercambio de favores.",
    siguiente: "Expectativas interpersonales",
  },
  3: {
    reto: "Este candidato dice lo que la tribuna quiere escuchar. Para subir al Estadio 4, debe asumir el costo pol\u00edtico de defender el orden institucional frente a una masa enfurecida.",
    siguiente: "Ley y orden social",
  },
  4: {
    reto: "Este candidato defiende la ley de forma r\u00edgida. Para subir al Estadio 5, debe proponer la reforma de una ley injusta bas\u00e1ndose en derechos fundamentales, sin romper el orden democr\u00e1tico.",
    siguiente: "Contrato social",
  },
  5: {
    reto: "Este candidato defiende derechos universales. Para alcanzar el Estadio 6, debe demostrar coherencia absoluta entre principios y acci\u00f3n, incluso sacrificando su carrera pol\u00edtica.",
    siguiente: "Principios \u00e9ticos universales",
  },
};

interface RetoEvolutivoProps {
  score: number;
}

export function RetoEvolutivo({ score }: RetoEvolutivoProps) {
  const estadio = Math.round(score);
  const reto = RETOS[estadio];
  if (!reto || estadio >= 6) return null;

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
