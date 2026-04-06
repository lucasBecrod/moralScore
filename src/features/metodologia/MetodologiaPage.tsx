import { EscalaKohlberg } from "./EscalaKohlberg";

export function MetodologiaPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-serif text-3xl font-bold tracking-tight">
        Metodología: Escala de Desarrollo Moral de Kohlberg
      </h1>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
        MoralScore evalúa el razonamiento moral de candidatos políticos
        peruanos utilizando la escala de desarrollo moral de Lawrence
        Kohlberg, adaptada al discurso político contemporáneo.
      </p>

      {/* Escala de 6 estadios */}
      <section className="mt-12">
        <h2 className="font-serif text-2xl font-semibold">
          Los 6 estadios del razonamiento moral
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Kohlberg identificó seis estadios agrupados en tres niveles.
          Cada estadio representa una forma cualitativamente distinta de
          justificar decisiones morales.
        </p>
        <div className="mt-6">
          <EscalaKohlberg />
        </div>
      </section>

      {/* Protocolo de evaluación */}
      <section className="mt-12">
        <h2 className="font-serif text-2xl font-semibold">
          Protocolo de evaluación
        </h2>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium">Qué se evalúa</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Se evalúa la <strong>justificación</strong> que da el
              candidato, no su posición política. Dos candidatos pueden
              defender la misma política pero uno razonar en estadio 2
              (transaccional) y otro en estadio 5 (contrato social). La
              unidad de análisis es una intervención: una respuesta
              argumentada ante un tema o dilema.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium">Muestra mínima</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Se requieren al menos 5 intervenciones por candidato (ideal:
              10). El score final es la mediana de los estadios asignados a
              sus intervenciones individuales.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium">Fuentes válidas</h3>
            <ul className="mt-1 list-inside list-disc text-sm text-gray-600 dark:text-gray-400">
              <li>Entrevistas en medios de comunicación</li>
              <li>Debates electorales</li>
              <li>Conferencias de prensa</li>
              <li>Declaraciones ante comisiones del Congreso</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium">Fuentes NO válidas</h3>
            <ul className="mt-1 list-inside list-disc text-sm text-gray-600 dark:text-gray-400">
              <li>Discursos preparados sin interacción</li>
              <li>Spots publicitarios</li>
              <li>Comunicados de prensa redactados por equipos</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium">Validación humana</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Doble codificación independiente (dos evaluadores). Se exige
              una concordancia inter-evaluador (kappa de Cohen) igual o
              superior a 0.70 antes de publicar cualquier score.
            </p>
          </div>
        </div>
      </section>

      {/* Consideraciones éticas */}
      <section className="mt-12">
        <h2 className="font-serif text-2xl font-semibold">
          Consideraciones éticas
        </h2>
        <div className="mt-6 space-y-4">
          <Consideration title="Transparencia total">
            La metodología, la rúbrica de evaluación y el system prompt
            utilizado por la IA son públicos y están disponibles en el
            repositorio del proyecto.
          </Consideration>
          <Consideration title="Sin sesgo partidario">
            Se evalúa la estructura del razonamiento moral, no la posición
            política. No se penaliza ni premia ninguna ideología.
          </Consideration>
          <Consideration title="Verificabilidad">
            Todo score publicado incluye las fuentes originales que el
            usuario puede auditar de forma independiente.
          </Consideration>
          <Consideration title="Limitaciones declaradas">
            MoralScore mide el razonamiento moral público observable, no la
            moralidad interna de las personas evaluadas.
          </Consideration>
          <Consideration title="Derecho de réplica">
            Los candidatos evaluados pueden enviar material adicional para
            que sea considerado en futuras evaluaciones.
          </Consideration>
          <Consideration title="Revisión humana obligatoria">
            Ningún score se publica sin la validación de al menos dos
            evaluadores humanos.
          </Consideration>
        </div>
      </section>
    </div>
  );
}

function Consideration({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <h3 className="font-medium">{title}</h3>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        {children}
      </p>
    </div>
  );
}
