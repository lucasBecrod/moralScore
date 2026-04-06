/**
 * Oleada 2 — Lote C: Segunda evaluacion por candidato (9 candidatos)
 * Fuentes DIFERENTES a oleada 1 para cada candidato.
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
  // 1. Walter Chirinos — oleada 1 fue Andina/estado excepcion; ahora RPP/modelo Bukele
  { id: "f-oleada2-walter-gilmer-chirinos-purizaga", url: "https://rpp.pe/politica/elecciones/walter-chirinos-propone-modelo-de-seguridad-inspirado-en-bukele-y-el-salvador-para-combatir-la-criminalidad-con-justicia-noticia-1675084", tipo: "entrevista", titulo: "Chirinos: modelo Bukele para combatir criminalidad con justicia", medio: "RPP", fechaFuente: "2026-02-09", entidadId: "walter-gilmer-chirinos-purizaga", estado: "evaluada" },

  // 2. Carlos Espa — oleada 1 fue El Comercio/pacto infame; ahora Infobae/penales maxima seguridad
  { id: "f-oleada2-alfonso-carlos-espa-y-garces-alvear", url: "https://www.infobae.com/peru/2026/03/25/debate-presidencial-2026-carlos-espa-propone-seis-penales-de-maxima-seguridad-sin-visitas-para-cabecillas/", tipo: "debate", titulo: "Espa: 6 penales de maxima seguridad sin visitas para cabecillas", medio: "Infobae", fechaFuente: "2026-03-25", entidadId: "alfonso-carlos-espa-y-garces-alvear", estado: "evaluada" },

  // 3. Carlos Jaico — oleada 1 fue El Comercio/reforma policial; ahora RPP/empleo y emprendimiento
  { id: "f-oleada2-carlos-ernesto-jaico-carranza", url: "https://rpp.pe/politica/elecciones/debate-presidencial-2026-estas-son-las-propuestas-de-los-candidatos-sobre-empleo-desarrollo-y-emprendimiento-noticia-1682276", tipo: "debate", titulo: "Jaico: escudo tributario para mypes y crecimiento 6-7%", medio: "RPP", fechaFuente: "2026-04-02", entidadId: "carlos-ernesto-jaico-carranza", estado: "evaluada" },

  // 4. Jose Luna Galvez — oleada 1 fue El Comercio/6 meses extorsion; ahora RPP/planilla joven
  { id: "f-oleada2-jose-leon-luna-galvez", url: "https://rpp.pe/politica/elecciones/jose-luna-promete-que-el-estado-asumira-el-30-de-la-planilla-joven-es-viable-noticia-1682644", tipo: "debate", titulo: "Luna Galvez: Estado asume 30% planilla joven, 100 mil empleos/ano", medio: "RPP", fechaFuente: "2026-04-02", entidadId: "jose-leon-luna-galvez", estado: "evaluada" },

  // 5. Marisol Perez Tello — oleada 1 fue El Comercio/principios; ahora Ojo Publico/Congreso y crimen
  { id: "f-oleada2-maria-soledad-perez-tello-de-rodriguez", url: "https://ojo-publico.com/entrevistas/perez-tello-congreso-se-cargo-legislacion-contra-crimen-organizado", tipo: "entrevista", titulo: "Perez Tello: el Congreso se cargo la legislacion contra crimen organizado", medio: "Ojo Publico", fechaFuente: "2025-03-23", entidadId: "maria-soledad-perez-tello-de-rodriguez", estado: "evaluada" },

  // 6. Paul Jaimes — oleada 1 fue RPP/pena de muerte; ahora Infobae/debate tercera fecha
  { id: "f-oleada2-paul-davis-jaimes-blanco", url: "https://www.infobae.com/peru/2026/03/25/debate-presidencial-peru-2026-en-vivo-hoy-tercera-fecha-con-12-postulantes-temas-clave-y-el-minuto-a-minuto-del-encuentro-del-25-de-marzo/", tipo: "debate", titulo: "Jaimes: delincuentes no merecen vivir, recompensa por capturas", medio: "Infobae", fechaFuente: "2026-03-25", entidadId: "paul-davis-jaimes-blanco", estado: "evaluada" },

  // 7. Antonio Ortiz Villano — oleada 1 fue El Comercio/Reactiva mypes; ahora RPP/referendum pena muerte
  { id: "f-oleada2-antonio-ortiz-villano", url: "https://rpp.pe/politica/elecciones/antonio-ortiz-candidato-de-salvemos-al-peru-anuncia-referendum-para-aplicar-pena-de-muerte-noticia-1681770", tipo: "debate", titulo: "Ortiz Villano: referendum para pena de muerte, cortar dinero al crimen", medio: "RPP", fechaFuente: "2026-03-26", entidadId: "antonio-ortiz-villano", estado: "evaluada" },

  // 8. Rosario Fernandez — oleada 1 fue Infobae/autovacancia; ahora RPP/debate anticorrupcion
  { id: "f-oleada2-rosario-del-pilar-fernandez-bazan", url: "https://rpp.pe/politica/elecciones/debate-presidencial-cuales-fueron-las-propuestas-de-los-candidatos-en-lucha-contra-la-corrupcion-noticia-1681705", tipo: "debate", titulo: "Fernandez: reforma sistema justicia, purga Contraloria, disolver camaras", medio: "RPP", fechaFuente: "2026-03-25", entidadId: "rosario-del-pilar-fernandez-bazan", estado: "evaluada" },

  // 9. Roberto Chiabra — oleada 1 fue RPP/Comando Conjunto; ahora Infobae/educacion e infraestructura
  { id: "f-oleada2-roberto-enrique-chiabra-leon", url: "https://www.infobae.com/peru/2026/04/01/debate-electoral-2026-roberto-chiabra-propone-construccion-y-equipamiento-educativo-para-cerrar-brechas-en-el-pais/", tipo: "debate", titulo: "Chiabra: construccion y equipamiento educativo para cerrar brechas", medio: "Infobae", fechaFuente: "2026-04-01", entidadId: "roberto-enrique-chiabra-leon", estado: "evaluada" },
];

const EVALUACIONES = [
  // 1. Chirinos — modelo Bukele, "acabar criminalidad con inteligencia"
  // Oleada 1: estadio 1 (estado de excepcion). Aqui: sigue punitivo pero con barniz tecnico.
  // "Propongo ser el Bukele peruano y combatir la criminalidad con justicia"
  // "Hay que respetar los derechos humanos de la gente buena [...] Al que le corresponde mal, hay que aplicarle justicia"
  // Divide ciudadanos en buenos/malos. Castigo para los "malos". Estadio 1: fuerza como solucion.
  // Anti-ventriloquismo: no hay reflexion institucional real, solo copiar modelo autoritario.
  { id: "eval-oleada2-walter-gilmer-chirinos-purizaga", entidadId: "walter-gilmer-chirinos-purizaga", fuenteId: "f-oleada2-walter-gilmer-chirinos-purizaga", estadio: 1, confianza: "alta" as const,
    justificacion: "Divide personas en buenas/malas. Copia modelo Bukele sin reflexion institucional. Derechos solo para los buenos.",
    citas: [{ texto: "Propongo ser el Bukele peruano y combatir la criminalidad con justicia", ubicacion: "Entrevista RPP Ampliacion de Noticias", indicador: "Fuerza y castigo como solucion. Division moral binaria buenos/malos" }],
    estadioAlternativo: 2, notas: "Consistente con oleada 1. Ahora con barniz tecnico pero misma logica punitiva." },

  // 2. Espa — penales maxima seguridad sin visitas, desarraigo 48h
  // Oleada 1: estadio 3 (busca aprobacion, pacto infame). Aqui: propuesta mas concreta.
  // "Nosotros lo que queremos es poner el mundo que esta al reves en su lugar y aplicar la mano dura a los cabecillas"
  // Propuesta de 6 penales sin visitas, traslado en 48h. Mezcla: apela a orden pero con mecanismo punitivo severo.
  // Estadio 2: transaccional — mano blanda para trabajadores, mano dura para criminales. Logica de intercambio.
  // Anti-ventriloquismo: baja a 2 porque el razonamiento es "el Estado aplica mano dura con quien no debe y blanda con quien no debe", invierte la relacion pero sigue transaccional.
  { id: "eval-oleada2-alfonso-carlos-espa-y-garces-alvear", entidadId: "alfonso-carlos-espa-y-garces-alvear", fuenteId: "f-oleada2-alfonso-carlos-espa-y-garces-alvear", estadio: 2, confianza: "media" as const,
    justificacion: "Logica transaccional: mano blanda para trabajadores, mano dura para criminales. Penales sin visitas ni derechos.",
    citas: [{ texto: "El Estado aplica mano dura con los trabajadores y blanda con los cabecillas de las organizaciones criminales", ubicacion: "Debate JNE tercera fecha", indicador: "Intercambio punitivo: castigo para unos, beneficio para otros" }],
    estadioAlternativo: 3, notas: "Baja de estadio 3 (oleada 1) a 2. Fuente mas concreta revela logica transaccional, no solo busqueda de aprobacion." },

  // 3. Jaico — escudo tributario mypes, amnistia multas, crecimiento 6-7%
  // Oleada 1: estadio 4 (reforma policial, muerte civil). Aqui: propuestas economicas.
  // "Implementaremos el escudo tributario, otorgando amnistia de multas a todas nuestras MYPES"
  // "Prohibicion total del bloqueo de cuentas bancarias en nuestras MYPES"
  // Articula propuestas en marco institucional-legal: amnistias, reformas tributarias, metas de crecimiento.
  // Estadio 4: apela a sistema legal y reformas institucionales para resolver problemas economicos.
  { id: "eval-oleada2-carlos-ernesto-jaico-carranza", entidadId: "carlos-ernesto-jaico-carranza", fuenteId: "f-oleada2-carlos-ernesto-jaico-carranza", estadio: 4, confianza: "media" as const,
    justificacion: "Articula propuestas economicas en marco institucional: reformas tributarias, proteccion legal a mypes.",
    citas: [{ texto: "Implementaremos el escudo tributario, otorgando la amnistia de multas y municipalidades a todas nuestras MYPES", ubicacion: "Debate JNE bloque empleo", indicador: "Apela a reformas legales e institucionales como mecanismo de solucion" }],
    estadioAlternativo: 3, notas: "Consistente con oleada 1 (estadio 4). Marco institucional sostenido en ambas fuentes." },

  // 4. Luna Galvez — Estado asume 30% planilla joven, 100 mil empleos/ano
  // Oleada 1: estadio 2 (6 meses acabar extorsion). Aqui: mas promesas transaccionales.
  // "El 30% de la planilla joven sera asumida por el Estado, con lo cual lograremos cien mil jovenes contratados formalmente cada ano"
  // Propuesta no figura en plan de gobierno. Promesa de intercambio Estado-empresas.
  // Estadio 2: transaccional puro. Estado da dinero, empresas contratan. Sin reflexion sobre estructura.
  { id: "eval-oleada2-jose-leon-luna-galvez", entidadId: "jose-leon-luna-galvez", fuenteId: "f-oleada2-jose-leon-luna-galvez", estadio: 2, confianza: "alta" as const,
    justificacion: "Transaccional: Estado subsidia planilla a cambio de contratacion. Cifras redondas sin sustento en plan de gobierno.",
    citas: [{ texto: "El 30% de la planilla joven sera asumida por el Estado, con lo cual lograremos cien mil jovenes contratados formalmente cada ano", ubicacion: "Debate JNE bloque empleo", indicador: "Relacion transaccional Estado-empresas. Promesa de intercambio" }],
    estadioAlternativo: 1, notas: "Consistente con oleada 1 (estadio 2). Patron de promesas grandilocuentes sin sustento." },

  // 5. Perez Tello — Congreso destruyo legislacion anticrimen, principios democraticos
  // Oleada 1: estadio 5 (principios en democracia). Aqui: denuncia leyes injustas.
  // "El Congreso se ha cargado toda la legislacion contra el crimen organizado"
  // "la discusion es entre la gente que quiere que el Peru sea gobernado por mafias y la que quiere que sea un pais democratico"
  // "Si no tienes claridad y principios minimos democraticos, yo no me siento en capacidad de hacer acuerdos"
  // Estadio 5: reconoce que leyes pueden ser injustas (procrimen), apela a principios democraticos universales como limite.
  { id: "eval-oleada2-maria-soledad-perez-tello-de-rodriguez", entidadId: "maria-soledad-perez-tello-de-rodriguez", fuenteId: "f-oleada2-maria-soledad-perez-tello-de-rodriguez", estadio: 5, confianza: "alta" as const,
    justificacion: "Denuncia leyes procrimen como injustas. Establece principios democraticos como limite no negociable para acuerdos.",
    citas: [{ texto: "Si no tienes claridad y principios minimos democraticos, yo no me siento en capacidad de hacer acuerdos", ubicacion: "Entrevista Ojo Publico", indicador: "Reconoce leyes injustas. Principios universales sobre conveniencia politica" }],
    estadioAlternativo: 4, notas: "Consistente con oleada 1 (estadio 5). Refuerza con denuncia concreta de leyes procrimen." },

  // 6. Jaimes — "delincuentes no merecen vivir", recompensa por capturas
  // Oleada 1: estadio 1 (pena de muerte). Aqui: refuerza.
  // "estos delincuentes ya no merecen vivir"
  // "Cuando la delincuencia te toca la puerta, tu discurso cambia"
  // Propone recompensa 100mil soles y ascenso por capturar criminales.
  // Estadio 1: castigo absoluto, eliminacion del otro. Sin matiz institucional.
  { id: "eval-oleada2-paul-davis-jaimes-blanco", entidadId: "paul-davis-jaimes-blanco", fuenteId: "f-oleada2-paul-davis-jaimes-blanco", estadio: 1, confianza: "alta" as const,
    justificacion: "Eliminacion del otro como solucion. Deshumaniza al delincuente. Incentivo economico por capturas refuerza logica punitiva.",
    citas: [{ texto: "Estos delincuentes ya no merecen vivir", ubicacion: "Debate JNE tercera fecha", indicador: "Castigo absoluto. Deshumanizacion. Eliminacion como fin" }],
    estadioAlternativo: null, notas: "Consistente con oleada 1 (estadio 1). Refuerza con cita mas explicita." },

  // 7. Ortiz Villano — referendum pena de muerte, cortar dinero al crimen
  // Oleada 1: estadio 2 (Reactiva mypes). Aqui: seguridad.
  // "tenemos que pedirle un referendum al pueblo, para que el pueblo decida si vamos a la pena de muerte"
  // "el crimen no vive del aire, vive del dinero y eso se lo vamos a cortar"
  // Mezcla: reconoce Estado de derecho ("pais de derecho") pero quiere salirse de Corte. Referendum como mecanismo.
  // Estadio 2: instrumental — usa referendum como transaccion con el pueblo. "El pueblo decide" evita responsabilidad moral.
  // Anti-ventriloquismo: no sube a 4 porque la apelacion al referendum es evasion, no institucionalidad.
  { id: "eval-oleada2-antonio-ortiz-villano", entidadId: "antonio-ortiz-villano", fuenteId: "f-oleada2-antonio-ortiz-villano", estadio: 2, confianza: "media" as const,
    justificacion: "Usa referendum como mecanismo para evadir responsabilidad moral sobre pena de muerte. Transaccional: que el pueblo decida.",
    citas: [{ texto: "Tenemos que pedirle un referendum al pueblo, para que el pueblo decida si nosotros vamos a la pena de muerte", ubicacion: "Debate JNE bloque seguridad", indicador: "Evasion de responsabilidad moral. Transaccion con voluntad popular" }],
    estadioAlternativo: 1, notas: "Consistente con oleada 1 (estadio 2). En seguridad baja hacia estadio 1 (pena de muerte)." },

  // 8. Rosario Fernandez — reforma justicia, purga Contraloria, disolver camaras
  // Oleada 1: estadio 2 (autovacancia). Aqui: anticorrupcion.
  // "una reforma de todo el sistema de justicia, disolver la Camara de Diputados y Senadores"
  // "una purga en la Contraloria para que solo queden los funcionarios mas idoneos"
  // Disolver camaras + purga = logica de fuerza y destruccion institucional, no reforma.
  // Estadio 1: destruir instituciones como solucion. No hay construccion, solo demolicion.
  // Anti-ventriloquismo: no sube a 4 porque disolver camaras y purgar no es fortalecer instituciones.
  { id: "eval-oleada2-rosario-del-pilar-fernandez-bazan", entidadId: "rosario-del-pilar-fernandez-bazan", fuenteId: "f-oleada2-rosario-del-pilar-fernandez-bazan", estadio: 1, confianza: "media" as const,
    justificacion: "Propone destruir instituciones (disolver camaras, purgar Contraloria). Logica de fuerza, no de reforma.",
    citas: [{ texto: "Una reforma de todo el sistema de justicia, disolver la Camara de Diputados y Senadores", ubicacion: "Debate JNE bloque anticorrupcion", indicador: "Destruccion institucional como solucion. Fuerza sobre proceso" }],
    estadioAlternativo: 2, notas: "Baja de estadio 2 (oleada 1) a 1. Fuente revela logica destructiva mas que transaccional." },

  // 9. Chiabra — educacion, infraestructura, cerrar brechas
  // Oleada 1: estadio 4 (Comando Conjunto). Aqui: educacion.
  // "Nuestro objetivo es que todos los peruanos tengan educacion escolar completa, un oficio o una profesion"
  // "Nosotros con el Ministerio de Infraestructura vamos a invertir en los colegios tecnicos"
  // "Tenemos un 41% de peruanos que sufre de inseguridad alimentaria [...] 8 millones que no ha terminado educacion"
  // Diagnostico con datos, solucion institucional (Ministerio de Infraestructura), metas universalistas.
  // Estadio 4: marco institucional claro, reformas estructurales, datos como base.
  { id: "eval-oleada2-roberto-enrique-chiabra-leon", entidadId: "roberto-enrique-chiabra-leon", fuenteId: "f-oleada2-roberto-enrique-chiabra-leon", estadio: 4, confianza: "media" as const,
    justificacion: "Diagnostico con datos y solucion institucional: crear Ministerio de Infraestructura, invertir en educacion tecnica.",
    citas: [{ texto: "Nuestro objetivo es que todos los peruanos tengan educacion escolar completa, un oficio o una profesion", ubicacion: "Debate JNE bloque educacion", indicador: "Marco institucional, metas universalistas, datos como base" }],
    estadioAlternativo: 3, notas: "Consistente con oleada 1 (estadio 4). Ambas fuentes muestran razonamiento institucional." },
];

async function main() {
  console.log(`\nRegistrando ${FUENTES.length} fuentes + ${EVALUACIONES.length} evaluaciones (Oleada 2 — Lote C)...\n`);

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
    if (!byEntidad[data.entidadId]) byEntidad[data.entidadId] = [];
    byEntidad[data.entidadId].push(data.estadio);
  });

  for (const [entidadId, estadios] of Object.entries(byEntidad)) {
    const score = median(estadios);
    await setDoc(doc(db, "candidatos", entidadId), { scoreActual: score, numEvaluaciones: estadios.length }, { merge: true });
    console.log(`  ${entidadId}: median=${score} (n=${estadios.length})`);
  }

  console.log("\nDone.");
}

main().catch(console.error);
