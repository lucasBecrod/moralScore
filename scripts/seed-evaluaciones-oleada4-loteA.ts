/**
 * Oleada 4, Lote A — Cuarta evaluacion por candidato (10 candidatos)
 * Fuentes DIFERENTES a oleadas 1, 2 y 3. Temas NO cubiertos previamente.
 *
 * Temas evitados por candidato:
 * 1. Atencio: NO mineros, NO educacion/impuestos, NO seguridad/comando
 * 2. Williams: NO guerra, NO educacion rural, NO formalizacion laboral
 * 3. Paz de la Barra: NO debido proceso, NO subvencion, NO referendum/excepcion
 * 4. Molinelli: NO confronta Sanchez, NO docentes, NO salud/centros
 * 5. Sanchez Palomino: NO constitucion, NO universidades, NO cadena perpetua/FFAA
 * 6. Belaunde: NO becas/canon, NO Corte IDH, NO Congreso/crimen
 * 7. Valderrama: NO cadena perpetua, NO salud mental, NO Reactiva/economia
 * 8. Belmont: NO educacion emotivo, NO propuestas vagas, NO jueces/voto popular
 * 9. Carrasco: NO biblico, NO servicio militar, NO fronteras vivas/empleo
 * 10. Gonzales: NO increpa Lopez Aliaga, NO fusion ministerios, NO tercerizacion
 */
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, setDoc, collection, getDocs, connectFirestoreEmulator } from "firebase/firestore";

const app = getApps().length === 0
  ? initializeApp({ apiKey: "demo", projectId: "moral-score" })
  : getApps()[0];
const db = getFirestore(app);
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true" || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  try { connectFirestoreEmulator(db, "localhost", 8080); } catch {}
}

function median(arr: number[]): number {
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  if (s.length % 2 !== 0) return s[m];
  return Number(((s[m - 1] + s[m]) / 2).toFixed(2));
}

const FUENTES = [
  // 1. Atencio — medio ambiente: licencia social y proteccion hidrica (NO mineros, NO educacion, NO seguridad)
  { id: "f-oleada4-ronald-darwin-atencio-sotomayor", url: "https://caretas.pe/politica/elecciones-2026-ronald-atencio-condiciona-actividad-minera-a-licencia-social-y-proteccion-hidrica", tipo: "articulo", titulo: "Atencio condiciona actividad minera a licencia social y proteccion hidrica", medio: "Caretas", fechaFuente: "2026-03-20", entidadId: "ronald-darwin-atencio-sotomayor", estado: "evaluada" },

  // 2. Williams — salud: telemedicina y bonos para medicos rurales (NO guerra, NO educacion rural, NO formalizacion)
  { id: "f-oleada4-jose-daniel-williams-zapata", url: "https://diariocorreo.pe/politica/jose-williams-plantea-modernizar-salud-con-telemedicina-y-bonos-para-medicos-debate-presidencial-jne-noticia/", tipo: "debate", titulo: "Williams: modernizar salud con telemedicina y bonos para medicos", medio: "Correo", fechaFuente: "2026-04-01", entidadId: "jose-daniel-williams-zapata", estado: "evaluada" },

  // 3. Paz de la Barra — salud: descentralizar y desconcentrar servicios (NO debido proceso, NO subvencion, NO referendum)
  { id: "f-oleada4-alvaro-gonzalo-paz-de-la-barra-freigeiro", url: "https://diariocorreo.pe/politica/paz-de-la-barra-sobre-crisis-en-salud-hay-que-descentralizar-y-desconcentrar-en-lima-absolutamente-todo-noticia/", tipo: "debate", titulo: "Paz de la Barra: descentralizar y desconcentrar en Lima absolutamente todo", medio: "Correo", fechaFuente: "2026-03-30", entidadId: "alvaro-gonzalo-paz-de-la-barra-freigeiro", estado: "evaluada" },

  // 4. Molinelli — economia: destrabe de inversiones y empleo formal (NO confronta Sanchez, NO docentes, NO salud)
  { id: "f-oleada4-fiorella-giannina-molinelli-aristondo", url: "https://caretas.pe/politica/molinelli-destrabe-inversiones-empleo-formal-peru/", tipo: "entrevista", titulo: "Molinelli: destrabe de inversiones y empleo formal", medio: "Caretas", fechaFuente: "2026-03-25", entidadId: "fiorella-giannina-molinelli-aristondo", estado: "evaluada" },

  // 5. Sanchez Palomino — agricultura: apoyo a agricultura y ganaderia en Puno (NO constitucion, NO universidades, NO cadena perpetua)
  { id: "f-oleada4-roberto-helbert-sanchez-palomino", url: "https://andina.pe/agencia/noticia-elecciones-2026-roberto-sanchez-ofrece-puno-apoyo-a-agricultura-y-ganaderia-1066037.aspx", tipo: "entrevista", titulo: "Sanchez ofrece en Puno apoyo a agricultura y ganaderia", medio: "Andina", fechaFuente: "2026-04-03", entidadId: "roberto-helbert-sanchez-palomino", estado: "evaluada" },

  // 6. Belaunde — economia: impulso a inversiones e infraestructura para empleo (NO becas, NO Corte IDH, NO Congreso)
  { id: "f-oleada4-rafael-jorge-belaunde-llosa", url: "https://andina.pe/agencia/noticia-elecciones-2026belaunde-propone-impulso-a-inversiones-e-infraestructura-para-crear-empleo-1067268.aspx", tipo: "entrevista", titulo: "Belaunde: impulso a inversiones e infraestructura para crear empleo", medio: "Andina", fechaFuente: "2026-04-02", entidadId: "rafael-jorge-belaunde-llosa", estado: "evaluada" },

  // 7. Valderrama — educacion: creditos agrarios e inversion en educacion (NO cadena perpetua, NO salud mental, NO Reactiva)
  { id: "f-oleada4-pitter-enrique-valderrama-pena", url: "https://andina.pe/agencia/noticia-elecciones-2026-enrique-valderrama-plantea-creditos-agrarios-e-inversion-educacion-1066503.aspx", tipo: "entrevista", titulo: "Valderrama: creditos agrarios e inversion en educacion", medio: "Andina", fechaFuente: "2026-03-28", entidadId: "pitter-enrique-valderrama-pena", estado: "evaluada" },

  // 8. Belmont — economia: inversion privada y apoyo a Mypes (NO educacion emotivo, NO propuestas vagas, NO jueces)
  { id: "f-oleada4-ricardo-pablo-belmont-cassinelli", url: "https://diariocorreo.pe/politica/debate-presidencial-belaunde-y-belmont-destacan-inversion-privada-y-apoyo-a-mypes-noticia/", tipo: "debate", titulo: "Belmont destaca inversion privada y apoyo a Mypes", medio: "Correo", fechaFuente: "2026-04-01", entidadId: "ricardo-pablo-belmont-cassinelli", estado: "evaluada" },

  // 9. Carrasco — salud: brecha sanitaria requiere decision y voluntad politica (NO biblico, NO servicio militar, NO empleo)
  { id: "f-oleada4-charlie-carrasco-salazar", url: "https://diariocorreo.pe/politica/charlie-carrasco-asegura-que-para-solucionar-la-brecha-sanitaria-se-necesita-decision-y-voluntad-politica-noticia/", tipo: "debate", titulo: "Carrasco: brecha sanitaria requiere decision y voluntad politica", medio: "Correo", fechaFuente: "2026-03-30", entidadId: "charlie-carrasco-salazar", estado: "evaluada" },

  // 10. Gonzales — educacion: aumentar presupuesto universidades publicas (NO increpa Lopez Aliaga, NO fusion ministerios, NO tercerizacion)
  { id: "f-oleada4-alex-gonzales-castillo", url: "https://diariocorreo.pe/politica/debate-presidencial-2026-alex-gonzales-propone-aumentar-presupuesto-a-universidades-publicas-noticia/", tipo: "debate", titulo: "Gonzales: aumentar presupuesto a universidades publicas", medio: "Correo", fechaFuente: "2026-03-30", entidadId: "alex-gonzales-castillo", estado: "evaluada" },
];

const EVALUACIONES = [
  // 1. Ronald Darwin Atencio Sotomayor — medio ambiente/licencia social
  // Oleadas previas: 2, 2, 1
  { id: "eval-oleada4-ronald-darwin-atencio-sotomayor", entidadId: "ronald-darwin-atencio-sotomayor", fuenteId: "f-oleada4-ronald-darwin-atencio-sotomayor", estadio: 2, confianza: "media" as const,
    justificacion: "Condiciona mineria a licencia social y proteccion hidrica. El agua como derecho suena a estadio 4-5 pero el framing es instrumental: comunidades tienen poder de veto, no principio universal de proteccion ambiental. La licencia social opera como transaccion comunidad-empresa, no como derecho institucionalizado.",
    citas: [{ texto: "El agua no debe ser un privilegio sino un derecho. La actividad minera solo se realizara en zonas establecidas con licencia social de las comunidades", ubicacion: "Articulo Caretas, propuestas ambientales", indicador: "Transaccional: licencia social como poder de veto comunitario, no como marco institucional de derechos — Estadio 2" }],
    estadioAlternativo: 3, notas: "Tema nuevo (medio ambiente). El discurso de derechos hidricos podria ser estadio 3 si se interpreta como apelacion a dignidad comunitaria. Pero anti-ventriloquismo: decir 'derecho' no basta si el mecanismo es transaccional." },

  // 2. Jose Daniel Williams Zapata — salud/telemedicina
  // Oleadas previas: 1, 3, 2
  { id: "eval-oleada4-jose-daniel-williams-zapata", entidadId: "jose-daniel-williams-zapata", fuenteId: "f-oleada4-jose-daniel-williams-zapata", estadio: 3, confianza: "media" as const,
    justificacion: "Propone modernizar salud con telemedicina, historias clinicas digitales e incentivos a medicos rurales. La propuesta es mas articulada que en oleadas previas: reconoce que medicos no quieren ir a zonas alejadas y ofrece bonos. Pero sigue siendo debate con logica de lista de promesas sin marco de derecho a la salud como principio.",
    citas: [{ texto: "Implementaremos telemedicina y bonos para incentivar a medicos a trabajar en zonas alejadas, mejorando la infraestructura a cuatro niveles de atencion", ubicacion: "Debate JNE ultima fecha, bloque salud, Correo", indicador: "Propuesta articulada con incentivos pero sin principio de derecho universal a la salud — Estadio 3" }],
    estadioAlternativo: 4, notas: "Tema nuevo (salud). Sube de 2 a 3: en salud Williams articula mejor que en economia. El CENS (Consejo Estrategico Nacional de Salud) podria ser estadio 4 pero falta desarrollo." },

  // 3. Alvaro Gonzalo Paz de la Barra Freigeiro — salud/descentralizacion
  // Oleadas previas: 1, 2, 1
  { id: "eval-oleada4-alvaro-gonzalo-paz-de-la-barra-freigeiro", entidadId: "alvaro-gonzalo-paz-de-la-barra-freigeiro", fuenteId: "f-oleada4-alvaro-gonzalo-paz-de-la-barra-freigeiro", estadio: 2, confianza: "media" as const,
    justificacion: "Diagnostica correctamente la concentracion de servicios de salud en Lima. Pero la solucion es grandilocuente: 'desconcentrar absolutamente todo'. No articula como, ni con que recursos, ni que marco institucional garantiza la descentralizacion. Es eslogan, no plan.",
    citas: [{ texto: "Hay que descentralizar y desconcentrar en Lima absolutamente todo. Tenemos que incentivar a los medicos del Serum a trabajar en regiones", ubicacion: "Debate JNE cuarta fecha, bloque salud, Correo", indicador: "Diagnostico correcto + solucion eslogan sin plan institucional — Estadio 2 transaccional" }],
    estadioAlternativo: 3, notas: "Tema nuevo (salud). Se mantiene en estadio 1-2: patron de diagnosticos correctos con soluciones grandilocuentes sin sustento." },

  // 4. Fiorella Giannina Molinelli Aristondo — economia/inversiones
  // Oleadas previas: 3, 4, 4
  { id: "eval-oleada4-fiorella-giannina-molinelli-aristondo", entidadId: "fiorella-giannina-molinelli-aristondo", fuenteId: "f-oleada4-fiorella-giannina-molinelli-aristondo", estadio: 4, confianza: "media" as const,
    justificacion: "Propone destrabar US$30 mil millones en inversiones, reducir informalidad de 71% a 58%, y generar un millon de empleos juveniles con incentivos tributarios y formacion dual. Articula propuestas con datos y mecanismos institucionales. Frase clave: 'el Estado debe ensenar a pescar, no solo entregar pescado' — critica al asistencialismo desde principio de autonomia.",
    citas: [{ texto: "El Estado debe ensenar a pescar y no solo entregar pescado. Necesitamos un Estado participativo que promueva empleo formal en todas las regiones", ubicacion: "Entrevista Caretas / Debate JNE bloque empleo, Correo", indicador: "Critica al asistencialismo con principio de autonomia. Marco institucional con datos — Estadio 4" }],
    estadioAlternativo: 3, notas: "Tema nuevo (economia/empleo). Se mantiene en estadio 4: consistente con oleadas 2 y 3. La critica al asistencialismo es principio articulado." },

  // 5. Roberto Helbert Sanchez Palomino — agricultura/Puno
  // Oleadas previas: 3, 2, 2
  { id: "eval-oleada4-roberto-helbert-sanchez-palomino", entidadId: "roberto-helbert-sanchez-palomino", fuenteId: "f-oleada4-roberto-helbert-sanchez-palomino", estadio: 2, confianza: "media" as const,
    justificacion: "Ofrece apoyo a agricultura y ganaderia con segunda reforma agraria, tecnificacion y seguridad hidrica. Pero es mitin en Puno: promesas electorales dirigidas a audiencia local. No articula marco institucional ni principios de politica agraria. Continuidad de agenda Castillo sin diferenciacion propia.",
    citas: [{ texto: "Vamos a impulsar la segunda reforma agraria para tecnificar e industrializar el campo, con asistencia tecnica y financiamiento a la micro y pequena agricultura familiar", ubicacion: "Mitin en Puno, Andina", indicador: "MITIN = techo 3. Promesas electorales a audiencia local. Logica transaccional: yo te doy apoyo — Estadio 2" }],
    estadioAlternativo: 3, notas: "Tema nuevo (agricultura). REGLA MITIN aplica. Se mantiene en estadio 2: patron de promesas sin sustento institucional." },

  // 6. Rafael Jorge Belaunde Llosa — economia/inversiones e infraestructura
  // Oleadas previas: 4, 5, 4
  { id: "eval-oleada4-rafael-jorge-belaunde-llosa", entidadId: "rafael-jorge-belaunde-llosa", fuenteId: "f-oleada4-rafael-jorge-belaunde-llosa", estadio: 4, confianza: "alta" as const,
    justificacion: "Propone shock de inversiones con reformas normativas, simplificacion de tramites y Reactiva Mype via Cofide. El razonamiento es institucional: Cofide asume parte del riesgo, marco normativo facilita formalizacion. No hay promesas grandilocuentes sino mecanismos dentro del sistema existente.",
    citas: [{ texto: "Si queremos mejor empleo debemos tener mas y mejor inversion privada. Proponemos un Reactiva Mype donde Cofide asuma parte del riesgo para que las entidades financieras presten a micro y pequenos empresarios", ubicacion: "Entrevista Andina, propuestas economicas", indicador: "Mecanismo institucional concreto: Cofide como garante, marco normativo — Estadio 4" }],
    estadioAlternativo: 5, notas: "Tema nuevo (economia/mypes). Se mantiene en estadio 4: consistente con oleadas 1 y 3. No sube a 5 porque no articula principios universales, solo eficiencia institucional." },

  // 7. Pitter Enrique Valderrama Pena — educacion y agricultura
  // Oleadas previas: 2, 3, 2
  { id: "eval-oleada4-pitter-enrique-valderrama-pena", entidadId: "pitter-enrique-valderrama-pena", fuenteId: "f-oleada4-pitter-enrique-valderrama-pena", estadio: 2, confianza: "media" as const,
    justificacion: "Promete creditos agrarios para pequenos productores, ampliar frontera agricola de 250 mil a 500 mil hectareas e incrementar presupuesto educativo de 5.1% a 7% del PBI. Las cifras son ambiciosas sin sustento fiscal. La logica es transaccional: mas presupuesto = mas educacion. No articula que reforma estructural necesita el sistema educativo.",
    citas: [{ texto: "Implementaremos creditos agrarios para pequenos productores y ampliaremos la frontera agricola de 250 mil a 500 mil hectareas. En educacion subiremos del 5.1% al 7% del PBI", ubicacion: "Entrevista Andina, campana en Sullana", indicador: "Transaccional: cifras ambiciosas sin reforma estructural. Mas presupuesto como solucion magica — Estadio 2" }],
    estadioAlternativo: 3, notas: "Tema nuevo (educacion + agricultura). Se mantiene en estadio 2: patron de promesas cuantitativas sin principio articulado." },

  // 8. Ricardo Pablo Belmont Cassinelli — economia/Mypes
  // Oleadas previas: 3, 2, 2
  { id: "eval-oleada4-ricardo-pablo-belmont-cassinelli", entidadId: "ricardo-pablo-belmont-cassinelli", fuenteId: "f-oleada4-ricardo-pablo-belmont-cassinelli", estadio: 2, confianza: "media" as const,
    justificacion: "En debate destaca inversion privada y apoyo a Mypes. Pero el contenido es generico: no articula mecanismos concretos ni reformas institucionales. Debate = formato de promesas rapidas. Repite logica transaccional: yo apoyo Mypes, las Mypes crecen.",
    citas: [{ texto: "Hay que apoyar a las Mypes que son el motor del Peru. Vamos a facilitar la inversion privada eliminando trabas burocraticas", ubicacion: "Debate JNE ultima fecha, bloque empleo, Correo", indicador: "Generico y transaccional: apoyo a Mypes como eslogan sin mecanismo institucional — Estadio 2" }],
    estadioAlternativo: 3, notas: "Tema nuevo (economia/Mypes). Se mantiene en estadio 2: patron de propuestas vagas confirmado en oleada 2." },

  // 9. Charlie Carrasco Salazar — salud/brecha sanitaria
  // Oleadas previas: 1, 1, 2
  { id: "eval-oleada4-charlie-carrasco-salazar", entidadId: "charlie-carrasco-salazar", fuenteId: "f-oleada4-charlie-carrasco-salazar", estadio: 2, confianza: "media" as const,
    justificacion: "Dice que la brecha sanitaria se resuelve con 'decision y voluntad politica'. Promete que cada provincia tendra hospital nivel 1, 2 y 3. La solucion es personalista: el lider decide y se resuelve. No articula financiamiento, formacion de personal ni cadena logistica. Un hospital de nivel 3 por provincia es inviable sin analisis de demanda.",
    citas: [{ texto: "Para solucionar la brecha sanitaria se necesita decision y voluntad politica. Cada provincia tendra un hospital de nivel 1, 2 y 3 con infraestructura y equipamiento completo", ubicacion: "Debate JNE cuarta fecha, bloque salud, Correo", indicador: "Voluntarismo personalista: decision del lider como solucion. Promesas inviables — Estadio 2" }],
    estadioAlternativo: 1, notas: "Tema nuevo (salud). Se mantiene en estadio 2: mejora relativa vs estadio 1 pero sigue pre-convencional. El voluntarismo roza estadio 1." },

  // 10. Alex Gonzales Castillo — educacion/presupuesto universidades
  // Oleadas previas: 2, 2, 3
  { id: "eval-oleada4-alex-gonzales-castillo", entidadId: "alex-gonzales-castillo", fuenteId: "f-oleada4-alex-gonzales-castillo", estadio: 2, confianza: "media" as const,
    justificacion: "Propone elevar presupuesto educativo de 5.1% a 7.6% del PBI y aumentar presupuesto universitario. La logica es cuantitativa: mas dinero = mejor educacion. No articula que reformas curriculares, de gestion o de calidad necesita el sistema. Cosmovisión andina y amazonica suena a estadio 3 pero es eslogan sin desarrollo.",
    citas: [{ texto: "De llegar a Palacio elevare el presupuesto en educacion del 5.1% al 7.6% en los proximos cinco anos y aumentaremos el presupuesto en educacion universitaria", ubicacion: "Debate JNE cuarta fecha, bloque educacion, Correo", indicador: "Cuantitativo: mas presupuesto como solucion. Sin reforma de calidad — Estadio 2" }],
    estadioAlternativo: 3, notas: "Tema nuevo (educacion universitaria). Baja de 3 a 2: en educacion Gonzales no articula la injusticia como en tercerizacion. Logica puramente cuantitativa." },
];

async function main() {
  console.log(`\nRegistrando ${FUENTES.length} fuentes + ${EVALUACIONES.length} evaluaciones (Oleada 4 - Lote A)...\n`);

  for (const f of FUENTES) {
    await setDoc(doc(db, "fuentes", f.id), { ...f, calidadIA: null, creadaPor: "moralscore-bot", createdAt: new Date().toISOString() }, { merge: true });
  }

  for (const ev of EVALUACIONES) {
    await setDoc(doc(db, "evaluaciones", ev.id), { ...ev, evaluador: "lucas", validadoPor: null, createdAt: new Date().toISOString() });
    console.log(`  + ${ev.entidadId} — Estadio ${ev.estadio}`);
  }

  // Recalcular scores
  console.log("\nRecalculando scores...\n");
  const evalSnap = await getDocs(collection(db, "evaluaciones"));
  const byEntidad: Record<string, number[]> = {};
  evalSnap.forEach((d) => {
    const data = d.data();
    if (data.entidadId && data.estadio) {
      if (!byEntidad[data.entidadId]) byEntidad[data.entidadId] = [];
      byEntidad[data.entidadId].push(data.estadio);
    }
  });

  for (const [id, estadios] of Object.entries(byEntidad)) {
    const score = median(estadios);
    await setDoc(doc(db, "entidades", id), { scoreActual: score, totalEvaluaciones: estadios.length }, { merge: true });
    console.log(`  * ${id} → ${score} (${estadios.length} evals)`);
  }

  console.log("\n=== OLEADA 4, LOTE A COMPLETADA (10 evaluaciones) ===\n");
}

main().catch(console.error);
