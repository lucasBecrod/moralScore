/**
 * Oleada 4, Lote C — Cuarta evaluacion por candidato (9 candidatos)
 * Fuentes DIFERENTES a oleadas 1, 2 y 3. Temas NO cubiertos previamente.
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
  // 21. Chirinos — educacion: revolucion educativa e institutos tecnicos (NO excepcion, NO Bukele, NO bicameralidad)
  { id: "f-oleada4-walter-gilmer-chirinos-purizaga", url: "https://rpp.pe/politica/elecciones/debate-presidencial-2026-estas-son-las-propuestas-de-los-candidatos-sobre-educacion-innovacion-y-tecnologia-noticia-1682292", tipo: "debate", titulo: "Chirinos: revolucion educativa, institutos tecnicos regionales", medio: "RPP", fechaFuente: "2026-03-30", entidadId: "walter-gilmer-chirinos-purizaga", estado: "evaluada" },

  // 22. Espa — salud/agua: cerrar brecha agua potable y eliminar 35 impuestos (NO pacto infame, NO penales, NO bono educativo)
  { id: "f-oleada4-alfonso-carlos-espa-y-garces-alvear", url: "https://diariocorreo.pe/politica/carlos-espa-propone-revisar-la-regionalizacion-y-cerrar-brecha-de-agua-potable-debate-presidencial-jne-elecciones-2026-peru-noticia/", tipo: "debate", titulo: "Espa: cerrar brecha agua potable, revisar regionalizacion", medio: "Correo", fechaFuente: "2026-03-30", entidadId: "alfonso-carlos-espa-y-garces-alvear", estado: "evaluada" },

  // 23. Jaico — educacion: triplicar SENATI, banco del emprendedor (NO reforma policial, NO escudo tributario, NO Guardia Civil)
  { id: "f-oleada4-carlos-ernesto-jaico-carranza", url: "https://rpp.pe/politica/elecciones/debate-presidencial-2026-estas-son-las-propuestas-de-los-candidatos-sobre-educacion-innovacion-y-tecnologia-noticia-1682292", tipo: "debate", titulo: "Jaico: triplicar SENATI, banco del emprendedor, formacion tecnica en escuelas", medio: "RPP", fechaFuente: "2026-03-30", entidadId: "carlos-ernesto-jaico-carranza", estado: "evaluada" },

  // 24. Luna Galvez — educacion: duplicar vacantes, triplicar Beca 18, crear Beca 25 (NO extorsion, NO planilla joven, NO Urresti)
  { id: "f-oleada4-jose-leon-luna-galvez", url: "https://rpp.pe/politica/elecciones/elecciones-2026-las-propuestas-de-los-candidatos-sobre-educacion-innovacion-y-tecnologia-en-el-debate-presidencial-noticia-1682607", tipo: "debate", titulo: "Luna Galvez: duplicar vacantes universitarias, triplicar Beca 18, crear Beca 25", medio: "RPP", fechaFuente: "2026-04-01", entidadId: "jose-leon-luna-galvez", estado: "evaluada" },

  // 25. Perez Tello — primera infancia: erradicar anemia y desnutricion (NO principios, NO Congreso/crimen, NO informalidad)
  { id: "f-oleada4-maria-soledad-perez-tello-de-rodriguez", url: "https://diariocorreo.pe/politica/marisol-perez-tello-plantea-dotar-recursos-para-mejorar-salud-infantil-desde-el-nacimiento-noticia/", tipo: "debate", titulo: "Perez Tello: erradicar anemia y desnutricion en primera infancia", medio: "Correo", fechaFuente: "2026-04-01", entidadId: "maria-soledad-perez-tello-de-rodriguez", estado: "evaluada" },

  // 26. Jaimes — educacion: Beca 18, carrera tecnica en secundaria (NO pena muerte, NO no merecen vivir, NO zonas francas)
  { id: "f-oleada4-paul-davis-jaimes-blanco", url: "https://diariocorreo.pe/politica/paul-jaimes-herbert-caller-y-mario-vizcarra-exponen-propuestas-educativas-en-el-quinto-dia-de-debate-presidencial-jne-elecciones-2026-en-vivo-noticia/", tipo: "debate", titulo: "Jaimes: ampliar Beca 18, carrera tecnica a nombre de la nacion en secundaria", medio: "Correo", fechaFuente: "2026-03-31", entidadId: "paul-davis-jaimes-blanco", estado: "evaluada" },

  // 27. Ortiz Villano — educacion: educacion conectada a industria, parques industriales (NO Reactiva, NO referendum pena muerte, NO trazabilidad)
  { id: "f-oleada4-antonio-ortiz-villano", url: "https://diariocorreo.pe/politica/elecciones-2026-estas-son-las-propuestas-de-acuna-ortiz-y-grozo-para-mejorar-la-educacion-y-tecnologia-noticia/", tipo: "debate", titulo: "Ortiz: educacion conectada a industria, parques industriales regionales", medio: "Correo", fechaFuente: "2026-04-01", entidadId: "antonio-ortiz-villano", estado: "evaluada" },

  // 28. Fernandez — salud: salud preventiva, unificar EsSalud y Minsa (NO autovacancia, NO disolver camaras, NO plataformas educacion)
  { id: "f-oleada4-rosario-del-pilar-fernandez-bazan", url: "https://andina.pe/agencia/noticia-elecciones-2026-rosario-fernandez-plantea-impulso-de-salud-preventiva-la-poblacion-1061240.aspx", tipo: "entrevista", titulo: "Fernandez: salud preventiva, unificar EsSalud-Minsa, 4 ambulancias por posta", medio: "Andina", fechaFuente: "2026-03-15", entidadId: "rosario-del-pilar-fernandez-bazan", estado: "evaluada" },

  // 29. Chiabra — economia: brecha salarial genero, empleo juvenil, biodiversidad (NO Comando Conjunto, NO educacion/infraestructura, NO salud preventiva)
  { id: "f-oleada4-roberto-enrique-chiabra-leon", url: "https://elcomercio.pe/politica/roberto-chiabra-participa-en-debate-presidencial-2026-martes-31-incidentes-temas-pullas-y-planes-de-gobierno-previo-a-las-elecciones-generales-peru-2026-video-noticia/", tipo: "debate", titulo: "Chiabra: eliminar brecha salarial genero, empleo juvenil, cadenas productivas regionales", medio: "El Comercio", fechaFuente: "2026-03-31", entidadId: "roberto-enrique-chiabra-leon", estado: "evaluada" },
];

const EVALUACIONES = [
  // 21. Chirinos — educacion/institutos tecnicos
  // Oleadas previas: 1, 1, 1
  { id: "eval-oleada4-walter-gilmer-chirinos-purizaga", entidadId: "walter-gilmer-chirinos-purizaga", fuenteId: "f-oleada4-walter-gilmer-chirinos-purizaga", estadio: 2, confianza: "media" as const,
    justificacion: "Propone revolucion educativa con institutos tecnicos regionales alineados a agro, mineria y tecnologia. Exoneracion de impuestos por 5 anos a empresas que se instalen. Suena a estadio 3-4 pero es debate con promesas desconectadas: exoneracion 5 anos + seguridad juridica + menos burocracia. No articula como vincula educacion con mercado laboral ni que reforma institucional del sistema educativo propone.",
    citas: [{ texto: "Impulsare colegios e institutos tecnicos de alto nivel en todas las regiones, alineados al agro, la mineria y la tecnologia. Menos burocracia y mas empleo", ubicacion: "Debate JNE cuarta fecha, bloque educacion, RPP", indicador: "Promesas multiples desconectadas. Exoneraciones como regalo. Debate = techo 3, pero contenido es eslogan — Estadio 2" }],
    estadioAlternativo: 3, notas: "Tema nuevo (educacion). Mejora relativa vs estadio 1 pero sigue siendo pre-convencional. Cuatro evaluaciones: 1,1,1,2." },

  // 22. Espa — agua potable y regionalizacion
  // Oleadas previas: 3, 2, 3
  { id: "eval-oleada4-alfonso-carlos-espa-y-garces-alvear", entidadId: "alfonso-carlos-espa-y-garces-alvear", fuenteId: "f-oleada4-alfonso-carlos-espa-y-garces-alvear", estadio: 3, confianza: "media" as const,
    justificacion: "Diagnostica que la regionalizacion traslado vicios del centralismo limeno a capitales departamentales. Propone cerrar brecha de agua potable y que gobierno central intervenga donde hay mala gestion. Es diagnostico correcto con solucion centralista: si la region falla, Lima interviene. No articula como fortalecer capacidades regionales sino como retomar control central.",
    citas: [{ texto: "La falsa regionalizacion ha trasladado los vicios del centralismo limeno a las capitales de cada departamento. Me comprometo a cerrar la brecha del agua potable al final de mi gobierno", ubicacion: "Debate JNE cuarta fecha, bloque descentralizacion, Correo", indicador: "Diagnostico correcto de regionalizacion + solucion centralista. Compromiso personal como garantia — Estadio 3" }],
    estadioAlternativo: 4, notas: "Tema nuevo (agua/descentralizacion). Se mantiene en estadio 3: critica a regionalizacion es buena pero la solucion es re-centralizar, no reformar. Anti-ventriloquismo: compromiso personal no es mecanismo." },

  // 23. Jaico — educacion/SENATI y banco emprendedor
  // Oleadas previas: 4, 4, 4
  { id: "eval-oleada4-carlos-ernesto-jaico-carranza", entidadId: "carlos-ernesto-jaico-carranza", fuenteId: "f-oleada4-carlos-ernesto-jaico-carranza", estadio: 4, confianza: "alta" as const,
    justificacion: "Propone triplicar SENATI, crear banco del emprendedor para financiar mas de 2 millones de Mypes, formacion tecnica en escuelas vinculada a demanda laboral. El razonamiento es institucional: usa instituciones existentes (SENATI), crea nuevas (banco emprendedor), y vincula educacion con mercado. No promete cifras magicas sino reformas del sistema formativo.",
    citas: [{ texto: "Vamos a triplicar el SENATI e implementar formacion tecnica en las escuelas. Crearemos el banco del emprendedor para que mas de 2 millones de Mypes tengan acceso a financiamiento sin bancos depredadores", ubicacion: "Debate JNE cuarta fecha, bloque educacion, RPP", indicador: "Reforma institucional: usar SENATI existente + crear banco emprendedor + vincular educacion-mercado — Estadio 4" }],
    estadioAlternativo: 3, notas: "Tema nuevo (educacion tecnica). Consistente con oleadas 1, 2 y 3 (estadio 4). Cuatro evaluaciones confirman razonamiento institucional." },

  // 24. Luna Galvez — educacion/vacantes y becas
  // Oleadas previas: 2, 2, 2
  { id: "eval-oleada4-jose-leon-luna-galvez", entidadId: "jose-leon-luna-galvez", fuenteId: "f-oleada4-jose-leon-luna-galvez", estadio: 2, confianza: "alta" as const,
    justificacion: "Duplicar vacantes universitarias, triplicar Beca 18, crear Beca 25 para maestrias, 1000 millones para politecnicos. Todas son cifras redondas sin sustento fiscal. No articula reforma de calidad educativa: mas vacantes no significa mejor educacion. Patron de promesas grandilocuentes en todos los temas.",
    citas: [{ texto: "Duplicaremos las vacantes de universidades nacionales, triplicaremos las cuotas de Beca 18 y crearemos Beca 25 para maestrias. Destinaremos 1000 millones de soles a politecnicos", ubicacion: "Debate JNE ultima fecha, bloque educacion, RPP", indicador: "Cifras redondas multiplicadoras sin reforma de calidad. Mas = mejor como logica — Estadio 2 transaccional" }],
    estadioAlternativo: 1, notas: "Tema nuevo (educacion). Consistente con oleadas previas (2,2,2). Cuatro evaluaciones confirman patron transaccional en todo tema." },

  // 25. Perez Tello — primera infancia/anemia y desnutricion
  // Oleadas previas: 5, 5, 5
  { id: "eval-oleada4-maria-soledad-perez-tello-de-rodriguez", entidadId: "maria-soledad-perez-tello-de-rodriguez", fuenteId: "f-oleada4-maria-soledad-perez-tello-de-rodriguez", estadio: 5, confianza: "alta" as const,
    justificacion: "Plantea erradicar anemia y desnutricion en primera infancia como prerequisito para cualquier otra politica. Articula servicios continuos desde nacimiento con seguimiento tecnologico a distancia. Lo clave: 'en una sociedad que atiende a ninos y ancianos, los padres pueden salir a trabajar sin abandonarlos' — reconoce que los derechos sociales son interdependientes. No es lista de promesas sino principio de politica publica.",
    citas: [{ texto: "Nuestro compromiso es erradicar la anemia y la desnutricion en la primera infancia. En una sociedad que atiende a los ninos y a los ancianos, los padres pueden salir a trabajar sin abandonarlos", ubicacion: "Debate JNE, bloque salud/primera infancia, Correo", indicador: "Principio de interdependencia de derechos sociales. No lista de promesas sino marco de politica — Estadio 5" }],
    estadioAlternativo: 4, notas: "Tema nuevo (primera infancia). Consistente con oleadas previas (5,5,5). Cuatro evaluaciones confirman razonamiento de principios universales." },

  // 26. Jaimes — educacion/Beca 18 y carrera tecnica
  // Oleadas previas: 1, 1, 2
  { id: "eval-oleada4-paul-davis-jaimes-blanco", entidadId: "paul-davis-jaimes-blanco", fuenteId: "f-oleada4-paul-davis-jaimes-blanco", estadio: 2, confianza: "media" as const,
    justificacion: "Propone que estudiantes terminen secundaria con carrera tecnica a nombre de la nacion, duplicar Beca 18, pagar deuda al magisterio. Las propuestas suenan positivas pero siguen logica transaccional: yo te doy titulo, beca, pago deuda. No articula reforma curricular ni como se garantiza calidad. Eliminar AFP y ATU muestran patron de destruir antes que reformar.",
    citas: [{ texto: "Los estudiantes van a terminar el quinto de secundaria con una carrera tecnica a nombre de la nacion como si fuera instituto. Vamos a duplicar Beca 18 y pagar al 100% la deuda con el magisterio", ubicacion: "Debate JNE quinta fecha, bloque educacion, Correo", indicador: "Transaccional: regalar titulos y pagos. No hay reforma de calidad ni marco institucional — Estadio 2" }],
    estadioAlternativo: 3, notas: "Tema nuevo (educacion). Se mantiene en estadio 1-2: patron de promesas transaccionales. Mejora relativa vs pena de muerte pero misma logica." },

  // 27. Ortiz Villano — educacion/industria y parques industriales
  // Oleadas previas: 2, 2, 3
  { id: "eval-oleada4-antonio-ortiz-villano", entidadId: "antonio-ortiz-villano", fuenteId: "f-oleada4-antonio-ortiz-villano", estadio: 3, confianza: "media" as const,
    justificacion: "Propone educacion conectada a industria, mineria y agroindustria, con parques industriales en cada region. Va mas alla del eslogan: articula que el pais debe pasar de exportar materia prima a producir con valor agregado, y que la educacion debe vincularse a ese objetivo. No es solo dar becas sino reformar el modelo productivo-educativo.",
    citas: [{ texto: "El pais debe pasar de exportar materia prima a producir con valor agregado a traves de educacion conectada a industria, mineria y agroindustria. Crearemos parques industriales en cada region", ubicacion: "Debate JNE sexta fecha, bloque educacion, Correo", indicador: "Vinculacion educacion-industria como vision de desarrollo. Mas que lista de promesas — Estadio 3" }],
    estadioAlternativo: 4, notas: "Tema nuevo (educacion/industria). Se mantiene en estadio 3: sube de 2 (oleadas 1-2) a 3 en educacion. La vision productiva es articulada pero parques industriales por region es grandilocuente." },

  // 28. Fernandez — salud/preventiva y unificar sistemas
  // Oleadas previas: 2, 1, 2
  { id: "eval-oleada4-rosario-del-pilar-fernandez-bazan", entidadId: "rosario-del-pilar-fernandez-bazan", fuenteId: "f-oleada4-rosario-del-pilar-fernandez-bazan", estadio: 2, confianza: "media" as const,
    justificacion: "Propone salud preventiva como eje, unificar EsSalud y Minsa, 4 ambulancias por posta, atencion 24/7. Las propuestas son una lista de deseos: unificar dos sistemas burocraticos gigantes requiere reforma legislativa y presupuestal que no articula. Cuatro ambulancias por posta es cifra arbitraria. Evaluaciones medicas obligatorias es enfoque autoritario de salud.",
    citas: [{ texto: "Vamos a unificar EsSalud y Minsa garantizando atencion 24/7 con un minimo de 4 ambulancias por establecimiento de salud. Evaluaciones medicas integrales y obligatorias para toda la poblacion", ubicacion: "Entrevista Andina, propuestas de salud", indicador: "Lista de deseos sin plan de implementacion. Evaluaciones obligatorias = enfoque autoritario — Estadio 2" }],
    estadioAlternativo: 3, notas: "Tema nuevo (salud). Consistente con oleadas previas (2,1,2). Patron de propuestas autoritarias sin marco institucional." },

  // 29. Chiabra — economia: genero, empleo juvenil, cadenas productivas
  // Oleadas previas: 4, 4, 4
  { id: "eval-oleada4-roberto-enrique-chiabra-leon", entidadId: "roberto-enrique-chiabra-leon", fuenteId: "f-oleada4-roberto-enrique-chiabra-leon", estadio: 4, confianza: "alta" as const,
    justificacion: "Propone eliminar brecha salarial entre hombres y mujeres, inclusion financiera para mujeres lideres de Mypes, bonos de cuidado infantil, empleo juvenil con incentivos tributarios, y cadenas productivas regionales integrando Mypes. El razonamiento es institucional y multidimensional: genero + empleo + Mypes + regiones. No son promesas sueltas sino un marco de politica de empleo con perspectiva de genero.",
    citas: [{ texto: "Vamos a eliminar la brecha salarial entre hombres y mujeres, dar inclusion financiera a mujeres lideres de Mypes, incentivos tributarios para primer empleo juvenil y cadenas productivas macro-regionales", ubicacion: "Debate JNE quinta fecha, bloque empleo, El Comercio", indicador: "Marco institucional multidimensional: genero + empleo + Mypes + regiones — Estadio 4" }],
    estadioAlternativo: 3, notas: "Tema nuevo (genero/empleo). Consistente con oleadas previas (4,4,4). Cuatro evaluaciones confirman razonamiento institucional en todo tema." },
];

async function main() {
  console.log(`\nRegistrando ${FUENTES.length} fuentes + ${EVALUACIONES.length} evaluaciones (Oleada 4 — Lote C)...\n`);

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

  console.log("\n=== OLEADA 4 LOTE C COMPLETADA (9 evaluaciones) ===\n");
}

main().catch(console.error);
