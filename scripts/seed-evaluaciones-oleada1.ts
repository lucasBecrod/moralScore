/**
 * Oleada 1 — 29 candidatos nuevos evaluados desde debates JNE y entrevistas
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

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const FUENTES = [
  // LOTE A
  { id: "f-oleada1-ronald-darwin-atencio-sotomayor", url: "https://www.infobae.com/peru/2026/03/25/debate-presidencial-peru-2026-en-vivo-hoy-tercera-fecha-con-12-postulantes-temas-clave-y-el-minuto-a-minuto-del-encuentro-del-25-de-marzo/", tipo: "debate", titulo: "Atencio: critica al neoliberalismo y defensa de mineros artesanales", medio: "Infobae", fechaFuente: "2026-03-25", entidadId: "ronald-darwin-atencio-sotomayor", estado: "evaluada" },
  { id: "f-oleada1-jose-daniel-williams-zapata", url: "https://gestion.pe/peru/politica/jose-williams-candidato-de-avanza-pais-apuesta-por-un-estado-de-guerra-contra-la-delincuencia-noticia/", tipo: "debate", titulo: "Williams propone estado de guerra contra la delincuencia", medio: "Gestion", fechaFuente: "2026-03-23", entidadId: "jose-daniel-williams-zapata", estado: "evaluada" },
  { id: "f-oleada1-alvaro-gonzalo-paz-de-la-barra-freigeiro", url: "https://www.infobae.com/peru/2026/03/25/expulsion-de-migrantes-chapa-tu-corrupto-y-pacificacion-del-peru-en-100-dias-las-propuestas-de-alvaro-paz-de-la-barra-en-el-debate-presidencial/", tipo: "debate", titulo: "Paz de la Barra: corrupto y criminal no tiene debido proceso", medio: "Infobae", fechaFuente: "2026-03-25", entidadId: "alvaro-gonzalo-paz-de-la-barra-freigeiro", estado: "evaluada" },
  { id: "f-oleada1-fiorella-giannina-molinelli-aristondo", url: "https://www.infobae.com/peru/2026/03/25/asi-fue-la-acalorada-discusion-entre-fiorella-molinelli-y-roberto-sanchez-criticas-a-pedro-castillo-floro-y-la-aparicion-de-cerron/", tipo: "debate", titulo: "Molinelli confronta a Sanchez sobre Cerron", medio: "Infobae", fechaFuente: "2026-03-25", entidadId: "fiorella-giannina-molinelli-aristondo", estado: "evaluada" },
  { id: "f-oleada1-roberto-helbert-sanchez-palomino", url: "https://www.infobae.com/peru/2026/03/25/roberto-sanchez-afirma-que-el-peru-necesita-una-nueva-constitucion-y-sostiene-que-pedro-castillo-esta-secuestrado/", tipo: "debate", titulo: "Sanchez pide nueva Constitucion y defiende a Castillo", medio: "Infobae", fechaFuente: "2026-03-25", entidadId: "roberto-helbert-sanchez-palomino", estado: "evaluada" },
  { id: "f-oleada1-rafael-jorge-belaunde-llosa", url: "https://gestion.pe/peru/politica/rafael-belaunde-busca-financiar-becas-anuales-con-canon-minero-lo-que-dijo-en-el-debate-presidencial-noticia/", tipo: "debate", titulo: "Belaunde: 50,000 becas con canon minero, inversion privada", medio: "Gestion", fechaFuente: "2026-03-30", entidadId: "rafael-jorge-belaunde-llosa", estado: "evaluada" },
  { id: "f-oleada1-pitter-enrique-valderrama-pena", url: "https://www.infobae.com/peru/2026/03/26/enrique-valderrama-candidato-del-apra-propone-reforzar-fronteras-duplicar-efectivos-policiales-y-sancionar-la-corrupcion/", tipo: "debate", titulo: "Valderrama (APRA): cadena perpetua para funcionarios corruptos", medio: "Infobae", fechaFuente: "2026-03-26", entidadId: "pitter-enrique-valderrama-pena", estado: "evaluada" },
  { id: "f-oleada1-ricardo-pablo-belmont-cassinelli", url: "https://elcomercio.pe/politica/ricardo-belmont-participa-en-debate-presidencial-2026-martes-31-incidentes-temas-pullas-y-planes-de-gobierno-previo-a-las-elecciones-generales-peru-2026-video-noticia/", tipo: "debate", titulo: "Belmont: educacion como prioridad y ultima batalla politica", medio: "El Comercio", fechaFuente: "2026-03-31", entidadId: "ricardo-pablo-belmont-cassinelli", estado: "evaluada" },
  { id: "f-oleada1-charlie-carrasco-salazar", url: "https://www.infobae.com/peru/2026/03/24/debate-presidencial-2026-en-vivo-minuto-a-minuto-de-la-segunda-fecha-hoy-martes-24-de-marzo-con-11-candidatos-temas-bloques-e-incidencias-previo-a-elecciones/", tipo: "debate", titulo: "Carrasco: gobernar con principios biblicos, expulsar migrantes en 48h", medio: "Infobae", fechaFuente: "2026-03-24", entidadId: "charlie-carrasco-salazar", estado: "evaluada" },
  { id: "f-oleada1-alex-gonzales-castillo", url: "https://larepublica.pe/politica/2026/03/23/alex-gonzales-increpa-a-rafael-lopez-aliaga-nos-dejo-a-lima-como-potencia-mundial-del-crimen-hnews-1191216", tipo: "debate", titulo: "Gonzales increpa a Lopez Aliaga por inseguridad en Lima", medio: "La Republica", fechaFuente: "2026-03-23", entidadId: "alex-gonzales-castillo", estado: "evaluada" },

  // LOTE B
  { id: "f-oleada1-armando-joaquin-masse-fernandez", url: "https://www.infobae.com/peru/2026/04/02/candidato-armando-masse-plantea-conciertos-gratuitos-de-grupo-5-y-agua-marina-impulsados-por-el-estado-necesitan-alegria/", tipo: "articulo", titulo: "Masse: conciertos gratuitos impulsados por el Estado", medio: "Infobae", fechaFuente: "2026-04-02", entidadId: "armando-joaquin-masse-fernandez", estado: "evaluada" },
  { id: "f-oleada1-luis-fernando-olivera-vega", url: "https://www.infobae.com/peru/2026/03/31/fernando-olivera-lanza-polemica-frase-en-debate-presidencial-cuando-un-pueblo-sabe-no-lo-engana-una-japonesa-un-ladronzuelo-un-mitomano/", tipo: "debate", titulo: "Olivera: polemica frase descalificadora en debate", medio: "Infobae", fechaFuente: "2026-03-31", entidadId: "luis-fernando-olivera-vega", estado: "evaluada" },
  { id: "f-oleada1-mesias-antonio-guevara-amasifuen", url: "https://ojo-publico.com/politica/elecciones-2026/guevara-si-el-congreso-es-un-obstaculo-no-tendre-reparos-cerrarlo", tipo: "entrevista", titulo: "Guevara: si el Congreso es obstaculo, no tendre reparos en cerrarlo", medio: "Ojo Publico", fechaFuente: "2026-03-18", entidadId: "mesias-antonio-guevara-amasifuen", estado: "evaluada" },
  { id: "f-oleada1-carlos-gonzalo-alvarez-loayza", url: "https://elcomercio.pe/politica/elecciones-2026-carlos-alvarez-loayza-candidato-presidencial-de-pais-para-todos-tenemos-que-recuperar-la-dignidad-de-la-institucion-presidencial-12-de-abril-noticia/", tipo: "entrevista", titulo: "Alvarez: recuperar la dignidad de la institucion presidencial", medio: "El Comercio", fechaFuente: "2026-04-01", entidadId: "carlos-gonzalo-alvarez-loayza", estado: "evaluada" },
  { id: "f-oleada1-herbert-caller-gutierrez", url: "https://elcomercio.pe/politica/elecciones/herbert-caller-en-foro-de-candidatos-las-fuerzas-armadas-van-a-estar-al-mando-de-la-policia-nacional-del-peru-ultimas-noticia/", tipo: "debate", titulo: "Caller: FFAA al mando de la Policia Nacional", medio: "El Comercio", fechaFuente: "2026-03-25", entidadId: "herbert-caller-gutierrez", estado: "evaluada" },
  { id: "f-oleada1-yonhy-lescano-ancieta", url: "https://larepublica.pe/politica/2026/03/30/yonhy-lescano-llama-telonero-de-fujimori-a-carlos-alvarez-no-voy-a-permitir-que-me-de-clases-de-moral-hnews-2839080", tipo: "debate", titulo: "Lescano llama telonero de Fujimori a Carlos Alvarez", medio: "La Republica", fechaFuente: "2026-03-30", entidadId: "yonhy-lescano-ancieta", estado: "evaluada" },
  { id: "f-oleada1-wolfgang-mario-grozo-costa", url: "https://larepublica.pe/politica/2026/03/18/wolfgang-grozo-el-problema-no-es-que-faltan-leyes-sino-que-sobran-malas-leyes-y-dadas-con-nombre-propio-hnews-897660", tipo: "entrevista", titulo: "Grozo: el problema no es que faltan leyes, sino que sobran malas leyes", medio: "La Republica", fechaFuente: "2026-03-18", entidadId: "wolfgang-mario-grozo-costa", estado: "evaluada" },
  { id: "f-oleada1-vladimir-roy-cerron-rojas", url: "https://www.infobae.com/peru/2025/12/07/vladimir-cerron-afirma-que-ganara-las-elecciones-2026-pese-a-estar-profugo-hay-que-disciplinar-a-los-golpistas-y-traidores/", tipo: "articulo", titulo: "Cerron: ganar elecciones desde clandestinidad, disciplinar golpistas", medio: "Infobae", fechaFuente: "2025-12-07", entidadId: "vladimir-roy-cerron-rojas", estado: "evaluada" },
  { id: "f-oleada1-francisco-ernesto-diez-canseco-tavara", url: "https://andina.pe/agencia/noticia-elecciones-2026-diez-canseco-propone-crear-consejo-nacional-moral-publica-1060577.aspx", tipo: "entrevista", titulo: "Diez-Canseco: crear Consejo Nacional de Moral Publica", medio: "Andina", fechaFuente: "2026-03-10", entidadId: "francisco-ernesto-diez-canseco-tavara", estado: "evaluada" },
  { id: "f-oleada1-mario-enrique-vizcarra-cornejo", url: "https://www.infobae.com/peru/2026/03/26/debate-presidencial-las-propuestas-de-mario-vizcarra-de-cara-a-las-elecciones-2026/", tipo: "debate", titulo: "Vizcarra Cornejo: presos a la selva para que se arrepientan", medio: "Infobae", fechaFuente: "2026-03-26", entidadId: "mario-enrique-vizcarra-cornejo", estado: "evaluada" },

  // LOTE C
  { id: "f-oleada1-walter-gilmer-chirinos-purizaga", url: "https://andina.pe/agencia/noticia-elecciones-2026-walter-chirinos-del-prin-propone-estado-excepcion-contra-criminalidad-1061053.aspx", tipo: "debate", titulo: "Chirinos: estado de excepcion con control policial y militar", medio: "Andina", fechaFuente: "2026-03-24", entidadId: "walter-gilmer-chirinos-purizaga", estado: "evaluada" },
  { id: "f-oleada1-alfonso-carlos-espa-y-garces-alvear", url: "https://elcomercio.pe/politica/carlos-espa-en-debate-presidencial-2026-lunes-30-incidentes-temas-pullas-y-planes-de-gobierno-previo-a-las-elecciones-generales-peru-2026-video-noticia/", tipo: "debate", titulo: "Espa: romper el pacto infame de corrupcion", medio: "El Comercio", fechaFuente: "2026-03-30", entidadId: "alfonso-carlos-espa-y-garces-alvear", estado: "evaluada" },
  { id: "f-oleada1-carlos-ernesto-jaico-carranza", url: "https://elcomercio.pe/politica/elecciones/carlos-jaico-trabajaremos-para-que-la-seguridad-sea-una-realidad-con-la-reforma-total-de-la-policia-peru-moderno-ultimas-elecciones-2026-noticia/", tipo: "debate", titulo: "Jaico: reforma policial total y muerte civil para corruptos", medio: "El Comercio", fechaFuente: "2026-03-17", entidadId: "carlos-ernesto-jaico-carranza", estado: "evaluada" },
  { id: "f-oleada1-jose-leon-luna-galvez", url: "https://elcomercio.pe/politica/elecciones/jose-luna-galvez-aseguramos-que-en-seis-meses-se-acaba-la-extorsion-y-sicariato-ultimas-noticia/", tipo: "debate", titulo: "Luna Galvez: en 6 meses se acaba la extorsion y sicariato", medio: "El Comercio", fechaFuente: "2026-03-17", entidadId: "jose-leon-luna-galvez", estado: "evaluada" },
  { id: "f-oleada1-maria-soledad-perez-tello-de-rodriguez", url: "https://elcomercio.pe/politica/elecciones/elecciones-generales-2026-marisol-perez-tello-asegura-que-su-candidatuta-es-un-incidente-lo-que-defiendo-son-principios-y-valores-en-democracia-ultimas-noticia/", tipo: "entrevista", titulo: "Perez Tello: mi candidatura es un incidente, defiendo principios", medio: "El Comercio", fechaFuente: "2026-03-23", entidadId: "maria-soledad-perez-tello-de-rodriguez", estado: "evaluada" },
  { id: "f-oleada1-paul-davis-jaimes-blanco", url: "https://rpp.pe/politica/elecciones/paul-jaimes-candidato-de-progresemos-propone-salida-de-la-corte-idh-y-medidas-frente-a-la-inseguridad-noticia-1673563", tipo: "entrevista", titulo: "Jaimes: pena de muerte y salida de Corte IDH", medio: "RPP", fechaFuente: "2026-03-25", entidadId: "paul-davis-jaimes-blanco", estado: "evaluada" },
  { id: "f-oleada1-antonio-ortiz-villano", url: "https://elcomercio.pe/politica/elecciones/antonio-ortiz-villano-en-foro-de-candidatos-en-mi-gobierno-vamos-a-dar-reactiva-a-todas-las-mypes-ultimas-noticia/", tipo: "debate", titulo: "Ortiz Villano: Reactiva para todas las mypes", medio: "El Comercio", fechaFuente: "2026-03-17", entidadId: "antonio-ortiz-villano", estado: "evaluada" },
  { id: "f-oleada1-rosario-del-pilar-fernandez-bazan", url: "https://www.infobae.com/peru/2026/03/09/rosario-fernandez-admite-que-postula-a-la-presidencia-para-autovacarse-y-entregar-el-poder-a-su-hermano-el-es-el-lider/", tipo: "entrevista", titulo: "Fernandez admite que postula para autovacarse y dar poder a su hermano", medio: "Infobae", fechaFuente: "2026-03-09", entidadId: "rosario-del-pilar-fernandez-bazan", estado: "evaluada" },
  { id: "f-oleada1-roberto-enrique-chiabra-leon", url: "https://rpp.pe/politica/elecciones/roberto-chiabra-propone-que-las-fuerzas-armadas-apoyen-en-la-lucha-contra-la-criminalidad-noticia-1678980", tipo: "entrevista", titulo: "Chiabra: Comando Conjunto contra criminalidad, rechaza pena de muerte", medio: "RPP", fechaFuente: "2026-03-25", entidadId: "roberto-enrique-chiabra-leon", estado: "evaluada" },
];

const EVALUACIONES = [
  // LOTE A (1-10)
  { id: "eval-oleada1-ronald-darwin-atencio-sotomayor", entidadId: "ronald-darwin-atencio-sotomayor", fuenteId: "f-oleada1-ronald-darwin-atencio-sotomayor", estadio: 2, confianza: "media" as const,
    justificacion: "Discurso transaccional-instrumental: el Estado debe recuperar riquezas. Ataque ad hominem a Fujimori sin principio moral superior.",
    citas: [{ texto: "No permitira la criminalizacion de los pequenos mineros ni de los mineros artesanales", ubicacion: "Debate JNE tercera fecha", indicador: "Razonamiento instrumental — proteger a un grupo por beneficio economico" }],
    estadioAlternativo: 3, notas: null },

  { id: "eval-oleada1-jose-daniel-williams-zapata", entidadId: "jose-daniel-williams-zapata", fuenteId: "f-oleada1-jose-daniel-williams-zapata", estadio: 1, confianza: "media" as const,
    justificacion: "Razonamiento basado en fuerza y castigo puro. Prioriza derechos de buenos peruanos sobre delincuentes.",
    citas: [{ texto: "Implementare un estado de guerra contra la delincuencia con fuerzas especiales, inteligencia operativa y rastrillaje 7x24", ubicacion: "Debate JNE primera fecha", indicador: "Castigo/obediencia — fuerza como solucion, derechos condicionados" }],
    estadioAlternativo: null, notas: null },

  { id: "eval-oleada1-alvaro-gonzalo-paz-de-la-barra-freigeiro", entidadId: "alvaro-gonzalo-paz-de-la-barra-freigeiro", fuenteId: "f-oleada1-alvaro-gonzalo-paz-de-la-barra-freigeiro", estadio: 1, confianza: "media" as const,
    justificacion: "Niega explicitamente derechos fundamentales. Pre-convencional puro — la autoridad decide quien merece derechos.",
    citas: [{ texto: "Corrupto y criminal no tiene derechos, no tiene debido proceso ni presuncion de inocencia", ubicacion: "Debate JNE tercera fecha", indicador: "Negacion de derechos universales, autoridad arbitraria" }],
    estadioAlternativo: null, notas: null },

  { id: "eval-oleada1-fiorella-giannina-molinelli-aristondo", entidadId: "fiorella-giannina-molinelli-aristondo", fuenteId: "f-oleada1-fiorella-giannina-molinelli-aristondo", estadio: 3, confianza: "media" as const,
    justificacion: "Busca posicionarse como la buena frente a los malos. Propuestas punitivas enmarcadas en legitimidad institucional.",
    citas: [{ texto: "No se debe tenerle miedo a los poderosos, a las mafias y a los corruptos", ubicacion: "Debate JNE tercera fecha", indicador: "Enfasis en imagen moral personal, busca aprobacion" }],
    estadioAlternativo: 4, notas: null },

  { id: "eval-oleada1-roberto-helbert-sanchez-palomino", entidadId: "roberto-helbert-sanchez-palomino", fuenteId: "f-oleada1-roberto-helbert-sanchez-palomino", estadio: 3, confianza: "media" as const,
    justificacion: "Apela a inclusion de pueblos originarios pero defiende a Castillo como secuestrado sin reconocer proceso judicial. Busca aprobacion de base.",
    citas: [{ texto: "Esta republica de 200 anos no ha sido capaz de incluir a los pueblos quechuas, aimaras, amazonicos", ubicacion: "Debate JNE tercera fecha", indicador: "Busca aprobacion de grupo; framing victima/agresor sin analisis institucional" }],
    estadioAlternativo: 4, notas: null },

  { id: "eval-oleada1-rafael-jorge-belaunde-llosa", entidadId: "rafael-jorge-belaunde-llosa", fuenteId: "f-oleada1-rafael-jorge-belaunde-llosa", estadio: 4, confianza: "media" as const,
    justificacion: "Razonamiento institucional: inversion privada, canon minero para becas, sin ataques personales. No he venido a hacer circo.",
    citas: [{ texto: "Si queremos mejor empleo debemos tener mas y mejor inversion privada", ubicacion: "Debate JNE cuarta fecha", indicador: "Respeto al sistema institucional, soluciones dentro del marco legal" }],
    estadioAlternativo: null, notas: null },

  { id: "eval-oleada1-pitter-enrique-valderrama-pena", entidadId: "pitter-enrique-valderrama-pena", fuenteId: "f-oleada1-pitter-enrique-valderrama-pena", estadio: 2, confianza: "media" as const,
    justificacion: "Mezcla transaccional e instrumental. Cadena perpetua como herramienta disuasoria, no como principio de justicia.",
    citas: [{ texto: "A todo juez, policia, fiscal o militar que se coluda con organizaciones criminales le aplicaremos cadena perpetua", ubicacion: "Debate JNE tercera fecha", indicador: "Castigo como herramienta disuasoria, no como principio" }],
    estadioAlternativo: 3, notas: null },

  { id: "eval-oleada1-ricardo-pablo-belmont-cassinelli", entidadId: "ricardo-pablo-belmont-cassinelli", fuenteId: "f-oleada1-ricardo-pablo-belmont-cassinelli", estadio: 3, confianza: "media" as const,
    justificacion: "Discurso emotivo y paternalista. Datos incorrectos sobre sueldos docentes. Busca aprobacion como figura paternal.",
    citas: [{ texto: "Los maestros ganan entre 500 y 700 soles como maximo. Hay que aumentarles el sueldo", ubicacion: "Debate JNE quinta fecha", indicador: "Busca aprobacion — discurso emotivo, autopresentacion paternal" }],
    estadioAlternativo: 2, notas: null },

  { id: "eval-oleada1-charlie-carrasco-salazar", entidadId: "charlie-carrasco-salazar", fuenteId: "f-oleada1-charlie-carrasco-salazar", estadio: 1, confianza: "media" as const,
    justificacion: "Pre-convencional puro. Autoridad divina como fuente de norma, expulsion sin proceso, llamado a rebelion.",
    citas: [{ texto: "Vamos a gobernar con los principios biblicos", ubicacion: "Debate JNE segunda fecha", indicador: "Autoridad externa biblica, expulsion sin proceso, llamado a rebelion" }],
    estadioAlternativo: null, notas: null },

  { id: "eval-oleada1-alex-gonzales-castillo", entidadId: "alex-gonzales-castillo", fuenteId: "f-oleada1-alex-gonzales-castillo", estadio: 2, confianza: "media" as const,
    justificacion: "Transaccional-instrumental. Critica a Lopez Aliaga con logica de confianza traicionada.",
    citas: [{ texto: "Nos dejo Lima potencia mundial del crimen. Lima y los trenes chatarra y S/4 mil millones en bonos", ubicacion: "Debate JNE primera fecha", indicador: "Confianza como transaccion, critica basada en resultados" }],
    estadioAlternativo: 1, notas: null },

  // LOTE B (11-20)
  { id: "eval-oleada1-armando-joaquin-masse-fernandez", entidadId: "armando-joaquin-masse-fernandez", fuenteId: "f-oleada1-armando-joaquin-masse-fernandez", estadio: 2, confianza: "media" as const,
    justificacion: "Propuestas transaccionales: ofrecer beneficios tangibles (conciertos, ferias) como mecanismo para ganar apoyo.",
    citas: [{ texto: "El peruano trabaja duro, pero tambien necesita alegria", ubicacion: "Debate JNE ultima jornada", indicador: "Razonamiento instrumental: beneficios concretos a cambio de apoyo" }],
    estadioAlternativo: 3, notas: null },

  { id: "eval-oleada1-luis-fernando-olivera-vega", entidadId: "luis-fernando-olivera-vega", fuenteId: "f-oleada1-luis-fernando-olivera-vega", estadio: 2, confianza: "media" as const,
    justificacion: "Confrontacion personal y descalificacion de adversarios. Pensamiento instrumental.",
    citas: [{ texto: "Cuando un pueblo sabe, no lo engana nadie. No lo engana una japonesa, ni un mitomano, ni un ladronzuelo", ubicacion: "Debate JNE 31/03", indicador: "Discurso descalificador e instrumental" }],
    estadioAlternativo: 3, notas: null },

  { id: "eval-oleada1-mesias-antonio-guevara-amasifuen", entidadId: "mesias-antonio-guevara-amasifuen", fuenteId: "f-oleada1-mesias-antonio-guevara-amasifuen", estadio: 3, confianza: "media" as const,
    justificacion: "Amenaza con cerrar el Congreso. Populismo que respeta formas pero busca concentrar poder.",
    citas: [{ texto: "Si el Congreso se convierte en un obstaculo para gobernar, yo no voy a tener ningun reparo en cerrarlo", ubicacion: "Entrevista Ojo Publico", indicador: "Busca aprobacion social atacando institucion desprestigiada" }],
    estadioAlternativo: 2, notas: null },

  { id: "eval-oleada1-carlos-gonzalo-alvarez-loayza", entidadId: "carlos-gonzalo-alvarez-loayza", fuenteId: "f-oleada1-carlos-gonzalo-alvarez-loayza", estadio: 4, confianza: "media" as const,
    justificacion: "Apela a dignidad institucional. Plan economico detallado con autonomia del BCR y formalizacion.",
    citas: [{ texto: "Tenemos que recuperar la dignidad de la institucion presidencial", ubicacion: "Entrevista El Comercio", indicador: "Apelacion a dignidad de instituciones, orden legal" }],
    estadioAlternativo: 3, notas: null },

  { id: "eval-oleada1-herbert-caller-gutierrez", entidadId: "herbert-caller-gutierrez", fuenteId: "f-oleada1-herbert-caller-gutierrez", estadio: 1, confianza: "media" as const,
    justificacion: "Militarizacion del orden interno. Fuerza y castigo como solucion.",
    citas: [{ texto: "Las Fuerzas Armadas van a estar al mando de la Policia Nacional del Peru", ubicacion: "Foro de candidatos 2026", indicador: "Apelacion a fuerza militar como solucion; castigo y control" }],
    estadioAlternativo: 2, notas: null },

  { id: "eval-oleada1-yonhy-lescano-ancieta", entidadId: "yonhy-lescano-ancieta", fuenteId: "f-oleada1-yonhy-lescano-ancieta", estadio: 2, confianza: "media" as const,
    justificacion: "Ataque personal y defensa del ego. Instrumentalizacion del debate para posicionamiento propio.",
    citas: [{ texto: "No voy a permitir que el telonero de Fujimori me venga a dar clases de moral", ubicacion: "Debate JNE cuarta jornada", indicador: "Defensa del ego, ataque personal, instrumentalizacion" }],
    estadioAlternativo: 3, notas: null },

  { id: "eval-oleada1-wolfgang-mario-grozo-costa", entidadId: "wolfgang-mario-grozo-costa", fuenteId: "f-oleada1-wolfgang-mario-grozo-costa", estadio: 4, confianza: "media" as const,
    justificacion: "Apela a calidad institucional y legal. Propone reforma institucional dentro del marco legal.",
    citas: [{ texto: "El problema no es que faltan leyes, sino que sobran malas leyes y dadas con nombre propio", ubicacion: "Entrevista La Republica", indicador: "Apelacion al sistema legal e institucional, critica sistemica" }],
    estadioAlternativo: 3, notas: null },

  { id: "eval-oleada1-vladimir-roy-cerron-rojas", entidadId: "vladimir-roy-cerron-rojas", fuenteId: "f-oleada1-vladimir-roy-cerron-rojas", estadio: 1, confianza: "media" as const,
    justificacion: "Lenguaje punitivo y autoritario. Candidatea desde clandestinidad evadiendo justicia.",
    citas: [{ texto: "Ganare las elecciones desde la clandestinidad. Hay que disciplinar a los golpistas y traidores", ubicacion: "Publicacion en X desde clandestinidad", indicador: "Lenguaje punitivo, logica de castigo y fuerza" }],
    estadioAlternativo: 2, notas: null },

  { id: "eval-oleada1-francisco-ernesto-diez-canseco-tavara", entidadId: "francisco-ernesto-diez-canseco-tavara", fuenteId: "f-oleada1-francisco-ernesto-diez-canseco-tavara", estadio: 4, confianza: "media" as const,
    justificacion: "Propone organo institucional para combatir corrupcion. Confia en mecanismos legales e institucionales.",
    citas: [{ texto: "Vamos a crear el Consejo Nacional de Moral Publica cuya primera mision va a ser votar a los corruptos", ubicacion: "Programa Elecciones Generales 2026, Andina", indicador: "Creacion de instituciones para resolver problemas" }],
    estadioAlternativo: 3, notas: null },

  { id: "eval-oleada1-mario-enrique-vizcarra-cornejo", entidadId: "mario-enrique-vizcarra-cornejo", fuenteId: "f-oleada1-mario-enrique-vizcarra-cornejo", estadio: 1, confianza: "media" as const,
    justificacion: "Razonamiento punitivo: regimen de excepcion, carceles en selva remota. Castigo fisico y aislamiento.",
    citas: [{ texto: "Ahi se van a arrepentir de todas sus fechorias", ubicacion: "Debate JNE", indicador: "Castigo fisico y aislamiento; logica de miedo" }],
    estadioAlternativo: 2, notas: null },

  // LOTE C (21-29)
  { id: "eval-oleada1-walter-gilmer-chirinos-purizaga", entidadId: "walter-gilmer-chirinos-purizaga", fuenteId: "f-oleada1-walter-gilmer-chirinos-purizaga", estadio: 1, confianza: "media" as const,
    justificacion: "Propone estado de excepcion con control policial y militar. Razonamiento punitivo y de fuerza.",
    citas: [{ texto: "El 28 de julio daremos estado de excepcion con control policial y militar", ubicacion: "Debate JNE segunda fecha", indicador: "Justifica por fuerza y castigo sin diferenciacion moral" }],
    estadioAlternativo: 2, notas: null },

  { id: "eval-oleada1-alfonso-carlos-espa-y-garces-alvear", entidadId: "alfonso-carlos-espa-y-garces-alvear", fuenteId: "f-oleada1-alfonso-carlos-espa-y-garces-alvear", estadio: 3, confianza: "media" as const,
    justificacion: "Apela a emociones populares, promesas grandilocuentes. Busca aprobacion masiva como fuente de legitimidad.",
    citas: [{ texto: "Vamos a poner al Estado al servicio del pueblo, rompiendo la corrupcion y el pacto infame", ubicacion: "Debate JNE cuarta fecha", indicador: "Busca aprobacion popular, apela a emociones colectivas" }],
    estadioAlternativo: 2, notas: null },

  { id: "eval-oleada1-carlos-ernesto-jaico-carranza", entidadId: "carlos-ernesto-jaico-carranza", fuenteId: "f-oleada1-carlos-ernesto-jaico-carranza", estadio: 4, confianza: "media" as const,
    justificacion: "Articula propuestas en marco institucional: reforma Policia, muerte civil como sancion legal formal.",
    citas: [{ texto: "Para combatir la corrupcion debemos declarar la muerte civil de los funcionarios condenados por delitos dolosos", ubicacion: "Foro de candidatos 2026", indicador: "Apela a instituciones, procedimientos legales y reformas" }],
    estadioAlternativo: 3, notas: null },

  { id: "eval-oleada1-jose-leon-luna-galvez", entidadId: "jose-leon-luna-galvez", fuenteId: "f-oleada1-jose-leon-luna-galvez", estadio: 2, confianza: "media" as const,
    justificacion: "Transaccional puro: promesas imposibles en plazos cortos, mega carcel de 50,000 internos. Mas dinero = menos crimen.",
    citas: [{ texto: "Aseguramos que en seis meses se acaba la extorsion y sicariato", ubicacion: "Foro de candidatos 2026", indicador: "Relaciones como transacciones. Promesas de intercambio" }],
    estadioAlternativo: 1, notas: null },

  { id: "eval-oleada1-maria-soledad-perez-tello-de-rodriguez", entidadId: "maria-soledad-perez-tello-de-rodriguez", fuenteId: "f-oleada1-maria-soledad-perez-tello-de-rodriguez", estadio: 5, confianza: "media" as const,
    justificacion: "Subordina candidatura a principios. Denuncia leyes procrimen como injustas. Apela a principios universales.",
    citas: [{ texto: "Mi candidatura es un incidente; lo que defiendo son principios y valores en democracia", ubicacion: "Entrevista El Comercio", indicador: "Reconoce que leyes pueden ser injustas. Apela a principios universales" }],
    estadioAlternativo: 4, notas: null },

  { id: "eval-oleada1-paul-davis-jaimes-blanco", entidadId: "paul-davis-jaimes-blanco", fuenteId: "f-oleada1-paul-davis-jaimes-blanco", estadio: 1, confianza: "media" as const,
    justificacion: "Razonamiento punitivo: pena de muerte, salida de Corte IDH para ejecutar castigos extremos.",
    citas: [{ texto: "Ha llegado la hora de implementar la pena de muerte en casos de sicariato y violacion de menores", ubicacion: "Debate JNE tercera fecha", indicador: "Castigo como fin absoluto. Destruir mecanismos de proteccion de derechos" }],
    estadioAlternativo: null, notas: null },

  { id: "eval-oleada1-antonio-ortiz-villano", entidadId: "antonio-ortiz-villano", fuenteId: "f-oleada1-antonio-ortiz-villano", estadio: 2, confianza: "media" as const,
    justificacion: "Transaccional: el Estado da creditos a cambio de que emprendedores produzcan.",
    citas: [{ texto: "En mi gobierno vamos a dar Reactiva a todas las mypes, pero dandole la parte tecnica", ubicacion: "Foro de candidatos 2026", indicador: "Relacion transaccional Estado-ciudadano" }],
    estadioAlternativo: 3, notas: null },

  { id: "eval-oleada1-rosario-del-pilar-fernandez-bazan", entidadId: "rosario-del-pilar-fernandez-bazan", fuenteId: "f-oleada1-rosario-del-pilar-fernandez-bazan", estadio: 2, confianza: "media" as const,
    justificacion: "Admite candidatura instrumental: postula para ceder poder a hermano. Uso transaccional del cargo.",
    citas: [{ texto: "Yo provocaria una vacancia para que el pueda ascender", ubicacion: "Entrevista Infobae", indicador: "Uso instrumental del cargo. Candidatura como transaccion familiar" }],
    estadioAlternativo: 1, notas: null },

  { id: "eval-oleada1-roberto-enrique-chiabra-leon", entidadId: "roberto-enrique-chiabra-leon", fuenteId: "f-oleada1-roberto-enrique-chiabra-leon", estadio: 4, confianza: "media" as const,
    justificacion: "Diagnostico estructural con respuesta institucional. Rechaza pena de muerte como populista. Marco de orden institucional.",
    citas: [{ texto: "Estamos viviendo una violencia excepcional que requiere medidas excepcionales. El Comando Conjunto asumira la responsabilidad", ubicacion: "Entrevista RPP", indicador: "Apela a instituciones, rechaza populismo punitivo" }],
    estadioAlternativo: 3, notas: null },
];

async function main() {
  console.log(`\nRegistrando ${FUENTES.length} fuentes + ${EVALUACIONES.length} evaluaciones (Oleada 1)...\n`);

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

  console.log("\n=== OLEADA 1 COMPLETADA (29 evaluaciones) ===\n");
}

main().catch(console.error);
