import FuenteCard from "./FuenteCard";

interface Cita {
  texto: string;
  ubicacion: string;
  indicador: string;
}

interface Evaluacion {
  id: string;
  estadio: number;
  confianza: "alta" | "media" | "baja";
  justificacion: string;
  citas: Cita[];
  validacionesCiudadanas?: number;
  fuente: {
    titulo: string;
    url?: string;
    medio?: string;
    fechaFuente?: string;
    imagen?: string;
  };
}

interface HistorialEvaluacionesProps {
  evaluaciones: Evaluacion[];
  onFuenteExpanded?: () => void;
  onRequestAuth?: () => void;
}

export default function HistorialEvaluaciones({ evaluaciones, onFuenteExpanded, onRequestAuth }: HistorialEvaluacionesProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-zinc-100 mb-4">
        Evaluaciones ({evaluaciones.length})
      </h2>
      {evaluaciones.length === 0 ? (
        <p className="text-sm text-zinc-400">
          A&uacute;n no hay evaluaciones para este candidato.
        </p>
      ) : (
        <div className="space-y-3">
          {evaluaciones.map((ev) => (
            <FuenteCard
              key={ev.id}
              evaluacionId={ev.id}
              estadio={ev.estadio}
              titulo={ev.fuente.titulo}
              url={ev.fuente.url}
              medio={ev.fuente.medio}
              fechaFuente={ev.fuente.fechaFuente}
              confianza={ev.confianza}
              justificacion={ev.justificacion}
              citas={ev.citas}
              imagen={ev.fuente.imagen}
              validacionesCiudadanas={ev.validacionesCiudadanas}
              onExpand={onFuenteExpanded}
              onRequestAuth={onRequestAuth}
            />
          ))}
        </div>
      )}
    </section>
  );
}
