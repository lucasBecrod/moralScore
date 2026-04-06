/**
 * Ronda 4 — Historial completo + propuestas específicas
 */
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, setDoc, connectFirestoreEmulator } from "firebase/firestore";

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
  return s.length % 2 !== 0 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}

const FUENTES = [
  { id: "f-keiko-reinfo", url: "https://rpp.pe/politica/elecciones/keiko-fujimori-niega-que-existan-las-llamadas-leyes-procrimen-yo-no-creo-en-esa-narrativa-noticia-1681244", tipo: "entrevista", titulo: "Keiko sobre Reinfo: 'hay que escuchar a los mineros pequeños'", medio: "RPP", fechaFuente: "2026-03-23", entidadId: "keiko-sofia-fujimori-higuchi", estado: "evaluada" },
  { id: "f-keiko-rechazo", url: "https://elcomercio.pe/politica/elecciones/keiko-fujimori-reconozco-que-dentro-de-los-politicos-soy-una-de-las-personas-que-tiene-mayor-rechazo-elecciones-2026-ultimas-noticia/", tipo: "entrevista", titulo: "Keiko reconoce su alto rechazo ciudadano", medio: "El Comercio", fechaFuente: "2026-03-15", entidadId: "keiko-sofia-fujimori-higuchi", estado: "evaluada" },
  { id: "f-rla-corte-idh", url: "https://elcomercio.pe/politica/elecciones/rafael-lopez-aliaga-plantea-retiro-de-la-corte-idh-y-jueces-sin-rostro-noticia/", tipo: "entrevista", titulo: "López Aliaga: retiro de Corte IDH y jueces sin rostro", medio: "El Comercio", fechaFuente: "2026-02-01", entidadId: "rafael-bernardo-lopez-aliaga-cazorla", estado: "evaluada" },
  { id: "f-rla-carceles-selva", url: "https://larepublica.pe/verificador/2026/03/23/rafael-lopez-aliaga-vuelve-a-mentir-sobre-las-serpientes-como-guardianes-naturales-de-carceles-en-la-selva-el-veneno-del-jergon-no-mata-en-10-minutos-242440", tipo: "articulo", titulo: "López Aliaga miente sobre serpientes como guardianes de cárceles", medio: "La República", fechaFuente: "2026-03-23", entidadId: "rafael-bernardo-lopez-aliaga-cazorla", estado: "evaluada" },
  { id: "f-forsyth-educacion-debate", url: "https://rpp.pe/politica/elecciones/debate-presidencial-2026-estas-son-las-propuestas-de-los-candidatos-sobre-educacion-innovacion-y-tecnologia-noticia-1682292", tipo: "debate", titulo: "Forsyth: reparar 10 mil colegios y Starlink para escuelas", medio: "RPP", fechaFuente: "2026-03-30", entidadId: "george-patrick-forsyth-sommer", estado: "evaluada" },
  { id: "f-forsyth-energia", url: "https://elcomercio.pe/politica/elecciones/debate-presidencial-2026-en-vivo-lunes-30-de-marzo-candidatos-propuestas-planes-de-gobierno-y-pullas-en-debate-del-jne-lboposting-noticia/", tipo: "debate", titulo: "Forsyth: 'Si no diversificamos la matriz energética, entraremos en crisis'", medio: "El Comercio", fechaFuente: "2026-03-30", entidadId: "george-patrick-forsyth-sommer", estado: "evaluada" },
  { id: "f-acuna-procompite", url: "https://rpp.pe/peru/actualidad/programa-procompite-de-gestion-de-cesar-acuna-anulan-concursos-de-s-58-millones-por-presuntos-cobros-ilegales-noticia-1649959", tipo: "articulo", titulo: "Anulan concursos Procompite de Acuña por cobros ilegales (S/58M)", medio: "RPP", fechaFuente: "2025-08-10", entidadId: "cesar-acuna-peralta", estado: "evaluada" },
  { id: "f-acuna-contratos", url: "https://larepublica.pe/politica/2025/07/31/cesar-acuna-firmo-contratos-por-s315-millones-a-empresaria-denunciada-por-estafa-gobierno-regional-de-la-libertad-gore-la-libertad-lucero-coca-condori-juan-carlos-coca-rojas-hnews-363990", tipo: "articulo", titulo: "Acuña firmó contratos por S/315M a empresaria denunciada por estafa", medio: "La República", fechaFuente: "2025-07-31", entidadId: "cesar-acuna-peralta", estado: "evaluada" },
  { id: "f-nieto-salud-extorsion", url: "https://rpp.pe/politica/elecciones/jorge-nieto-propone-sistema-unico-de-salud-y-unidad-policial-contra-extorsion-y-sicariato-noticia-1679661", tipo: "entrevista", titulo: "Nieto: sistema único de salud + unidad policial anti-extorsión", medio: "RPP", fechaFuente: "2026-03-10", entidadId: "jorge-nieto-montesinos", estado: "evaluada" },
  { id: "f-nieto-criminalidad", url: "https://elcomercio.pe/politica/jorge-nieto-no-estamos-dando-la-respuesta-adecuada-para-detener-esta-ola-de-criminalidad-tlc-nota-noticia/", tipo: "entrevista", titulo: "Nieto: 'No damos la respuesta adecuada para detener la criminalidad'", medio: "El Comercio", fechaFuente: "2026-03-05", entidadId: "jorge-nieto-montesinos", estado: "evaluada" },
  { id: "f-nieto-congreso-electorales", url: "https://rpp.pe/peru/actualidad/jorge-nieto-el-objetivo-del-congreso-es-apropiarse-de-los-organismos-electorales-para-controlar-el-ganador-de-las-proximas-elecciones-noticia-1503572", tipo: "entrevista", titulo: "Nieto: 'El Congreso quiere apropiarse de los organismos electorales'", medio: "RPP", fechaFuente: "2024-06-01", entidadId: "jorge-nieto-montesinos", estado: "evaluada" },
  { id: "f-lopez-chau-anticorrupcion", url: "https://rpp.pe/politica/elecciones/alfonso-lopez-chau-propuso-crear-un-sistema-integral-anticorrupcion-autonomo-noticia-1681588", tipo: "debate", titulo: "López Chau: sistema integral anticorrupción autónomo", medio: "RPP", fechaFuente: "2026-03-23", entidadId: "pablo-alfonso-lopez-chau-nava", estado: "evaluada" },
  { id: "f-lopez-chau-dcho-intl", url: "https://rpp.pe/politica/elecciones/alfonso-lopez-chau-defiende-el-derecho-internacional-y-cuestiona-acciones-militares-de-estados-unidos-noticia-1682819", tipo: "entrevista", titulo: "López Chau defiende derecho internacional vs acciones militares de EEUU", medio: "RPP", fechaFuente: "2026-04-03", entidadId: "pablo-alfonso-lopez-chau-nava", estado: "evaluada" },
  { id: "f-lopez-chau-gas", url: "https://elcomercio.pe/politica/alfonso-lopez-chau-participa-en-el-debate-presidencial-2026-miercoles-31-sexta-y-ultima-jornada-incidentes-temas-pullas-y-planes-de-gobierno-previo-a-las-elecciones-generales-peru-2026-video-noticia/", tipo: "debate", titulo: "López Chau: masificación del gas con tarifa única", medio: "El Comercio", fechaFuente: "2026-04-01", entidadId: "pablo-alfonso-lopez-chau-nava", estado: "evaluada" },
];

const EVALUACIONES = [
  // KEIKO — Reinfo y minería
  { id: "eval-keiko-reinfo-mineria", entidadId: "keiko-sofia-fujimori-higuchi", fuenteId: "f-keiko-reinfo", estadio: 3, confianza: "media" as const,
    justificacion: "Propone extender el Reinfo un año más y 'escuchar a los mineros pequeños'. Reconoce matices (no es lo mismo un pequeño que un grande) pero la posición es de conveniencia electoral: la minería informal es un electorado importante. No articula principio sobre por qué la formalización debe ser flexible.",
    citas: [{ texto: "No creo en esa narrativa de las leyes pro-crimen", ubicacion: "Entrevista RPP", indicador: "Negación sin argumentación — Estadio 3" }],
    estadioAlternativo: 2, notas: "Patrón: evita posición firme que le cueste votos." },
  // KEIKO — reconoce rechazo
  { id: "eval-keiko-reconoce-rechazo", entidadId: "keiko-sofia-fujimori-higuchi", fuenteId: "f-keiko-rechazo", estadio: 3, confianza: "media" as const,
    justificacion: "Reconoce públicamente ser una de las personas con mayor rechazo. Muestra autoconciencia pero la usa para pedir comprensión, no para cambiar comportamiento. Es apelación emocional (Estadio 3) no reflexión sobre las causas del rechazo.",
    citas: [{ texto: "Reconozco que dentro de los políticos soy una de las personas que tiene mayor rechazo", ubicacion: "Entrevista El Comercio", indicador: "Autoconciencia sin autocrítica sustantiva — Estadio 3" }],
    estadioAlternativo: 4, notas: "Si articulara por qué tiene rechazo y qué cambiaría, podría ser Estadio 4+." },

  // LÓPEZ ALIAGA — retiro Corte IDH
  { id: "eval-rla-corte-idh", entidadId: "rafael-bernardo-lopez-aliaga-cazorla", fuenteId: "f-rla-corte-idh", estadio: 1, confianza: "alta" as const,
    justificacion: "Propone retirar al Perú de la Corte IDH 'porque beneficia a terroristas'. Propone jueces sin rostro. Ambas medidas desmantelan el sistema de derechos humanos. No articula alternativa institucional. Viola regla Gert #4 (no privar de libertad) y #3 (no incapacitar instituciones).",
    citas: [{ texto: "Retiro inmediato de la Corte IDH porque beneficia a terroristas y sicarios", ubicacion: "Presentación precandidatura", indicador: "Destrucción institucional sin alternativa — Estadio 1" }],
    estadioAlternativo: null, notas: "Proponer jueces sin rostro es retroceder a prácticas dictatoriales de los 90." },
  // LÓPEZ ALIAGA — cárceles con serpientes
  { id: "eval-rla-carceles-serpientes", entidadId: "rafael-bernardo-lopez-aliaga-cazorla", fuenteId: "f-rla-carceles-selva", estadio: 1, confianza: "alta" as const,
    justificacion: "Propone cárceles en la selva con serpientes como 'barrera natural'. Verificado como falso por La República (el veneno del jergón no mata en 10 min). Combina ignorancia científica con espectáculo mediático. Viola regla Gert #6 (no engañar) y #2 (no causar dolor).",
    citas: [{ texto: "Las shushupes son una barrera natural, no van a escapar de ahí", ubicacion: "Declaración de campaña", indicador: "Afirmación verificada como falsa — desinformación deliberada — Estadio 1" }],
    estadioAlternativo: null, notas: "Patrón: propuestas espectaculares sin fundamento técnico ni ético." },

  // FORSYTH — educación
  { id: "eval-forsyth-educacion", entidadId: "george-patrick-forsyth-sommer", fuenteId: "f-forsyth-educacion-debate", estadio: 3, confianza: "media" as const,
    justificacion: "Promete reparar 10 mil colegios, 400 mil laptops, Starlink. Son promesas numéricas sin articular por qué la educación es un derecho ni cómo se sostiene fiscalmente. Transaccional pero con empatía: 'internet es un derecho'.",
    citas: [{ texto: "Reparar al menos 10 mil colegios en el peor estado y conectar el 100% con Internet", ubicacion: "Debate JNE 30/03", indicador: "Promesa cuantitativa sin principio articulado — Estadio 2-3" }],
    estadioAlternativo: 4, notas: "La mención de internet como derecho lo eleva a Estadio 3, pero falta articulación." },
  // FORSYTH — energía
  { id: "eval-forsyth-energia", entidadId: "george-patrick-forsyth-sommer", fuenteId: "f-forsyth-energia", estadio: 4, confianza: "media" as const,
    justificacion: "Articula un razonamiento sistémico: si no diversificamos la matriz energética, entramos en crisis. Reconoce que Camisea tiene 13 años. Es Estadio 4: análisis institucional del problema energético con visión de largo plazo.",
    citas: [{ texto: "Si no diversificamos la matriz energética, vamos a entrar en crisis", ubicacion: "Debate JNE 30/03", indicador: "Análisis sistémico con temporalidad — Estadio 4" }],
    estadioAlternativo: 3, notas: "Mejor intervención de Forsyth. Muestra capacidad de razonamiento sistémico cuando el tema lo permite." },

  // ACUÑA — Procompite anulado
  { id: "eval-acuna-procompite", entidadId: "cesar-acuna-peralta", fuenteId: "f-acuna-procompite", estadio: 1, confianza: "alta" as const,
    justificacion: "Como gobernador, su programa Procompite gastó S/58M en concursos anulados por cobros ilegales. Contraloría acusa a 6 exfuncionarios. Patrón: gestión opaca con fondos públicos. Viola reglas Gert #8 (no hacer trampa), #10 (cumplir con el deber).",
    citas: [{ texto: "Anulan concursos de S/58 millones por presuntos cobros ilegales", ubicacion: "Reportaje RPP", indicador: "Gestión con irregularidades documentadas — evidencia de conducta, no de discurso" }],
    estadioAlternativo: 2, notas: "Evaluación basada en hechos de gestión, no en discurso. La conducta real es el indicador más fuerte." },
  // ACUÑA — contratos cuestionados
  { id: "eval-acuna-contratos-315m", entidadId: "cesar-acuna-peralta", fuenteId: "f-acuna-contratos", estadio: 1, confianza: "alta" as const,
    justificacion: "Firmó contratos por S/315M a empresa de 2 años sin experiencia, cuya dueña fue denunciada por estafa. Reducció presupuesto en S/140M para inflar artificialmente el % de ejecución presupuestal. Manipulación de indicadores públicos. Viola reglas Gert #6 (no engañar), #8 (no hacer trampa), #10 (cumplir con el deber).",
    citas: [{ texto: "Firmó contratos por S/315 millones a empresaria denunciada por estafa", ubicacion: "Reportaje La República", indicador: "Contratación irregular — evidencia de conducta" }],
    estadioAlternativo: null, notas: "Evidencia de gestión más grave que el plagio. Manipuló indicadores de ejecución presupuestal para aparentar eficiencia." },

  // NIETO — sistema de salud
  { id: "eval-nieto-salud-unico", entidadId: "jorge-nieto-montesinos", fuenteId: "f-nieto-salud-extorsion", estadio: 4, confianza: "alta" as const,
    justificacion: "Propone sistema prestacional de salud único y unidad policial especializada anti-extorsión. Ambas son propuestas institucionales concretas con marco de reforma del Estado. Estadio 4: resuelve problemas a través de instituciones.",
    citas: [{ texto: "Propone sistema único de salud y unidad policial contra extorsión y sicariato", ubicacion: "Entrevista RPP", indicador: "Reforma institucional concreta — Estadio 4" }],
    estadioAlternativo: 5, notas: "Consistente con evaluaciones anteriores. Nieto es el más institucionalista." },
  // NIETO — Congreso y organismos electorales
  { id: "eval-nieto-congreso-electorales", entidadId: "jorge-nieto-montesinos", fuenteId: "f-nieto-congreso-electorales", estadio: 5, confianza: "media" as const,
    justificacion: "Denuncia que el Congreso busca apropiarse de los organismos electorales para controlar al ganador. Es un análisis que trasciende el orden legal vigente: reconoce que la legalidad formal (las leyes del Congreso) puede ser usada para destruir la democracia. Estadio 5: los derechos democráticos son previos a las leyes.",
    citas: [{ texto: "El objetivo del Congreso es apropiarse de los organismos electorales para controlar el ganador de las próximas elecciones", ubicacion: "Entrevista RPP, 2024", indicador: "Diagnóstico que trasciende la legalidad formal — Estadio 5" }],
    estadioAlternativo: 4, notas: "Esta es la evaluación más alta de Nieto. Asume costo político: critica al Congreso donde necesitaría aliados." },
  // NIETO — criminalidad
  { id: "eval-nieto-criminalidad", entidadId: "jorge-nieto-montesinos", fuenteId: "f-nieto-criminalidad", estadio: 4, confianza: "alta" as const,
    justificacion: "Admite que 'no estamos dando la respuesta adecuada'. Humildad institucional: reconoce el fracaso del Estado sin echar culpas a otros. Propone respuesta institucional, no de fuerza.",
    citas: [{ texto: "No estamos dando la respuesta adecuada para detener esta ola de criminalidad", ubicacion: "Entrevista El Comercio", indicador: "Autocrítica institucional — Estadio 4" }],
    estadioAlternativo: 3, notas: "La autocrítica es rara en políticos peruanos. Indica razonamiento de Estadio 4+." },

  // LÓPEZ CHAU — sistema anticorrupción autónomo
  { id: "eval-lopez-chau-anticorrupcion", entidadId: "pablo-alfonso-lopez-chau-nava", fuenteId: "f-lopez-chau-anticorrupcion", estadio: 5, confianza: "alta" as const,
    justificacion: "Propone un sistema integral anticorrupción AUTÓNOMO. La palabra clave es 'autónomo': reconoce que las instituciones actuales están capturadas y necesitan independencia del poder político. Es Estadio 5: crear instituciones nuevas basadas en principios de justicia previos al sistema actual.",
    citas: [{ texto: "Propuso crear un sistema integral anticorrupción autónomo", ubicacion: "Debate JNE 23/03", indicador: "Creación institucional basada en principio de autonomía — Estadio 5" }],
    estadioAlternativo: 4, notas: "Consistente con su diagnóstico de Estado capturado y propuesta de nueva Constitución." },
  // LÓPEZ CHAU — derecho internacional
  { id: "eval-lopez-chau-dcho-intl", entidadId: "pablo-alfonso-lopez-chau-nava", fuenteId: "f-lopez-chau-dcho-intl", estadio: 5, confianza: "alta" as const,
    justificacion: "Defiende el derecho internacional frente a acciones militares de EEUU. Articula que la soberanía es un principio previo al poder militar. Asume costo político: criticar a EEUU no es popular. Estadio 5: principios universales de soberanía sobre el poder de facto.",
    citas: [{ texto: "El respeto a la soberanía es clave", ubicacion: "Entrevista EFE, 03/04/2026", indicador: "Principio de soberanía como derecho universal — Estadio 5" }],
    estadioAlternativo: 4, notas: "López Chau es consistentemente post-convencional. Sus posiciones tienen costo político y las asume." },
  // LÓPEZ CHAU — gas tarifa única
  { id: "eval-lopez-chau-gas-tarifa-unica", entidadId: "pablo-alfonso-lopez-chau-nava", fuenteId: "f-lopez-chau-gas", estadio: 4, confianza: "media" as const,
    justificacion: "Propone masificación del gas con tarifa única (mismo precio Lima que Megantoni). Es una propuesta de equidad territorial a través de política pública. Estadio 4: usa el Estado para corregir desigualdades dentro del marco institucional.",
    citas: [{ texto: "La masificación del gas será una realidad y con tarifa única costará lo mismo en Lima que en Megantoni", ubicacion: "Debate JNE última jornada", indicador: "Equidad territorial mediante política pública — Estadio 4" }],
    estadioAlternativo: 5, notas: "Podría ser 5 si articulara el acceso a energía como derecho. Pero se queda en propuesta de política pública." },
];

// Scores acumulados
const PREV: Record<string, number[]> = {
  "keiko-sofia-fujimori-higuchi": [3, 3, 2, 2],
  "rafael-bernardo-lopez-aliaga-cazorla": [1, 2, 1, 1],
  "george-patrick-forsyth-sommer": [2, 3, 2],
  "cesar-acuna-peralta": [2, 3, 2],
  "jorge-nieto-montesinos": [4, 4],
  "pablo-alfonso-lopez-chau-nava": [5, 4, 5],
};
for (const ev of EVALUACIONES) {
  if (!PREV[ev.entidadId]) PREV[ev.entidadId] = [];
  PREV[ev.entidadId].push(ev.estadio);
}

async function main() {
  console.log(`\nRegistrando ${FUENTES.length} fuentes + ${EVALUACIONES.length} evaluaciones...\n`);

  for (const f of FUENTES) {
    await setDoc(doc(db, "fuentes", f.id), { ...f, calidadIA: null, creadaPor: "moralscore-bot", createdAt: new Date().toISOString() }, { merge: true });
  }

  for (const ev of EVALUACIONES) {
    await setDoc(doc(db, "evaluaciones", ev.id), { ...ev, evaluador: "lucas", validadoPor: null, createdAt: new Date().toISOString() });
    console.log(`  + ${ev.entidadId} — Estadio ${ev.estadio}`);
  }

  console.log("\nActualizando scores...\n");
  for (const [id, estadios] of Object.entries(PREV)) {
    const score = median(estadios);
    await setDoc(doc(db, "entidades", id), { scoreActual: score, totalEvaluaciones: estadios.length }, { merge: true });
    console.log(`  * ${id} → mediana ${score} (${estadios.length} evals: [${estadios.join(",")}])`);
  }

  console.log("\nRonda 4 completada.\n");
}

main().catch(console.error);
