/**
 * Oleada 2, Lote A — Segunda evaluacion por candidato (10 candidatos iniciales)
 * Fuentes DIFERENTES a oleada 1. Temas distintos priorizados.
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
  // 1. Ronald Darwin Atencio Sotomayor — oleada 1 fue mineros/debate, ahora educacion/impuestos
  { id: "f-oleada2-ronald-darwin-atencio-sotomayor", url: "https://rpp.pe/politica/elecciones/ronald-atencio-propone-impuestos-a-las-grandes-fortunas-para-financiar-la-educacion-noticia-1682339", tipo: "debate", titulo: "Atencio propone impuestos a grandes fortunas para financiar educacion", medio: "RPP", fechaFuente: "2026-03-30", entidadId: "ronald-darwin-atencio-sotomayor", estado: "evaluada" },

  // 2. Jose Daniel Williams Zapata — oleada 1 fue estado de guerra, ahora educacion rural
  { id: "f-oleada2-jose-daniel-williams-zapata", url: "https://gestion.pe/peru/jose-williams-plantea-educacion-rural-con-conectividad-mas-becas-y-bonos-a-docentes-noticia/", tipo: "debate", titulo: "Williams plantea educacion rural con conectividad, becas y bonos a docentes", medio: "Gestion", fechaFuente: "2026-04-01", entidadId: "jose-daniel-williams-zapata", estado: "evaluada" },

  // 3. Alvaro Gonzalo Paz de la Barra Freigeiro — oleada 1 fue sin debido proceso, ahora economia/desempleo
  { id: "f-oleada2-alvaro-gonzalo-paz-de-la-barra-freigeiro", url: "https://gestion.pe/economia/paz-de-la-barra-propone-subvencion-por-seis-meses-ante-desempleo-noticia/", tipo: "debate", titulo: "Paz de la Barra propone subvencion de S/1500 por seis meses ante desempleo", medio: "Gestion", fechaFuente: "2026-03-30", entidadId: "alvaro-gonzalo-paz-de-la-barra-freigeiro", estado: "evaluada" },

  // 4. Fiorella Giannina Molinelli Aristondo — oleada 1 fue confronta a Sanchez, ahora educacion/docentes
  { id: "f-oleada2-fiorella-giannina-molinelli-aristondo", url: "https://gestion.pe/economia/fiorella-molinelli-propone-incrementar-el-sueldo-de-los-docentes-y-reforzar-el-senati-noticia/", tipo: "debate", titulo: "Molinelli propone incrementar sueldo de docentes y reforzar Senati", medio: "Gestion", fechaFuente: "2026-03-30", entidadId: "fiorella-giannina-molinelli-aristondo", estado: "evaluada" },

  // 5. Roberto Helbert Sanchez Palomino — oleada 1 fue nueva constitucion, ahora educacion/populismo educativo
  { id: "f-oleada2-roberto-helbert-sanchez-palomino", url: "https://www.infobae.com/peru/2026/04/01/roberto-sanchez-apuesta-por-populismo-educativo-con-ingreso-libre-a-universidades-y-continuar-con-agenda-de-pedro-castillo/", tipo: "articulo", titulo: "Sanchez apuesta por ingreso libre a universidades y continuar agenda de Castillo", medio: "Infobae", fechaFuente: "2026-04-01", entidadId: "roberto-helbert-sanchez-palomino", estado: "evaluada" },

  // 6. Rafael Jorge Belaunde Llosa — oleada 1 fue becas con canon, ahora Corte IDH/principios liberales
  { id: "f-oleada2-rafael-jorge-belaunde-llosa", url: "https://ojo-publico.com/entrevistas/rafael-belaunde-llosa-salirse-la-corte-idh-es-un-disparate", tipo: "entrevista", titulo: "Belaunde: salirse de la Corte IDH es un disparate", medio: "Ojo Publico", fechaFuente: "2026-03-15", entidadId: "rafael-jorge-belaunde-llosa", estado: "evaluada" },

  // 7. Pitter Enrique Valderrama Pena — oleada 1 fue cadena perpetua, ahora salud mental
  { id: "f-oleada2-pitter-enrique-valderrama-pena", url: "https://www.infobae.com/peru/2026/03/26/enrique-valderrama-propone-duplicar-presupuesto-de-salud-mental-y-garantizar-psicologos-en-colegios-sera-una-prioridad/", tipo: "debate", titulo: "Valderrama propone duplicar presupuesto de salud mental y psicologos en colegios", medio: "Infobae", fechaFuente: "2026-03-26", entidadId: "pitter-enrique-valderrama-pena", estado: "evaluada" },

  // 8. Ricardo Pablo Belmont Cassinelli — oleada 1 fue educacion emotivo, ahora seguridad/propuestas vagas
  { id: "f-oleada2-ricardo-pablo-belmont-cassinelli", url: "https://ojobionico.ojo-publico.com/articulo/belmont-el-candidato-de-las-propuestas-vagas/", tipo: "articulo", titulo: "Belmont: el candidato de las propuestas vagas — analisis fact-check", medio: "Ojo Publico", fechaFuente: "2026-03-28", entidadId: "ricardo-pablo-belmont-cassinelli", estado: "evaluada" },

  // 9. Charlie Carrasco Salazar — oleada 1 fue principios biblicos, ahora empleo/shock inversion
  { id: "f-oleada2-charlie-carrasco-salazar", url: "https://www.infobae.com/peru/2026/03/25/servicio-militar-obligatorio-expulsion-de-extranjeros-ilegales-y-eliminacion-de-la-atu-las-propuestas-de-charlie-carrasco/", tipo: "debate", titulo: "Carrasco: servicio militar obligatorio, expulsion de extranjeros y eliminacion de ATU", medio: "Infobae", fechaFuente: "2026-03-25", entidadId: "charlie-carrasco-salazar", estado: "evaluada" },

  // 10. Alex Gonzales Castillo — oleada 1 fue increpa a Lopez Aliaga, ahora fusion ministerios/seguridad
  { id: "f-oleada2-alex-gonzales-castillo", url: "https://gestion.pe/peru/politica/alex-gonzales-candidato-del-partido-democrata-verde-propone-la-fusion-del-ministerio-de-interior-con-defensa-noticia/", tipo: "debate", titulo: "Gonzales propone fusionar Ministerio de Interior con Defensa contra delincuencia", medio: "Gestion", fechaFuente: "2026-03-23", entidadId: "alex-gonzales-castillo", estado: "evaluada" },
];

const EVALUACIONES = [
  // 1. Ronald Darwin Atencio Sotomayor — educacion/redistribucion
  { id: "eval-oleada2-ronald-darwin-atencio-sotomayor", entidadId: "ronald-darwin-atencio-sotomayor", fuenteId: "f-oleada2-ronald-darwin-atencio-sotomayor", estadio: 2, confianza: "media" as const,
    justificacion: "Razonamiento instrumental: gravar fortunas para redistribuir a educacion. No articula principio de justicia, solo mecanica de quien tiene paga.",
    citas: [{ texto: "Vamos a aplicar impuestos a las grandes riquezas y a las grandes fortunas, porque para educacion, innovacion, se requiere dinero, senores", ubicacion: "Debate JNE cuarta fecha, bloque educacion", indicador: "Transaccional — redistribucion como mecanica, no como principio de equidad" }],
    estadioAlternativo: 3, notas: "Tema diferente a oleada 1 (mineros). Mismo patron transaccional: Estado extrae de ricos, da a pueblo." },

  // 2. Jose Daniel Williams Zapata — educacion rural
  { id: "eval-oleada2-jose-daniel-williams-zapata", entidadId: "jose-daniel-williams-zapata", fuenteId: "f-oleada2-jose-daniel-williams-zapata", estadio: 3, confianza: "media" as const,
    justificacion: "Discurso paternalista hacia zonas rurales. Propuestas genericas de conectividad y becas sin marco institucional claro. Busca imagen de candidato inclusivo.",
    citas: [{ texto: "Si dejamos de lado a tantas personas, vamos a correr el riesgo de atrasarnos en el desarrollo. Debemos impulsar la educacion de los jovenes y ninos que estan muy lejos de las ciudades", ubicacion: "Debate JNE ultima fecha, bloque educacion", indicador: "Busca aprobacion — inclusion como imagen, no como derecho articulado" }],
    estadioAlternativo: 2, notas: "Tema diferente a oleada 1 (estado de guerra). Sube de estadio 1 a 3: en educacion no recurre a fuerza sino a paternalismo." },

  // 3. Alvaro Gonzalo Paz de la Barra Freigeiro — economia/desempleo
  { id: "eval-oleada2-alvaro-gonzalo-paz-de-la-barra-freigeiro", entidadId: "alvaro-gonzalo-paz-de-la-barra-freigeiro", fuenteId: "f-oleada2-alvaro-gonzalo-paz-de-la-barra-freigeiro", estadio: 2, confianza: "media" as const,
    justificacion: "Propuesta transaccional pura: S/1500 por 6 meses como dadiva estatal. No articula reformas estructurales ni derechos laborales. Logica de intercambio.",
    citas: [{ texto: "Vamos a dar el acompanamiento tecnico para que el Peru despegue, tenga desarrollo y progreso. Si avanza, vamos a inyectarle mas", ubicacion: "Debate JNE cuarta fecha, bloque empleo", indicador: "Transaccional — subsidio como intercambio, sin reforma institucional" }],
    estadioAlternativo: 3, notas: "Tema diferente a oleada 1 (sin debido proceso). Mejora relativa pero sigue pre-convencional: promesas de dinero sin marco de derechos." },

  // 4. Fiorella Giannina Molinelli Aristondo — educacion/docentes
  { id: "eval-oleada2-fiorella-giannina-molinelli-aristondo", entidadId: "fiorella-giannina-molinelli-aristondo", fuenteId: "f-oleada2-fiorella-giannina-molinelli-aristondo", estadio: 4, confianza: "media" as const,
    justificacion: "Articula propuestas dentro de marco institucional: meritocracia docente, modelo aleman, brechas cuantificadas. Apela a sistema educativo como institucion.",
    citas: [{ texto: "No podemos normalizar que las escuelas se caigan a pedazos, que los alumnos vivan en situaciones indignas y que los maestros esten olvidados por el Estado", ubicacion: "Debate JNE cuarta fecha, bloque educacion", indicador: "Apelacion a dignidad institucional y obligacion del Estado" }],
    estadioAlternativo: 3, notas: "Tema diferente a oleada 1 (confronta a Sanchez). Sube de estadio 3 a 4: en educacion articula marco institucional con datos." },

  // 5. Roberto Helbert Sanchez Palomino — educacion/ingreso libre
  { id: "eval-oleada2-roberto-helbert-sanchez-palomino", entidadId: "roberto-helbert-sanchez-palomino", fuenteId: "f-oleada2-roberto-helbert-sanchez-palomino", estadio: 2, confianza: "media" as const,
    justificacion: "Promesas populistas sin viabilidad: ingreso libre, 10% del PBI en educacion. Continuidad de agenda Castillo como lealtad personal, no principio. Logica transaccional.",
    citas: [{ texto: "El ingreso libre a la educacion superior sera un derecho de nuestro pueblo", ubicacion: "Debate JNE quinta fecha, bloque educacion", indicador: "Transaccional — promesa populista como intercambio por apoyo electoral" }],
    estadioAlternativo: 3, notas: "Tema diferente a oleada 1 (nueva constitucion). Baja de 3 a 2: promesas inviables y lealtad personal a Castillo revelan instrumentalismo." },

  // 6. Rafael Jorge Belaunde Llosa — Corte IDH / principios
  { id: "eval-oleada2-rafael-jorge-belaunde-llosa", entidadId: "rafael-jorge-belaunde-llosa", fuenteId: "f-oleada2-rafael-jorge-belaunde-llosa", estadio: 5, confianza: "media" as const,
    justificacion: "Defiende Corte IDH como garantia de derechos en pais con transgresiones. Rechaza pena de muerte como ineficaz. Reconoce que instituciones supranacionales protegen principios universales.",
    citas: [{ texto: "Salirse de la Corte me parece un disparate. En un pais con un record de constantes transgresiones a los derechos individuales, la Corte es una garantia", ubicacion: "Entrevista Ojo Publico", indicador: "Reconoce que leyes nacionales pueden ser insuficientes; apela a principios universales de derechos" }],
    estadioAlternativo: 4, notas: "Tema diferente a oleada 1 (becas con canon). Sube de 4 a 5: explicita defensa de derechos supranacionales como principio superior a soberania." },

  // 7. Pitter Enrique Valderrama Pena — salud mental
  { id: "eval-oleada2-pitter-enrique-valderrama-pena", entidadId: "pitter-enrique-valderrama-pena", fuenteId: "f-oleada2-pitter-enrique-valderrama-pena", estadio: 3, confianza: "media" as const,
    justificacion: "Propuesta de salud mental busca imagen de candidato sensible. Promesas grandilocuentes (500 postas, 40 hospitales) sin plan de financiamiento. Busca aprobacion.",
    citas: [{ texto: "A veces hay psicologos que tienen que encargarse de diez o veinte colegios y no se dan abasto. Nosotros vamos a corregir eso", ubicacion: "Debate JNE tercera fecha, bloque salud", indicador: "Busca aprobacion — diagnostico correcto pero soluciones grandilocuentes sin sustento" }],
    estadioAlternativo: 4, notas: "Tema diferente a oleada 1 (cadena perpetua). Sube de 2 a 3: en salud mental no recurre a castigo pero sigue buscando aprobacion sin plan viable." },

  // 8. Ricardo Pablo Belmont Cassinelli — propuestas vagas / fact-check
  { id: "eval-oleada2-ricardo-pablo-belmont-cassinelli", entidadId: "ricardo-pablo-belmont-cassinelli", fuenteId: "f-oleada2-ricardo-pablo-belmont-cassinelli", estadio: 2, confianza: "alta" as const,
    justificacion: "69% de propuestas vagas o inviables segun fact-check. Responde con evasivas ante ciudadanos. Usa xenofobia para ganar visibilidad. Pura instrumentalidad.",
    citas: [{ texto: "Mi propuesta es darte un beso, mi amor. Si yo les hago una propuesta, se me achoran si no cumplo", ubicacion: "Respuesta a ciudadanos en Mercado Ciudad de Dios", indicador: "Evasion total, relacion instrumental con electorado" }],
    estadioAlternativo: 1, notas: "Tema diferente a oleada 1 (educacion emotivo). Baja de 3 a 2: evidencia de fact-check muestra instrumentalidad pura, no solo paternalismo." },

  // 9. Charlie Carrasco Salazar — servicio militar obligatorio / expulsiones
  { id: "eval-oleada2-charlie-carrasco-salazar", entidadId: "charlie-carrasco-salazar", fuenteId: "f-oleada2-charlie-carrasco-salazar", estadio: 1, confianza: "alta" as const,
    justificacion: "Servicio militar obligatorio para ninis, expulsion en 48h, cadena perpetua. Todo basado en fuerza y castigo. Consistente con oleada 1.",
    citas: [{ texto: "Servicio militar obligatorio para jovenes que no estudian ni trabajan", ubicacion: "Debate JNE tercera fecha, bloque seguridad", indicador: "Castigo/obediencia — fuerza como disciplina social, sin considerar derechos individuales" }],
    estadioAlternativo: null, notas: "Tema diferente a oleada 1 (principios biblicos). Se mantiene en estadio 1: patron autoritario consistente en todos los temas." },

  // 10. Alex Gonzales Castillo — fusion ministerios seguridad
  { id: "eval-oleada2-alex-gonzales-castillo", entidadId: "alex-gonzales-castillo", fuenteId: "f-oleada2-alex-gonzales-castillo", estadio: 2, confianza: "media" as const,
    justificacion: "Propuesta de fusionar Interior con Defensa es instrumentalizar instituciones para concentrar fuerza. Logica cuantitativa: 300 mil efectivos = solucion.",
    citas: [{ texto: "Propongo la fusion del Ministerio de Interior con Defensa. Al fusionar ambos ministerios, tendriamos 300 mil efectivos para reprimir la delincuencia", ubicacion: "Debate JNE primera fecha, bloque seguridad", indicador: "Instrumental — mas fuerza = solucion, sin considerar derechos ni reforma institucional" }],
    estadioAlternativo: 1, notas: "Tema diferente a oleada 1 (increpa a Lopez Aliaga). Se mantiene en estadio 2: logica cuantitativa instrumental." },
];

async function main() {
  console.log(`\nRegistrando ${FUENTES.length} fuentes + ${EVALUACIONES.length} evaluaciones (Oleada 2 - Lote A)...\n`);

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

  console.log("\n=== OLEADA 2, LOTE A COMPLETADA (10 evaluaciones) ===\n");
}

main().catch(console.error);
