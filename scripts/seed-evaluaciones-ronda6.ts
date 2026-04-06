/**
 * Ronda 6 FINAL — Completando 10 evaluaciones por candidato
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
  { id: "f-keiko-autoritarismo-padre", url: "https://elcomercio.pe/politica/elecciones/keiko-fujimori-al-gobierno-de-mi-padre-dictadura-no-pero-creo-que-por-momentos-fue-un-gobierno-autoritario-alberto-fujimori-elecciones-2021-nndc-noticia/", tipo: "entrevista", titulo: "Keiko: 'Dictadura no, pero por momentos fue un gobierno autoritario'", medio: "El Comercio", fechaFuente: "2021-04-01", entidadId: "keiko-sofia-fujimori-higuchi", estado: "evaluada" },
  { id: "f-keiko-perdon-confrontacion", url: "https://elcomercio.pe/politica/keiko-fujimori-sobre-confrontacion-politica-le-pido-perdon-a-mi-padre-a-mi-hermano-y-a-los-fujimoristas-nndc-noticia/", tipo: "entrevista", titulo: "Keiko pide perdón a padre, hermano y fujimoristas por confrontación", medio: "El Comercio", fechaFuente: "2021-05-01", entidadId: "keiko-sofia-fujimori-higuchi", estado: "evaluada" },
  { id: "f-rla-dni-fetos", url: "https://larepublica.pe/politica/2026/02/01/rafael-lopez-aliaga-plantea-sin-sustento-otorgar-dni-a-nonatos-son-ciudadanos-desde-el-vientre-hnews-80946", tipo: "articulo", titulo: "López Aliaga: DNI para no nacidos 'son ciudadanos desde el vientre'", medio: "La República", fechaFuente: "2026-02-01", entidadId: "rafael-bernardo-lopez-aliaga-cazorla", estado: "evaluada" },
  { id: "f-rla-genero-exterminar", url: "https://elcomercio.pe/elecciones-2021/rafael-lopez-aliaga-toda-la-doctrina-de-genero-evidentemente-va-a-ser-exterminada-renovacion-popular-entrevista-elecciones-2021-noticia/", tipo: "entrevista", titulo: "López Aliaga: 'La doctrina de género va a ser exterminada'", medio: "El Comercio", fechaFuente: "2021-03-01", entidadId: "rafael-bernardo-lopez-aliaga-cazorla", estado: "evaluada" },
  { id: "f-forsyth-patricia-li", url: "https://larepublica.pe/politica/2026/03/28/george-forsyth-patricia-li-no-tendra-ninguna-funcion-dentro-del-gobierno-si-es-que-es-presidente-hnews-400904", tipo: "entrevista", titulo: "Forsyth: 'Patricia Li no tendrá función en el gobierno'", medio: "La República", fechaFuente: "2026-03-28", entidadId: "george-patrick-forsyth-sommer", estado: "evaluada" },
  { id: "f-forsyth-keiko-saavedra", url: "https://larepublica.pe/politica/2026/03/31/debate-presidencial-emboscadas-entre-candidatos-y-falta-de-respuestas-primaron-en-el-debate-elecciones-2026-hnews-1433874", tipo: "debate", titulo: "Forsyth: 'No permitiré que el Congreso interfiera en educación como Keiko'", medio: "La República", fechaFuente: "2026-03-30", entidadId: "george-patrick-forsyth-sommer", estado: "evaluada" },
  { id: "f-forsyth-corrupcion-investigacion", url: "https://elcomercio.pe/politica/george-forsyth-los-detalles-de-la-decision-del-poder-judicial-que-amplio-la-investigacion-en-su-contra-por-presunta-corrupcion-tlcnota-noticia/", tipo: "articulo", titulo: "PJ amplía investigación contra Forsyth por presunta corrupción", medio: "El Comercio", fechaFuente: "2026-02-01", entidadId: "george-patrick-forsyth-sommer", estado: "evaluada" },
  { id: "f-acuna-campana-financiamiento", url: "https://rpp.pe/politica/elecciones/es-falso-que-la-campana-de-cesar-acuna-sea-financiada-solo-por-el-noticia-1680408", tipo: "articulo", titulo: "Es falso que campaña de Acuña sea financiada solo por él", medio: "RPP", fechaFuente: "2026-03-20", entidadId: "cesar-acuna-peralta", estado: "evaluada" },
  { id: "f-acuna-contraloria-s116m", url: "https://larepublica.pe/politica/2026/03/20/contraloria-acusa-a-6-exfuncionarios-de-cesar-acuna-por-malos-manejos-en-programa-de-s116-millones-alianza-para-el-progreso-contraloria-hnews-861420", tipo: "articulo", titulo: "Contraloría acusa a 6 exfuncionarios de Acuña por S/116 millones", medio: "La República", fechaFuente: "2026-03-20", entidadId: "cesar-acuna-peralta", estado: "evaluada" },
  { id: "f-nieto-democracia-congreso", url: "https://larepublica.pe/politica/2026/02/17/jorge-nieto-en-democracia-un-gobierno-con-poder-es-uno-con-mayoria-del-congreso-en-la-primera-vuelta-hnews-936581", tipo: "entrevista", titulo: "Nieto: 'Un gobierno con poder necesita mayoría del Congreso'", medio: "La República", fechaFuente: "2026-02-17", entidadId: "jorge-nieto-montesinos", estado: "evaluada" },
  { id: "f-nieto-nino-costero", url: "https://larepublica.pe/politica/2026/03/04/jorge-nieto-montesinos-quien-es-el-candidato-presidencial-del-partido-buen-gobierno-hnews-95384", tipo: "articulo", titulo: "Nieto: coordinó respuesta al Niño Costero como ministro de Defensa", medio: "La República", fechaFuente: "2026-03-04", entidadId: "jorge-nieto-montesinos", estado: "evaluada" },
  { id: "f-nieto-fujimori-rechaza", url: "https://rpp.pe/politica/elecciones/jorge-nieto-rechazo-versiones-que-lo-vinculan-con-presuntos-favores-politicos-del-gobierno-de-alberto-fujimori-noticia-1682052", tipo: "entrevista", titulo: "Nieto rechaza vínculos con favores del gobierno de Fujimori", medio: "RPP", fechaFuente: "2026-03-25", entidadId: "jorge-nieto-montesinos", estado: "evaluada" },
  { id: "f-lopez-chau-descentralizacion", url: "https://rpp.pe/politica/elecciones/alfonso-lopez-chau-expuso-sus-propuestas-de-gobierno-durante-una-actividad-en-juliaca-noticia-1673951", tipo: "conferencia", titulo: "López Chau expone propuestas en Juliaca: descentralización profunda", medio: "RPP", fechaFuente: "2026-01-15", entidadId: "pablo-alfonso-lopez-chau-nava", estado: "evaluada" },
  { id: "f-lopez-chau-economia-mercado", url: "https://larepublica.pe/politica/2025/05/12/alfonso-lopez-chau-el-rector-de-la-uni-que-busca-ser-presidente-del-peru-con-economia-nacional-de-mercado-hnews-476949", tipo: "entrevista", titulo: "López Chau: 'economía nacional de mercado' como modelo", medio: "La República", fechaFuente: "2025-05-12", entidadId: "pablo-alfonso-lopez-chau-nava", estado: "evaluada" },
];

const EVALUACIONES = [
  // KEIKO — gobierno autoritario del padre
  { id: "eval-keiko-autoritarismo", entidadId: "keiko-sofia-fujimori-higuchi", fuenteId: "f-keiko-autoritarismo-padre", estadio: 4, confianza: "media" as const,
    justificacion: "Reconoce que el gobierno de su padre 'por momentos fue autoritario'. Distingue entre dictadura y autoritarismo. Es autocrítica parcial: reconoce fallas pero las minimiza ('por momentos'). Estadio 4: reconoce la violación del orden institucional pero no llega a articular principios de derechos humanos.",
    citas: [{ texto: "Al gobierno de mi padre, dictadura no, pero creo que por momentos fue un gobierno autoritario", ubicacion: "Entrevista El Comercio, 2021", indicador: "Autocrítica parcial sobre institucionalidad — Estadio 4 (con reservas)" }],
    estadioAlternativo: 3, notas: "La minimización ('por momentos') limita la autocrítica. Pero es más de lo que la mayoría de fujimoristas admiten." },
  // KEIKO — pide perdón por confrontación
  { id: "eval-keiko-perdon-confrontacion", entidadId: "keiko-sofia-fujimori-higuchi", fuenteId: "f-keiko-perdon-confrontacion", estadio: 3, confianza: "alta" as const,
    justificacion: "Pide perdón a su padre, hermano y fujimoristas por la confrontación política. No pide perdón al país ni a las víctimas del fujimorismo. El perdón es intragrupal, no institucional. Estadio 3: busca restaurar la armonía del grupo, no reparar el daño institucional.",
    citas: [{ texto: "Le pido perdón a mi padre, a mi hermano y a los fujimoristas", ubicacion: "Entrevista El Comercio, 2021", indicador: "Disculpa intragrupal, no institucional — Estadio 3" }],
    estadioAlternativo: 2, notas: "Pide perdón a los suyos pero no a los afectados por las acciones del fujimorismo en el Congreso." },

  // LÓPEZ ALIAGA — DNI para fetos
  { id: "eval-rla-dni-fetos", entidadId: "rafael-bernardo-lopez-aliaga-cazorla", fuenteId: "f-rla-dni-fetos", estadio: 2, confianza: "alta" as const,
    justificacion: "Propone DNI para no nacidos sin sustento legal. Juristas señalan que los derechos del concebido ya están protegidos. Es una propuesta de espectáculo ideológico sin viabilidad. Usa lenguaje de derechos para promover agenda religiosa personal.",
    citas: [{ texto: "Son ciudadanos desde el vientre. DNI para el niño desde el vientre de su madre", ubicacion: "Mitin en Arequipa, febrero 2026", indicador: "Propuesta sin sustento legal, espectáculo ideológico — Estadio 2" }],
    estadioAlternativo: 3, notas: "Podría ser Estadio 3 si articulara con coherencia. Pero es transaccional: busca el voto conservador." },
  // LÓPEZ ALIAGA — doctrina de género
  { id: "eval-rla-genero-exterminar", entidadId: "rafael-bernardo-lopez-aliaga-cazorla", fuenteId: "f-rla-genero-exterminar", estadio: 1, confianza: "alta" as const,
    justificacion: "Dice que 'la doctrina de género va a ser exterminada'. Lenguaje de exterminio aplicado a una política pública. No articula qué reemplazaría la política de igualdad de género ni por qué. Viola regla Gert #4 (no privar de libertad) y #5 (no privar de bienestar).",
    citas: [{ texto: "Toda la doctrina de género, evidentemente, va a ser exterminada", ubicacion: "Entrevista El Comercio, 2021", indicador: "Lenguaje de exterminio contra política pública — Estadio 1" }],
    estadioAlternativo: null, notas: "El uso de 'exterminar' revela razonamiento de fuerza bruta aplicado a política social." },

  // FORSYTH — Patricia Li no en gobierno
  { id: "eval-forsyth-li-gobierno", entidadId: "george-patrick-forsyth-sommer", fuenteId: "f-forsyth-patricia-li", estadio: 4, confianza: "media" as const,
    justificacion: "Establece separación entre la presidenta del partido y funciones de gobierno. Articulación institucional: el partido y el gobierno son instancias separadas. Estadio 4.",
    citas: [{ texto: "Patricia Li no tendrá ninguna función dentro del gobierno, ninguna", ubicacion: "Entrevista La República, marzo 2026", indicador: "Separación partido-gobierno — Estadio 4" }],
    estadioAlternativo: 3, notas: "Buena señal institucional, aunque podría ser oportunismo ante las críticas." },
  // FORSYTH — no permitir interferencia en educación
  { id: "eval-forsyth-educacion-congreso", entidadId: "george-patrick-forsyth-sommer", fuenteId: "f-forsyth-keiko-saavedra", estadio: 4, confianza: "alta" as const,
    justificacion: "Declara que no permitirá que el Congreso interfiera en educación como hizo Keiko al censurar a Saavedra. Defiende la autonomía del ejecutivo frente al legislativo en materia educativa. Estadio 4: respeto a la separación de poderes.",
    citas: [{ texto: "No permitiré que el Congreso interfiera en educación como Keiko Fujimori hizo cuando censuró al ministro Jaime Saavedra", ubicacion: "Debate JNE 30/03", indicador: "Defensa de separación de poderes — Estadio 4" }],
    estadioAlternativo: 3, notas: "Forsyth mejora cuando habla de instituciones. Su debilidad es la propuesta de fuerza en seguridad." },
  // FORSYTH — investigación por corrupción
  { id: "eval-forsyth-investigacion-corrupcion", entidadId: "george-patrick-forsyth-sommer", fuenteId: "f-forsyth-corrupcion-investigacion", estadio: 2, confianza: "media" as const,
    justificacion: "El PJ amplió investigación contra Forsyth por presunta corrupción en La Victoria (contratos a amigo sin experiencia). Evaluación de conducta, no de discurso. Viola regla Gert #8 (no hacer trampa).",
    citas: [{ texto: "PJ amplía investigación contra Forsyth por presunta corrupción", ubicacion: "El Comercio, febrero 2026", indicador: "Investigación por favorecimiento en contrataciones — conducta Estadio 2" }],
    estadioAlternativo: null, notas: "Contratos de S/107 mil a amigo sin estudios ni experiencia pública." },

  // ACUÑA — financiamiento de campaña falso
  { id: "eval-acuna-financiamiento-falso", entidadId: "cesar-acuna-peralta", fuenteId: "f-acuna-campana-financiamiento", estadio: 2, confianza: "alta" as const,
    justificacion: "Verificado como falso que su campaña sea financiada solo por él. Misma lógica que el plagio: afirma algo verificablemente falso para proyectar independencia. Viola regla Gert #6 (no engañar).",
    citas: [{ texto: "Es falso que la campaña de César Acuña sea financiada solo por él", ubicacion: "Verificación RPP, marzo 2026", indicador: "Afirmación verificada como falsa — Estadio 2 (engaño instrumental)" }],
    estadioAlternativo: 1, notas: "Patrón consistente con plagio de tesis: manipula la verdad para beneficio de imagen." },
  // ACUÑA — Contraloría S/116M
  { id: "eval-acuna-contraloria-116m", entidadId: "cesar-acuna-peralta", fuenteId: "f-acuna-contraloria-s116m", estadio: 1, confianza: "alta" as const,
    justificacion: "Contraloría acusa a 6 exfuncionarios de su gestión por malos manejos en programa de S/116 millones. Tercer programa de su gestión con irregularidades (Procompite S/58M + contratos S/315M + este). Patrón sistémico. Viola reglas Gert #8, #9, #10.",
    citas: [{ texto: "Contraloría acusa a 6 exfuncionarios de César Acuña por malos manejos en programa de S/116 millones", ubicacion: "La República, marzo 2026", indicador: "Tercer escándalo de gestión — patrón sistémico" }],
    estadioAlternativo: null, notas: "Acuña acumula irregularidades: S/58M + S/315M + S/116M = S/489M en programas cuestionados." },

  // NIETO — democracia y mayoría
  { id: "eval-nieto-democracia-mayoria", entidadId: "jorge-nieto-montesinos", fuenteId: "f-nieto-democracia-congreso", estadio: 4, confianza: "alta" as const,
    justificacion: "Articula que en democracia un gobierno necesita mayoría del Congreso para tener poder real. Diagnóstico institucional que reconoce la disfuncionalidad del sistema actual. Estadio 4: busca soluciones dentro del marco democrático.",
    citas: [{ texto: "En democracia, un gobierno con poder es uno con mayoría del Congreso en la primera vuelta", ubicacion: "Entrevista La República, febrero 2026", indicador: "Análisis institucional de gobernabilidad — Estadio 4" }],
    estadioAlternativo: 3, notas: "Podría ser controversial (implica que sin mayoría no se puede gobernar). Pero es un diagnóstico honesto." },
  // NIETO — Niño Costero como ministro
  { id: "eval-nieto-nino-costero", entidadId: "jorge-nieto-montesinos", fuenteId: "f-nieto-nino-costero", estadio: 4, confianza: "alta" as const,
    justificacion: "Como ministro de Defensa coordinó la respuesta al Niño Costero 2017. Creó el COEN reuniendo presidente, premier y ministros para respuesta inmediata. Evaluación de gestión real, no solo discurso. Estadio 4: capacidad de respuesta institucional ante crisis.",
    citas: [{ texto: "Coordinó la respuesta de las Fuerzas Armadas al Niño Costero 2017 creando el COEN como Comando de Operaciones de Emergencia", ubicacion: "Perfil La República, marzo 2026", indicador: "Gestión institucional efectiva ante crisis — Estadio 4 (evidencia de conducta)" }],
    estadioAlternativo: 5, notas: "Nieto es el candidato con mejor balance entre discurso y gestión real." },
  // NIETO — rechaza vínculos con Fujimori
  { id: "eval-nieto-rechaza-fujimori", entidadId: "jorge-nieto-montesinos", fuenteId: "f-nieto-fujimori-rechaza", estadio: 4, confianza: "media" as const,
    justificacion: "Rechaza versiones que lo vinculan con favores del gobierno de Alberto Fujimori. Mantiene coherencia con su postura institucionalista: si las acusaciones son falsas, el sistema lo demostrará.",
    citas: [{ texto: "Rechazó versiones que lo vinculan con presuntos favores políticos del gobierno de Alberto Fujimori", ubicacion: "RPP, marzo 2026", indicador: "Defensa basada en institucionalidad — Estadio 4" }],
    estadioAlternativo: 3, notas: "Consistente con su patrón: confía en instituciones para reivindicarse." },

  // LÓPEZ CHAU — propuestas en Juliaca
  { id: "eval-lopez-chau-juliaca", entidadId: "pablo-alfonso-lopez-chau-nava", fuenteId: "f-lopez-chau-descentralizacion", estadio: 4, confianza: "media" as const,
    justificacion: "Expone propuestas directamente en regiones (Juliaca), no solo desde Lima. La descentralización no es solo discurso sino práctica de campaña. Estadio 4: coherencia entre propuesta y acción.",
    citas: [{ texto: "Expuso sus propuestas de gobierno durante una actividad en Juliaca", ubicacion: "RPP, enero 2026", indicador: "Descentralización como práctica, no solo discurso — Estadio 4" }],
    estadioAlternativo: 3, notas: "Evaluación basada en coherencia entre discurso y acción." },
  // LÓPEZ CHAU — economía nacional de mercado
  { id: "eval-lopez-chau-economia", entidadId: "pablo-alfonso-lopez-chau-nava", fuenteId: "f-lopez-chau-economia-mercado", estadio: 5, confianza: "media" as const,
    justificacion: "Propone 'economía nacional de mercado' como modelo propio: ni estatismo ni neoliberalismo puro. Articula un principio económico que trasciende las opciones binarias del debate político peruano. Estadio 5: crea marco propio basado en principios, no repite ideologías.",
    citas: [{ texto: "Economía nacional de mercado", ubicacion: "Perfil La República, mayo 2025", indicador: "Modelo económico propio que trasciende binario izq/der — Estadio 5" }],
    estadioAlternativo: 4, notas: "Sin más detalle es difícil evaluar la profundidad. Pero la articulación es post-convencional." },
];

async function main() {
  console.log(`\nRegistrando ${FUENTES.length} fuentes + ${EVALUACIONES.length} evaluaciones...\n`);

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

  console.log("\n=== RONDA 6 FINAL COMPLETADA ===\n");
}

main().catch(console.error);
