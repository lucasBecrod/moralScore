/**
 * Oleada 4, Lote B — Cuarta evaluacion por candidato (10 candidatos)
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
  // 11. Masse — educacion: anemia y ceguera por cataratas (NO conciertos, NO federalismo, NO industrializacion)
  { id: "f-oleada4-armando-joaquin-masse-fernandez", url: "https://elcomercio.pe/politica/armando-masse-participa-en-el-debate-presidencial-2026-miercoles-31-sexta-y-ultima-jornada-incidentes-temas-pullas-y-planes-de-gobierno-previo-a-las-elecciones-generales-peru-2026-video-noticia/", tipo: "debate", titulo: "Masse: acabar con anemia infantil y erradicar ceguera por cataratas", medio: "El Comercio", fechaFuente: "2026-04-01", entidadId: "armando-joaquin-masse-fernandez", estado: "evaluada" },

  // 12. Olivera — salud: presupuesto 7% PBI, mineria primer mundo (NO descalificacion, NO generales, NO revocatoria)
  { id: "f-oleada4-luis-fernando-olivera-vega", url: "https://andina.pe/agencia/noticia-elecciones-2026-fernando-olivera-plantea-reformas-materia-economica-1062076.aspx", tipo: "entrevista", titulo: "Olivera: reformas economicas, mineria de primer mundo y salud al 7% PBI", medio: "Andina", fechaFuente: "2026-03-10", entidadId: "luis-fernando-olivera-vega", estado: "evaluada" },

  // 13. Guevara — medio ambiente: bases amazonia contra mineria ilegal (NO cerrar congreso, NO transparencia, NO Beca 18)
  { id: "f-oleada4-mesias-antonio-guevara-amasifuen", url: "https://caretas.pe/politica/debate-presidencial-2026-conoce-las-propuestas-de-mesias-guevara/", tipo: "debate", titulo: "Guevara: bases permanentes en Amazonia contra mineria ilegal", medio: "Caretas", fechaFuente: "2026-03-31", entidadId: "mesias-antonio-guevara-amasifuen", estado: "evaluada" },

  // 14. Alvarez Loayza — salud: cerrar brecha hospitalaria y salud mental (NO dignidad, NO pena muerte, NO inteligencia)
  { id: "f-oleada4-carlos-gonzalo-alvarez-loayza", url: "https://rpp.pe/politica/elecciones/elecciones-2026-carlos-alvarez-propone-cerrar-brechas-de-infraestructura-hospitalaria-noticia-1683040", tipo: "debate", titulo: "Alvarez: cerrar brechas hospitalarias y atencion a salud mental", medio: "RPP", fechaFuente: "2026-04-02", entidadId: "carlos-gonzalo-alvarez-loayza", estado: "evaluada" },

  // 15. Caller — salud: hospitales modulares e infraestructura (NO FFAA, NO ministerios regiones, NO educativa)
  { id: "f-oleada4-herbert-caller-gutierrez", url: "https://www.tvperu.gob.pe/noticias/politica/tu-decision-2026-planes-de-gobierno-de-herbert-caller-gutierrez-del-partido-patriotico-del-peru", tipo: "entrevista", titulo: "Caller: hospitales modulares y descentralizacion de ministerios ambientales", medio: "TVPeru", fechaFuente: "2026-03-05", entidadId: "herbert-caller-gutierrez", estado: "evaluada" },

  // 16. Lescano — educacion: reconstruir 22 mil colegios, formalizacion microempresas (NO ataque personal, NO satelite, NO conducta)
  { id: "f-oleada4-yonhy-lescano-ancieta", url: "https://www.infobae.com/peru/2026/03/23/debate-presidencial-2026-del-jne-yonhy-lescano-de-cooperacion-popular-participa-en-la-primera-jornada-de-hoy-lunes-23-de-marzo/", tipo: "debate", titulo: "Lescano: reconstruir 22 mil colegios y formalizar microempresas sin sancionarlas", medio: "Infobae", fechaFuente: "2026-03-23", entidadId: "yonhy-lescano-ancieta", estado: "evaluada" },

  // 17. Grozo — educacion: duplicar Beca 18 y data centers (NO malas leyes, NO emergencias, NO megacarceles)
  { id: "f-oleada4-wolfgang-mario-grozo-costa", url: "https://www.infobae.com/peru/2026/04/02/wolfgang-grozo-en-debate-presidencial-2026-promesa-de-duplicar-beca-18-y-construir-data-centers-para-la-educacion-publica/", tipo: "debate", titulo: "Grozo: duplicar Beca 18, Becas por Impuestos, data centers educativos", medio: "Infobae", fechaFuente: "2026-04-02", entidadId: "wolfgang-mario-grozo-costa", estado: "evaluada" },

  // 18. Cerron — salud: sistema unico universal y gratuito (NO disciplinar, NO clandestinidad, NO Modulo 24)
  { id: "f-oleada4-vladimir-roy-cerron-rojas", url: "https://andina.pe/agencia/noticia-elecciones-2026-conoce-plan-gobierno-vladimir-cerron-rojas-1065379.aspx", tipo: "articulo", titulo: "Plan de gobierno Cerron: sistema unico de salud universal y gratuito", medio: "Andina", fechaFuente: "2026-04-01", entidadId: "vladimir-roy-cerron-rojas", estado: "evaluada" },

  // 19. Diez Canseco — agricultura: Agrobanco sin corrupcion para pequenos agricultores (NO Consejo Moral, NO Mano Hierro, NO IGV)
  { id: "f-oleada4-francisco-ernesto-diez-canseco-tavara", url: "https://rpp.pe/politica/elecciones/debate-presidencial-estas-son-las-propuestas-de-11-candidatos-sobre-educacion-innovacion-y-tecnologia-noticia-1682453", tipo: "debate", titulo: "Diez Canseco: Agrobanco sin corrupcion y educacion tecnica con becas", medio: "RPP", fechaFuente: "2026-04-01", entidadId: "francisco-ernesto-diez-canseco-tavara", estado: "evaluada" },

  // 20. Vizcarra — educacion: deuda social docentes y salud/postas (NO carceles selva, NO Bono Emprendedor, NO reforma electoral)
  { id: "f-oleada4-mario-enrique-vizcarra-cornejo", url: "https://diariocorreo.pe/politica/paul-jaimes-herbert-caller-y-mario-vizcarra-exponen-propuestas-educativas-en-el-quinto-dia-de-debate-presidencial-jne-elecciones-2026-en-vivo-noticia/", tipo: "debate", titulo: "Vizcarra: reconocer deuda social docentes y llenar Peru de postas medicas", medio: "Correo", fechaFuente: "2026-03-31", entidadId: "mario-enrique-vizcarra-cornejo", estado: "evaluada" },
];

const EVALUACIONES = [
  // 11. Armando Masse — salud: anemia y cataratas
  // Oleadas previas: 2, 2, 2
  { id: "eval-oleada4-armando-joaquin-masse-fernandez", entidadId: "armando-joaquin-masse-fernandez", fuenteId: "f-oleada4-armando-joaquin-masse-fernandez", estadio: 2, confianza: "media" as const,
    justificacion: "Propone acabar con anemia infantil usando tecnologia para monitorear hemoglobina en tiempo real y erradicar ceguera por cataratas. Las propuestas suenan tecnicas pero son slogans de debate: no articula plan de implementacion, financiamiento ni cadena de atencion. Logica transaccional: yo traigo la tecnologia, se resuelve el problema.",
    citas: [{ texto: "El 43.7% de ninos sufre de anemia. Vamos a utilizar la tecnologia para monitorear la hemoglobina en tiempo real y darle tratamiento integral", ubicacion: "Debate JNE sexta fecha, bloque salud, El Comercio", indicador: "Solucion tecnomagica: tecnologia como respuesta sin plan de implementacion — Estadio 2 transaccional" }],
    estadioAlternativo: 3, notas: "Tema nuevo (salud infantil). Consistente con oleadas previas (2,2,2). Cuatro evaluaciones confirman patron transaccional." },

  // 12. Fernando Olivera — economia/mineria responsable
  // Oleadas previas: 2, 2, 2
  { id: "eval-oleada4-luis-fernando-olivera-vega", entidadId: "luis-fernando-olivera-vega", fuenteId: "f-oleada4-luis-fernando-olivera-vega", estadio: 2, confianza: "media" as const,
    justificacion: "Propone mineria de primer mundo responsable con medio ambiente y presupuesto de salud al 7% del PBI. La logica es: capitalizar riquezas para invertir en servicios. No hay principio articulado de politica ambiental ni marco institucional. Mineria responsable es eslogan sin desarrollo.",
    citas: [{ texto: "El Peru es un pais minero y nosotros debemos capitalizar toda esa riqueza para poder invertir en educacion, salud y seguridad", ubicacion: "Entrevista Andina, reformas economicas", indicador: "Transaccional: extraer riquezas para repartir en servicios. Sin principio ambiental — Estadio 2" }],
    estadioAlternativo: 3, notas: "Tema nuevo (economia/mineria). Consistente con oleadas previas (2,2,2). Cuatro evaluaciones confirman patron transaccional." },

  // 13. Mesias Guevara — medio ambiente/Amazonia
  // Oleadas previas: 3, 4, 3
  { id: "eval-oleada4-mesias-antonio-guevara-amasifuen", entidadId: "mesias-antonio-guevara-amasifuen", fuenteId: "f-oleada4-mesias-antonio-guevara-amasifuen", estadio: 4, confianza: "media" as const,
    justificacion: "Propone 8 bases operacionales permanentes en Amazonia con helicopteros, drones y personal rotativo contra mineria ilegal, tala y narcotrafico. Tambien propone renegociar contratos mineros y gravar sobreganancias. Es la propuesta mas institucional: bases permanentes (no operativos esporadicos), equipamiento y personal rotativo. Articula defensa de Amazonia como politica de Estado, no como slogan.",
    citas: [{ texto: "Crearemos 8 bases operacionales permanentes en zonas criticas de la Amazonia con infraestructura, helicopteros, botes rapidos, drones y personal rotativo para erradicar mineria ilegal, tala y narcotrafico", ubicacion: "Debate JNE / Caretas, propuestas medio ambiente", indicador: "Propuesta institucional concreta: bases permanentes, equipamiento, personal — Estadio 4 (politica de Estado)" }],
    estadioAlternativo: 3, notas: "Tema nuevo (medio ambiente/Amazonia). Sube de 3 a 4: en defensa ambiental articula propuesta institucional con mecanismos concretos. Techo debate no aplica porque la propuesta es especifica y operativa." },

  // 14. Carlos Alvarez Loayza — salud/brecha hospitalaria y salud mental
  // Oleadas previas: 4, 1, 4
  { id: "eval-oleada4-carlos-gonzalo-alvarez-loayza", entidadId: "carlos-gonzalo-alvarez-loayza", fuenteId: "f-oleada4-carlos-gonzalo-alvarez-loayza", estadio: 4, confianza: "media" as const,
    justificacion: "Propone compra masiva de medicamentos via central nacional, cerrar brecha hospitalaria, y alerta sobre falta de psiquiatras que deja a jovenes vulnerables. El diagnostico es sistemico: identifica que la falta de farmacos en postas es critica, y la salud mental es invisible. Propone historial clinico unificado publico-privado. Es razonamiento institucional con cadena causal.",
    citas: [{ texto: "La falta de farmacos en las postas medicas es una preocupacion critica. Proponemos una compra masiva de medicamentos a traves de una central nacional que funcione de manera efectiva, y un historial clinico unificado", ubicacion: "Debate JNE, bloque salud, RPP", indicador: "Diagnostico sistemico + mecanismo institucional concreto (central de compras, historial unificado) — Estadio 4" }],
    estadioAlternativo: 3, notas: "Tema nuevo (salud). Se mantiene en estadio 4: consistente con oleadas 1 y 3. Tres de cuatro evaluaciones dan estadio 4." },

  // 15. Herbert Caller — salud: hospitales modulares
  // Oleadas previas: 1, 2, 2
  { id: "eval-oleada4-herbert-caller-gutierrez", entidadId: "herbert-caller-gutierrez", fuenteId: "f-oleada4-herbert-caller-gutierrez", estadio: 2, confianza: "media" as const,
    justificacion: "Propone hospitales modulares armables que se convierten en bienes muebles sin traba burocratica. La idea suena innovadora pero es solucion magica: en un mes construyes un hospital. No articula personal, equipo, cadena de suministro. Piura como laboratorio climatologico es declaracion sin plan.",
    citas: [{ texto: "Nuestra propuesta busca pasar del concepto de infraestructura como bienes inmuebles al concepto modular, armables, que se convierten en bienes muebles sin traba burocratica. En un mes se estaria construyendo un hospital", ubicacion: "Entrevista TVPeru Tu Decision 2026", indicador: "Solucion magica: hospitales en un mes. Tecnomagico sin plan de operacion — Estadio 2" }],
    estadioAlternativo: 3, notas: "Tema nuevo (salud/infraestructura modular). Consistente con oleadas previas (1,2,2). Patron de soluciones magicas importadas." },

  // 16. Yonhy Lescano — educacion/colegios y formalizacion
  // Oleadas previas: 2, 2, 3
  { id: "eval-oleada4-yonhy-lescano-ancieta", entidadId: "yonhy-lescano-ancieta", fuenteId: "f-oleada4-yonhy-lescano-ancieta", estadio: 2, confianza: "media" as const,
    justificacion: "Promete reconstruir 22 mil colegios y formalizar microempresas sin sancionarlas. La cifra de 22 mil colegios es grandilocuente sin plan de financiamiento. Formalizar sin sancionar es transaccional: el Estado te da beneficios a cambio de que te formalices. No hay principio de derecho a la educacion articulado.",
    citas: [{ texto: "Vamos a reconstruir 22 mil colegios publicos y a formalizar las microempresas sin sancionarlas, dandoles incentivos para que se integren al sistema", ubicacion: "Debate JNE primera fecha, Infobae", indicador: "Promesas grandilocuentes (22 mil colegios). Formalizacion como transaccion sin reforma — Estadio 2" }],
    estadioAlternativo: 3, notas: "Tema nuevo (educacion/formalizacion). Se mantiene en estadio 2: consistente con oleadas 1 y 2. La cifra de 22 mil colegios es inviable en un quinquenio." },

  // 17. Wolfgang Grozo — educacion/Beca 18 y data centers
  // Oleadas previas: 4, 4, 3
  { id: "eval-oleada4-wolfgang-mario-grozo-costa", entidadId: "wolfgang-mario-grozo-costa", fuenteId: "f-oleada4-wolfgang-mario-grozo-costa", estadio: 4, confianza: "media" as const,
    justificacion: "Propone duplicar presupuesto de Beca 18, crear programa Becas por Impuestos (sector privado financia a cambio de beneficio tributario), becas para docentes con cooperacion internacional, y data centers para conectividad educativa. Es propuesta institucional articulada: mecanismo publico-privado (Becas por Impuestos), formacion docente, infraestructura digital.",
    citas: [{ texto: "Vamos a duplicar Beca 18, implementar Becas por Impuestos donde el sector privado financia formacion a cambio de beneficios tributarios, y construir dos data centers para garantizar conectividad educativa", ubicacion: "Debate JNE ultima fecha, bloque educacion, Infobae", indicador: "Mecanismo institucional publico-privado. Propuesta articulada con multiples componentes — Estadio 4" }],
    estadioAlternativo: 3, notas: "Tema nuevo (educacion). Sube de 3 a 4: en educacion Grozo articula mecanismos institucionales (Becas por Impuestos). Debate pero propuesta especifica, no eslogan." },

  // 18. Vladimir Cerron — salud: sistema unico universal
  // Oleadas previas: 1, 1, 1
  { id: "eval-oleada4-vladimir-roy-cerron-rojas", entidadId: "vladimir-roy-cerron-rojas", fuenteId: "f-oleada4-vladimir-roy-cerron-rojas", estadio: 1, confianza: "alta" as const,
    justificacion: "Plan de gobierno propone sistema unico de salud universal, gratuito, preventivo, financiado y conducido por el Estado. Suena a estadio 4-5 pero anti-ventriloquismo: es profugo proponiendo control estatal absoluto de la salud. La palabra clave es 'conducido por el Estado' — no articula participacion ciudadana, autonomia medica ni contrapesos. Es concentracion de poder disfrazada de universalidad.",
    citas: [{ texto: "Implementar un sistema unico de salud universal, gratuito, preventivo e integrado, financiado y conducido por el Estado, que garantice atencion oportuna y equitativa", ubicacion: "Plan de gobierno Peru Libre, Andina", indicador: "Control estatal absoluto sin contrapesos. Profugo proponiendo concentracion de poder en salud — Estadio 1" }],
    estadioAlternativo: 2, notas: "Tema nuevo (salud). Consistente con oleadas previas (1,1,1). Anti-ventriloquismo: el lenguaje de universalidad oculta concentracion de poder. Cuatro evaluaciones confirman estadio 1." },

  // 19. Francisco Diez Canseco — agricultura/Agrobanco
  // Oleadas previas: 4, 3, 4
  { id: "eval-oleada4-francisco-ernesto-diez-canseco-tavara", entidadId: "francisco-ernesto-diez-canseco-tavara", fuenteId: "f-oleada4-francisco-ernesto-diez-canseco-tavara", estadio: 3, confianza: "media" as const,
    justificacion: "Propone que Agrobanco funcione sin corrupcion y apoye a pequenos agricultores. Tambien propone formacion tecnica con becas. El diagnostico es correcto (Agrobanco corrupto) pero la solucion es moralista: 'sin corrupcion'. No articula mecanismos anticorrupcion concretos. Apela a ser buen gestor, no a reformar instituciones.",
    citas: [{ texto: "El Agrobanco va a funcionar sin corrupcion y va a brindar apoyo a los pequenos agricultores del Peru", ubicacion: "Debate JNE, respuesta a pregunta sobre brechas agrarias, RPP", indicador: "Solucion moralista: prometer gestion limpia sin mecanismo anticorrupcion concreto — Estadio 3 (buen chico)" }],
    estadioAlternativo: 4, notas: "Tema nuevo (agricultura). Baja de 4 a 3: en agricultura Diez Canseco apela a moralidad personal (sin corrupcion) en vez de reforma institucional. Consistente con oleada 2 (Mano de Hierro = estadio 3)." },

  // 20. Mario Vizcarra Cornejo — educacion/deuda docente y postas medicas
  // Oleadas previas: 1, 2, 2
  { id: "eval-oleada4-mario-enrique-vizcarra-cornejo", entidadId: "mario-enrique-vizcarra-cornejo", fuenteId: "f-oleada4-mario-enrique-vizcarra-cornejo", estadio: 2, confianza: "media" as const,
    justificacion: "Promete reconocer deuda social docente y 'llenar Peru de postas medicas'. La deuda social es un derecho ganado pero Vizcarra lo usa como promesa electoral, no como principio de justicia. Llenar de postas es grandilocuente sin plan de personal ni financiamiento. Logica transaccional: yo pago deuda, docentes me apoyan.",
    citas: [{ texto: "Vamos a reconocer inmediatamente el pago de la deuda social, un derecho ganado por todos los profesores. Y vamos a llenar el Peru de postas medicas", ubicacion: "Debate JNE quinta fecha, bloque educacion/salud, Correo", indicador: "Promesas grandilocuentes: deuda social como transaccion electoral, postas sin plan — Estadio 2" }],
    estadioAlternativo: 3, notas: "Tema nuevo (educacion + salud). Consistente con oleadas 2 y 3 (estadio 2). La deuda social podria ser estadio 3 si se enmarca en justicia laboral." },
];

async function main() {
  console.log(`\nRegistrando ${FUENTES.length} fuentes + ${EVALUACIONES.length} evaluaciones (Oleada 4 — Lote B)...\n`);

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

  console.log("\n=== OLEADA 4 LOTE B COMPLETADA (10 evaluaciones) ===\n");
}

main().catch(console.error);
