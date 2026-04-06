/**
 * Oleada 2 — Lote B: Segunda evaluacion por candidato (10 candidatos)
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
  // 1. Armando Masse — oleada 1 fue conciertos gratuitos (Infobae). Ahora: federalismo (RPP)
  { id: "f-oleada2-armando-joaquin-masse-fernandez", url: "https://rpp.pe/politica/elecciones/armando-masse-propone-un-sistema-de-gobierno-federal-que-acerque-el-estado-a-las-regiones-noticia-1672161", tipo: "entrevista", titulo: "Masse propone sistema de gobierno federal para acercar el Estado a las regiones", medio: "RPP", fechaFuente: "2026-03-15", entidadId: "armando-joaquin-masse-fernandez", estado: "evaluada" },

  // 2. Fernando Olivera — oleada 1 fue descalificacion rivales (Infobae). Ahora: expulsar generales corruptos (El Comercio)
  { id: "f-oleada2-luis-fernando-olivera-vega", url: "https://elcomercio.pe/politica/elecciones/debate-presidencial-jne-2026-candidato-fernando-olivera-participa-el-lunes-23-de-marzo-en-evento-previo-a-las-elecciones-generales-peru-2026-ultimas-noticia/", tipo: "debate", titulo: "Olivera: Expulsare a todos los generales y coroneles comprometidos con el crimen", medio: "El Comercio", fechaFuente: "2026-03-23", entidadId: "luis-fernando-olivera-vega", estado: "evaluada" },

  // 3. Mesias Guevara — oleada 1 fue cerrar congreso (Ojo Publico). Ahora: transparencia antidoto corrupcion (Infobae)
  { id: "f-oleada2-mesias-antonio-guevara-amasifuen", url: "https://www.infobae.com/peru/2026/04/01/mesias-guevara-del-partido-morado-a-rafael-lopez-aliaga-ha-dejado-endeudada-a-lima-por-mas-de-s-4-mil-millones/", tipo: "debate", titulo: "Guevara a Lopez Aliaga: Ha dejado endeudada a Lima por mas de S/4 mil millones", medio: "Infobae", fechaFuente: "2026-04-01", entidadId: "mesias-antonio-guevara-amasifuen", estado: "evaluada" },

  // 4. Carlos Alvarez Loayza — oleada 1 fue dignidad institucional (El Comercio). Ahora: pena de muerte sicarios (RPP)
  { id: "f-oleada2-carlos-gonzalo-alvarez-loayza", url: "https://rpp.pe/politica/elecciones/carlos-alvarez-propone-la-pena-de-muerte-para-sicarios-en-flagrancia-noticia-1681597", tipo: "debate", titulo: "Alvarez propone pena de muerte para sicarios en flagrancia", medio: "RPP", fechaFuente: "2026-03-23", entidadId: "carlos-gonzalo-alvarez-loayza", estado: "evaluada" },

  // 5. Herbert Caller — oleada 1 fue FFAA sobre PNP (El Comercio). Ahora: trasladar ministerios a regiones (RPP)
  { id: "f-oleada2-herbert-caller-gutierrez", url: "https://rpp.pe/politica/elecciones/herbert-caller-candidato-presidencial-del-ppp-plantea-trasladar-cinco-ministerios-a-regiones-noticia-1671255", tipo: "entrevista", titulo: "Caller plantea trasladar cinco ministerios a regiones", medio: "RPP", fechaFuente: "2026-03-10", entidadId: "herbert-caller-gutierrez", estado: "evaluada" },

  // 6. Yonhy Lescano — oleada 1 fue ataque personal (La Republica). Ahora: comprar satelite internet (El Comercio)
  { id: "f-oleada2-yonhy-lescano-ancieta", url: "https://elcomercio.pe/politica/yonhy-lescano-en-debate-presidencial-2026-lunes-30-incidentes-temas-pullas-y-planes-de-gobierno-previo-a-las-elecciones-generales-peru-2026-video-noticia/", tipo: "debate", titulo: "Lescano: Voy a comprar un satelite para internet gratuito a estudiantes y profesores", medio: "El Comercio", fechaFuente: "2026-03-30", entidadId: "yonhy-lescano-ancieta", estado: "evaluada" },

  // 7. Wolfgang Grozo — oleada 1 fue malas leyes (La Republica). Ahora: estados emergencia no sirven (Ojo Publico)
  { id: "f-oleada2-wolfgang-mario-grozo-costa", url: "https://ojo-publico.com/politica/elecciones-2026/wolfgang-grozo-los-estados-emergencia-no-sirven", tipo: "entrevista", titulo: "Grozo: Los estados de emergencia no sirven para la lucha contra la criminalidad", medio: "Ojo Publico", fechaFuente: "2026-03-20", entidadId: "wolfgang-mario-grozo-costa", estado: "evaluada" },

  // 8. Vladimir Cerron — oleada 1 fue disciplinar golpistas (Infobae). Ahora: entrevista desde clandestinidad (El Comercio)
  { id: "f-oleada2-vladimir-roy-cerron-rojas", url: "https://elcomercio.pe/politica/elecciones/vladimir-cerron-da-entrevista-en-vivo-desde-la-clandestinidad-y-asegura-que-permanece-en-el-peru-elecciones-2026-peru-libre-ultimas-noticia/", tipo: "entrevista", titulo: "Cerron da entrevista desde clandestinidad: permanece en Peru, pide asamblea constituyente", medio: "El Comercio", fechaFuente: "2026-03-28", entidadId: "vladimir-roy-cerron-rojas", estado: "evaluada" },

  // 9. Diez Canseco — oleada 1 fue Consejo Moral Publica (Andina). Ahora: Mano de Hierro contra corruptos (El Comercio)
  { id: "f-oleada2-francisco-ernesto-diez-canseco-tavara", url: "https://elcomercio.pe/politica/debate-presidencial-jne-candidato-francisco-diez-canseco-participa-el-martes-24-en-segunda-fecha-de-debate-previo-a-elecciones-2026-ultimas-noticia/", tipo: "debate", titulo: "Diez Canseco propone plan Mano de Hierro para botar corruptos de Policia, PJ y fiscalia", medio: "El Comercio", fechaFuente: "2026-03-24", entidadId: "francisco-ernesto-diez-canseco-tavara", estado: "evaluada" },

  // 10. Mario Vizcarra Cornejo — oleada 1 fue carceles en selva (Infobae debate). Ahora: choque con Chiabra sobre empleo (Infobae)
  { id: "f-oleada2-mario-enrique-vizcarra-cornejo", url: "https://www.infobae.com/peru/2026/04/01/debate-presidencial-2026-choque-entre-mario-vizcarra-y-roberto-chiabra-en-medio-de-propuestas-sobre-empleo-y-gestion-estatal/", tipo: "debate", titulo: "Vizcarra vs Chiabra: propuestas sobre empleo, Bono Emprendedor y meritocracia estatal", medio: "Infobae", fechaFuente: "2026-04-01", entidadId: "mario-enrique-vizcarra-cornejo", estado: "evaluada" },
];

const EVALUACIONES = [
  // 1. Armando Masse — federalismo como descentralizacion
  { id: "eval-oleada2-armando-joaquin-masse-fernandez", entidadId: "armando-joaquin-masse-fernandez", fuenteId: "f-oleada2-armando-joaquin-masse-fernandez", estadio: 2, confianza: "media" as const,
    justificacion: "Propuesta de federalismo enmarcada en logica transaccional: Lima asfixia a regiones, hay que repartir mejor. No articula principios institucionales claros.",
    citas: [{ texto: "El Peru es muy rico, pero la concentracion de Lima no permite que las industrias del interior se desarrollen, siempre estan asfixiadas por Lima", ubicacion: "Entrevista RPP", indicador: "Razonamiento instrumental: descentralizar para que regiones reciban mas recursos" }],
    estadioAlternativo: 3, notas: "Podria ser estadio 3 si se interpreta como busqueda de aprobacion regional, pero el framing es transaccional" },

  // 2. Fernando Olivera — expulsar generales corruptos
  { id: "eval-oleada2-luis-fernando-olivera-vega", entidadId: "luis-fernando-olivera-vega", fuenteId: "f-oleada2-luis-fernando-olivera-vega", estadio: 2, confianza: "media" as const,
    justificacion: "Promesa de purga unilateral sin mecanismo institucional. Logica transaccional: yo llego y los boto. Desaparicion de SUNAT como regalo a emprendedores.",
    citas: [{ texto: "Expulsare a todos los generales y coroneles comprometidos con el crimen", ubicacion: "Debate JNE primera fecha 23/03", indicador: "Accion unilateral sin proceso institucional, logica de poder personal" }],
    estadioAlternativo: 3, notas: "Tambien propone desaparecer SUNAT y crear Banco del Emprendedor — todo transaccional" },

  // 3. Mesias Guevara — transparencia como antidoto, critica a Lopez Aliaga
  { id: "eval-oleada2-mesias-antonio-guevara-amasifuen", entidadId: "mesias-antonio-guevara-amasifuen", fuenteId: "f-oleada2-mesias-antonio-guevara-amasifuen", estadio: 4, confianza: "media" as const,
    justificacion: "Apela a transparencia institucional y gobierno digital como mecanismo anticorrupcion. Critica a Lopez Aliaga con datos fiscales concretos, no ataques personales.",
    citas: [{ texto: "El antidoto contra la corrupcion es la transparencia y se logra con gobierno digital y vigilancia ciudadana", ubicacion: "Debate JNE quinta fecha", indicador: "Apelacion a mecanismos institucionales: transparencia, gobierno digital, contraloria" }],
    estadioAlternativo: 3, notas: "La critica a Lopez Aliaga por deuda de Lima podria ser oportunismo politico (estadio 3), pero se sustenta en datos fiscales" },

  // 4. Carlos Alvarez Loayza — pena de muerte para sicarios
  { id: "eval-oleada2-carlos-gonzalo-alvarez-loayza", entidadId: "carlos-gonzalo-alvarez-loayza", fuenteId: "f-oleada2-carlos-gonzalo-alvarez-loayza", estadio: 1, confianza: "media" as const,
    justificacion: "Propone pena de muerte y salida del Pacto de San Jose. Destruir mecanismo de derechos humanos para ejecutar castigo extremo. Contraste fuerte con oleada 1.",
    citas: [{ texto: "Pena de muerte por los sicarios en flagrancia. No merece la vida quien la quita", ubicacion: "Debate JNE primera fecha 23/03", indicador: "Castigo extremo como fin; destruccion de mecanismos de proteccion de derechos" }],
    estadioAlternativo: 2, notas: "Caida notable vs oleada 1 (estadio 4). Anti-ventriloquismo: esta propuesta es pre-convencional pura" },

  // 5. Herbert Caller — trasladar ministerios a regiones
  { id: "eval-oleada2-herbert-caller-gutierrez", entidadId: "herbert-caller-gutierrez", fuenteId: "f-oleada2-herbert-caller-gutierrez", estadio: 2, confianza: "media" as const,
    justificacion: "Propuesta de mover ministerios a regiones tiene logica instrumental: Produccion a Loreto porque hay bosques, Mineria a Arequipa porque hay minas. No hay marco institucional de descentralizacion.",
    citas: [{ texto: "Vamos a trasladar Produccion a Loreto, Medio Ambiente a Piura, Desarrollo Agrario a Junin, Energia y Minas a Arequipa y Cultura a Cusco", ubicacion: "Entrevista RPP", indicador: "Razonamiento instrumental: mover sedes por conveniencia geografica, sin reforma institucional" }],
    estadioAlternativo: 3, notas: "Mejora respecto a oleada 1 (estadio 1), pero sigue siendo instrumental" },

  // 6. Yonhy Lescano — comprar satelite para internet gratuito
  { id: "eval-oleada2-yonhy-lescano-ancieta", entidadId: "yonhy-lescano-ancieta", fuenteId: "f-oleada2-yonhy-lescano-ancieta", estadio: 2, confianza: "media" as const,
    justificacion: "Promesa grandilocuente y tecnomagica: comprar un satelite para resolver brecha digital. Logica transaccional: yo te doy internet gratis. Sin analisis de viabilidad.",
    citas: [{ texto: "Voy a comprar un satelite de telecomunicaciones para darle internet gratuito a los estudiantes, a los profesores y universidades", ubicacion: "Debate JNE cuarta fecha 30/03", indicador: "Promesa transaccional grandilocuente sin sustento tecnico ni institucional" }],
    estadioAlternativo: 3, notas: "Propuesta repetida de ciclos anteriores. Anti-ventriloquismo: estadio 2 por logica de intercambio" },

  // 7. Wolfgang Grozo — estados de emergencia no sirven, inteligencia si
  { id: "eval-oleada2-wolfgang-mario-grozo-costa", entidadId: "wolfgang-mario-grozo-costa", fuenteId: "f-oleada2-wolfgang-mario-grozo-costa", estadio: 4, confianza: "alta" as const,
    justificacion: "Critica institucional solida: los estados de emergencia no funcionan, hay que derogar leyes procriminalidad y fortalecer inteligencia. Propone reforma sistemica, no fuerza.",
    citas: [{ texto: "Los estados de emergencia no sirven para la lucha contra la criminalidad", ubicacion: "Entrevista Ojo Publico", indicador: "Critica a herramientas punitivas ineficaces; propone reforma institucional basada en inteligencia" }],
    estadioAlternativo: 5, notas: "Consistente con oleada 1 (estadio 4). Podria ser 5 por critica a leyes vigentes como ineficaces" },

  // 8. Vladimir Cerron — entrevista desde clandestinidad, asamblea constituyente
  { id: "eval-oleada2-vladimir-roy-cerron-rojas", entidadId: "vladimir-roy-cerron-rojas", fuenteId: "f-oleada2-vladimir-roy-cerron-rojas", estadio: 1, confianza: "alta" as const,
    justificacion: "Candidatea como profugo evadiendo sentencia judicial. Propone desmontar Constitucion de 1993 por revancha. La forma misma de su candidatura niega el estado de derecho.",
    citas: [{ texto: "Somos un partido por la revancha que busca desmontar el marco legal de la Constitucion de 1993", ubicacion: "Entrevista desde clandestinidad, El Comercio", indicador: "Desafio al estado de derecho; logica de revancha y poder, no de principios" }],
    estadioAlternativo: 2, notas: "Consistente con oleada 1 (estadio 1). La evasion de la justicia refuerza el pre-convencionalismo" },

  // 9. Diez Canseco — plan Mano de Hierro contra corruptos
  { id: "eval-oleada2-francisco-ernesto-diez-canseco-tavara", entidadId: "francisco-ernesto-diez-canseco-tavara", fuenteId: "f-oleada2-francisco-ernesto-diez-canseco-tavara", estadio: 3, confianza: "media" as const,
    justificacion: "Plan Mano de Hierro mezcla propuestas institucionales con retorica punitiva populista. Ataque personal a Sanchez en debate. La capacidad moral propia como argumento.",
    citas: [{ texto: "Vamos a botar a todos los corruptos de la Policia, del Poder Judicial y de la fiscalia con el plan Mano de Hierro", ubicacion: "Debate JNE segunda fecha 24/03", indicador: "Mezcla de reforma institucional con retorica populista y confrontacion personal" }],
    estadioAlternativo: 4, notas: "Baja respecto a oleada 1 (estadio 4). El tono confrontacional y la retorica del paredon bajan el estadio" },

  // 10. Mario Vizcarra Cornejo — Bono Emprendedor y meritocracia
  { id: "eval-oleada2-mario-enrique-vizcarra-cornejo", entidadId: "mario-enrique-vizcarra-cornejo", fuenteId: "f-oleada2-mario-enrique-vizcarra-cornejo", estadio: 2, confianza: "media" as const,
    justificacion: "Bono Emprendedor de S/5,000 a 200,000 emprendedores es transaccional puro. Defensa de meritocracia es positiva pero subordinada a promesas de reparto.",
    citas: [{ texto: "El Ministerio de Trabajo tendra las puertas abiertas para empleados y empleadores", ubicacion: "Debate JNE quinta fecha 01/04", indicador: "Mezcla transaccional: bonos directos + discurso de meritocracia sin marco institucional claro" }],
    estadioAlternativo: 3, notas: "Mejora respecto a oleada 1 (estadio 1) por el discurso de meritocracia, pero el Bono Emprendedor es instrumental" },
];

async function main() {
  console.log(`\nRegistrando ${FUENTES.length} fuentes + ${EVALUACIONES.length} evaluaciones (Oleada 2 — Lote B)...\n`);

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

  console.log("\n=== OLEADA 2 LOTE B COMPLETADA (10 evaluaciones) ===\n");
}

main().catch(console.error);
