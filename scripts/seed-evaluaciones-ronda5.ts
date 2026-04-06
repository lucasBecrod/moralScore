/**
 * Ronda 5 — Completando hacia 10 evaluaciones por candidato
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
  { id: "f-keiko-disculpa-saavedra", url: "https://rpp.pe/politica/elecciones/elecciones-2021-keiko-fujimori-tengo-que-pedir-disculpas-tanto-a-jaime-saavedra-como-a-fernando-zavala-noticia-1338332", tipo: "entrevista", titulo: "Keiko: 'Tengo que pedir disculpas a Saavedra y Zavala'", medio: "RPP", fechaFuente: "2021-05-15", entidadId: "keiko-sofia-fujimori-higuchi", estado: "evaluada" },
  { id: "f-keiko-energia-ministro", url: "https://larepublica.pe/politica/2026/03/19/keiko-fujimori-sobre-el-ministro-de-energia-y-minas-una-persona-que-tiene-este-tipo-de-acusaciones-no-debe-ejercer-este-cargo-hnews-1398172", tipo: "articulo", titulo: "Keiko sobre ministro de Energía: 'no debe ejercer el cargo'", medio: "La República", fechaFuente: "2026-03-19", entidadId: "keiko-sofia-fujimori-higuchi", estado: "evaluada" },
  { id: "f-rla-potencia-mundial", url: "https://larepublica.pe/politica/2026/02/24/ya-no-es-lima-potencia-mundial-rafael-lopez-aliaga-promete-ahora-que-peru-sera-potencia-turistica-hnews-662088", tipo: "articulo", titulo: "López Aliaga: de 'Lima potencia mundial' a 'Perú potencia turística'", medio: "La República", fechaFuente: "2026-02-24", entidadId: "rafael-bernardo-lopez-aliaga-cazorla", estado: "evaluada" },
  { id: "f-rla-neutralidad", url: "https://rpp.pe/politica/elecciones/rafael-lopez-aliaga-cerro-su-gestion-como-alcalde-con-investigacion-por-presunta-vulneracion-a-la-neutralidad-noticia-1659563", tipo: "articulo", titulo: "López Aliaga cerró gestión con investigación por vulnerar neutralidad", medio: "RPP", fechaFuente: "2025-12-01", entidadId: "rafael-bernardo-lopez-aliaga-cazorla", estado: "evaluada" },
  { id: "f-forsyth-chatgpt-plan", url: "https://larepublica.pe/politica/2026/02/09/george-forsyth-apuesta-por-la-ia-pero-chatgpt-cuestiona-su-plan-de-gobierno-no-esta-bien-elaborado-hnews-310329", tipo: "entrevista", titulo: "ChatGPT cuestiona plan de Forsyth: 'No está bien elaborado'", medio: "La República", fechaFuente: "2026-02-09", entidadId: "george-patrick-forsyth-sommer", estado: "evaluada" },
  { id: "f-forsyth-regiones-congreso", url: "https://larepublica.pe/politica/2026/03/14/forsyth-propone-gobernar-desde-regiones-marca-distancia-con-jeri-y-cuestiona-al-congreso-hnews-399518", tipo: "entrevista", titulo: "Forsyth: gobernar desde regiones, cuestiona al Congreso", medio: "La República", fechaFuente: "2026-03-14", entidadId: "george-patrick-forsyth-sommer", estado: "evaluada" },
  { id: "f-acuna-vallejo-baja", url: "https://rpp.pe/peru/la-libertad/cesar-acuna-bromea-sobre-poco-gasto-de-la-libertad-en-seguridad-parece-la-vallejo-en-baja-noticia-1579416", tipo: "entrevista", titulo: "Acuña bromea: 'La región está como la Vallejo, en baja'", medio: "RPP", fechaFuente: "2024-08-25", entidadId: "cesar-acuna-peralta", estado: "evaluada" },
  { id: "f-acuna-olivera-difamacion", url: "https://rpp.pe/politica/elecciones/cesar-acuna-rechazo-acusaciones-de-fernando-olivera-en-el-debate-y-anuncio-que-lo-denunciara-por-difamacion-noticia-1681448", tipo: "debate", titulo: "Acuña rechaza acusaciones de Olivera, anuncia denuncia", medio: "RPP", fechaFuente: "2026-03-23", entidadId: "cesar-acuna-peralta", estado: "evaluada" },
  { id: "f-acuna-china-viaje", url: "https://elcomercio.pe/politica/actualidad/cesar-acuna-asegura-que-fue-invitado-a-china-como-gobernador-de-la-libertad-y-no-como-fundador-de-la-universidad-cesar-vallejo-ucv-ultimas-noticia/", tipo: "entrevista", titulo: "Acuña: 'Fui invitado a China como gobernador, no como rector'", medio: "El Comercio", fechaFuente: "2025-02-01", entidadId: "cesar-acuna-peralta", estado: "evaluada" },
  { id: "f-nieto-villaran-defensa", url: "https://larepublica.pe/politica/2023/06/09/trujillo-jorge-nieto-la-verdad-se-abrira-paso-las-acusaciones-son-falsas-en-el-caso-de-la-constructora-oas-susana-villaran-fiscalia-lrnd-142092", tipo: "entrevista", titulo: "Nieto: 'Las acusaciones son falsas en el caso OAS'", medio: "La República", fechaFuente: "2023-06-09", entidadId: "jorge-nieto-montesinos", estado: "evaluada" },
  { id: "f-nieto-calumnia-castro", url: "https://rpp.pe/politica/judiciales/jorge-nieto-dice-que-denunciara-a-jose-miguel-castro-por-difamacion-lo-que-senala-es-una-calumnia-noticia-1280201", tipo: "entrevista", titulo: "Nieto: 'Lo que señala Castro es una calumnia'", medio: "RPP", fechaFuente: "2020-07-14", entidadId: "jorge-nieto-montesinos", estado: "evaluada" },
  { id: "f-lopez-chau-formato-debate", url: "https://elcomercio.pe/politica/elecciones/elecciones-generales-2026-alfonso-lopez-chau-cuestiona-formato-de-debates-organizados-por-el-jne-me-hubiera-gustado-que-los-candidatos-tengan-tiempo-para-exponer-sus-ideas-ultimas-noticia/", tipo: "entrevista", titulo: "López Chau cuestiona formato de debates del JNE", medio: "El Comercio", fechaFuente: "2026-04-02", entidadId: "pablo-alfonso-lopez-chau-nava", estado: "evaluada" },
  { id: "f-lopez-chau-rector-mistica", url: "https://ojo-publico.com/entrevistas/alfonso-lopez-chau-creo-que-necesitamos-una-nueva-constitucion", tipo: "entrevista", titulo: "López Chau: 'Llegué a ser rector sin plata, creo en la mística'", medio: "Ojo Público", fechaFuente: "2026-03-01", entidadId: "pablo-alfonso-lopez-chau-nava", estado: "evaluada" },
];

const EVALUACIONES = [
  // KEIKO — disculpa a Saavedra
  { id: "eval-keiko-disculpa-saavedra", entidadId: "keiko-sofia-fujimori-higuchi", fuenteId: "f-keiko-disculpa-saavedra", estadio: 4, confianza: "media" as const,
    justificacion: "Pide disculpas públicamente por la censura a Saavedra. Reconoce que 'esto se pudo haber evitado'. Es un acto de autocrítica raro en la política peruana. Estadio 4: reconoce que la acción violó normas institucionales de respeto al poder ejecutivo.",
    citas: [{ texto: "Tengo que pedir disculpas tanto a Jaime Saavedra como a Fernando Zavala", ubicacion: "Entrevista Perú21, 2021", indicador: "Autocrítica y reconocimiento de error institucional — Estadio 4" }],
    estadioAlternativo: 3, notas: "Mejor evaluación de Keiko. Pero fue 5 años después del hecho y en contexto de campaña (2021), lo que reduce la espontaneidad." },
  // KEIKO — ministro Energía
  { id: "eval-keiko-ministro-energia", entidadId: "keiko-sofia-fujimori-higuchi", fuenteId: "f-keiko-energia-ministro", estadio: 4, confianza: "media" as const,
    justificacion: "Argumenta que una persona acusada no debe ejercer cargo público. Apela a un estándar ético institucional. Estadio 4: respeto a las normas de idoneidad en función pública.",
    citas: [{ texto: "Una persona que tiene este tipo de acusaciones no debe ejercer este cargo", ubicacion: "Declaración sobre ministro de Energía, marzo 2026", indicador: "Estándar ético institucional — Estadio 4" }],
    estadioAlternativo: 3, notas: "Coherente con Estadio 4, pero ironía: su propio partido tiene investigados. Congruencia cuestionable." },

  // LÓPEZ ALIAGA — cambio de promesas
  { id: "eval-rla-potencia-cambio", entidadId: "rafael-bernardo-lopez-aliaga-cazorla", fuenteId: "f-rla-potencia-mundial", estadio: 2, confianza: "alta" as const,
    justificacion: "Cambió su eslogan de 'Lima potencia mundial' a 'Perú potencia turística' sin explicar por qué abandonó la primera promesa. Patrón de promesas transaccionales que mutan según conveniencia electoral. Viola regla Gert #7 (cumplir promesas).",
    citas: [{ texto: "De 'Lima potencia mundial' a 'Perú potencia turística'", ubicacion: "Reportaje La República, febrero 2026", indicador: "Mutación de promesas por conveniencia — Estadio 2" }],
    estadioAlternativo: null, notas: "Ni siquiera intenta justificar el cambio." },
  // LÓPEZ ALIAGA — vulneración neutralidad
  { id: "eval-rla-neutralidad-electoral", entidadId: "rafael-bernardo-lopez-aliaga-cazorla", fuenteId: "f-rla-neutralidad", estadio: 1, confianza: "alta" as const,
    justificacion: "Investigado por vulnerar la neutralidad electoral siendo alcalde. Usó el cargo público para beneficio de su candidatura. Viola regla Gert #8 (no hacer trampa) y #9 (obedecer la ley).",
    citas: [{ texto: "Cerró su gestión como alcalde con investigación por presunta vulneración a la neutralidad", ubicacion: "RPP, diciembre 2025", indicador: "Uso del cargo público para beneficio electoral — Estadio 1" }],
    estadioAlternativo: null, notas: "Patrón consistente de instrumentalización del poder." },

  // FORSYTH — ChatGPT vs plan
  { id: "eval-forsyth-chatgpt-plan", entidadId: "george-patrick-forsyth-sommer", fuenteId: "f-forsyth-chatgpt-plan", estadio: 3, confianza: "media" as const,
    justificacion: "Ante la crítica de ChatGPT a su plan ('no está bien elaborado'), Forsyth refuta diciendo que 'está entre los 5 mejores de 36'. No aborda la sustancia de la crítica (falta de metas medibles, financiamiento). Defiende por comparación, no por argumentación. Estadio 3: busca validación externa.",
    citas: [{ texto: "Su plan está entre los 5 mejores de los 36 candidatos", ubicacion: "Entrevista Fuego Cruzado, febrero 2026", indicador: "Defensa por comparación, no por sustancia — Estadio 3" }],
    estadioAlternativo: 2, notas: "Oportunidad perdida: podría haber reconocido debilidades y propuesto mejoras (Estadio 4)." },
  // FORSYTH — gobernar desde regiones
  { id: "eval-forsyth-regiones", entidadId: "george-patrick-forsyth-sommer", fuenteId: "f-forsyth-regiones-congreso", estadio: 4, confianza: "media" as const,
    justificacion: "Propone gobernar desde las regiones y cuestiona al Congreso. Marca distancia con el presidente del Congreso. Muestra razonamiento institucional: el poder debe estar descentralizado, el Congreso no debe concentrar poder.",
    citas: [{ texto: "Propone gobernar desde regiones, marca distancia con Jerí y cuestiona al Congreso", ubicacion: "Entrevista La República, marzo 2026", indicador: "Descentralización y cuestionamiento institucional — Estadio 4" }],
    estadioAlternativo: 3, notas: "Mejor propuesta de Forsyth. Si articulara por qué la descentralización es un derecho, sería Estadio 5." },

  // ACUÑA — broma sobre baja inversión
  { id: "eval-acuna-vallejo-baja", entidadId: "cesar-acuna-peralta", fuenteId: "f-acuna-vallejo-baja", estadio: 1, confianza: "alta" as const,
    justificacion: "Como gobernador, bromea sobre la baja ejecución en seguridad de su propia región ('parece la Vallejo, en baja'). Solo gastó S/863,833 de S/9 millones. Trivializa un fracaso de gestión que afecta la seguridad ciudadana. Viola regla Gert #10 (cumplir con el deber).",
    citas: [{ texto: "La región está como la Vallejo, en baja (risas). Parece la Vallejo, en baja (risas)", ubicacion: "Visita a obra GORE La Libertad, agosto 2024", indicador: "Trivialización de fracaso de gestión pública — Estadio 1" }],
    estadioAlternativo: null, notas: "Gastó menos del 10% del presupuesto de seguridad y se ríe. Estadio 1 claro." },
  // ACUÑA — Olivera difamación
  { id: "eval-acuna-olivera", entidadId: "cesar-acuna-peralta", fuenteId: "f-acuna-olivera-difamacion", estadio: 2, confianza: "media" as const,
    justificacion: "Ante acusaciones de Olivera en el debate, responde con amenaza de denuncia por difamación. No aborda el contenido de las acusaciones, solo ataca al mensajero. Razonamiento defensivo instrumental.",
    citas: [{ texto: "Rechazó acusaciones de Olivera y anunció que lo denunciará por difamación", ubicacion: "Debate JNE 23/03", indicador: "Ataque al mensajero sin abordar contenido — Estadio 2" }],
    estadioAlternativo: 3, notas: "Patrón: cuando lo confrontan, amenaza con demandas en vez de argumentar." },
  // ACUÑA — viaje a China
  { id: "eval-acuna-china", entidadId: "cesar-acuna-peralta", fuenteId: "f-acuna-china-viaje", estadio: 2, confianza: "media" as const,
    justificacion: "Justifica viaje a China diciendo que fue 'como gobernador, no como rector'. Distingue entre roles para evadir el conflicto de interés entre su función pública y su universidad privada. Razonamiento instrumental.",
    citas: [{ texto: "Fui invitado a China como gobernador de La Libertad y no como fundador de la Universidad César Vallejo", ubicacion: "Entrevista El Comercio", indicador: "Distinción de roles para evadir conflicto de interés — Estadio 2" }],
    estadioAlternativo: 3, notas: "La distinción es formalmente correcta pero sustancialmente débil." },

  // NIETO — defensa caso OAS
  { id: "eval-nieto-oas-defensa", entidadId: "jorge-nieto-montesinos", fuenteId: "f-nieto-villaran-defensa", estadio: 4, confianza: "media" as const,
    justificacion: "Niega categóricamente las acusaciones y apela al proceso legal: 'la verdad se abrirá paso, las acusaciones son falsas'. Confía en el sistema de justicia para reivindicarse. Estadio 4: respeto al proceso institucional como mecanismo de verdad.",
    citas: [{ texto: "La verdad se abrirá paso, las acusaciones son falsas en el caso de la constructora OAS", ubicacion: "Declaración en Trujillo, 2023", indicador: "Confianza en el proceso institucional — Estadio 4" }],
    estadioAlternativo: 3, notas: "Si las acusaciones resultan ciertas, este Estadio 4 se convierte en Estadio 2 (manipulación)." },
  // NIETO — Castro calumnia
  { id: "eval-nieto-castro-calumnia", entidadId: "jorge-nieto-montesinos", fuenteId: "f-nieto-calumnia-castro", estadio: 4, confianza: "media" as const,
    justificacion: "Responde a acusaciones de Castro con 'lo que señala es una calumnia' y anuncia denuncia por difamación. A diferencia de Acuña (que solo amenaza), Nieto articula que las acusaciones dañan 'un honor inmaculado de más de 6 décadas'. Apela a principios de honra y justicia.",
    citas: [
      { texto: "Lo que señala José Miguel Castro es una calumnia", ubicacion: "Declaración RPP, 2020", indicador: "Defensa basada en honor y justicia — Estadio 4" },
      { texto: "Daña un honor inmaculado de más de 6 décadas de vida", ubicacion: "Declaración RPP, 2020", indicador: "Apelación a trayectoria de vida como evidencia — Estadio 4" },
    ],
    estadioAlternativo: 3, notas: "Similar a su defensa en el caso OAS. Consistente: confía en instituciones." },

  // LÓPEZ CHAU — formato debate
  { id: "eval-lopez-chau-formato-debate", entidadId: "pablo-alfonso-lopez-chau-nava", fuenteId: "f-lopez-chau-formato-debate", estadio: 4, confianza: "alta" as const,
    justificacion: "Cuestiona el formato del debate del JNE: 'me hubiera gustado que los candidatos tengan tiempo para exponer sus ideas'. No critica al JNE como institución sino al formato. Propone mejora constructiva. Estadio 4: busca mejorar las instituciones, no destruirlas.",
    citas: [{ texto: "Me hubiera gustado que los candidatos tengan tiempo para exponer sus ideas", ubicacion: "Entrevista post-debate El Comercio", indicador: "Crítica constructiva a formato institucional — Estadio 4" }],
    estadioAlternativo: 3, notas: "Evaluación moderada de López Chau. No todas sus intervenciones son Estadio 5." },
  // LÓPEZ CHAU — mística y rector
  { id: "eval-lopez-chau-mistica-rector", entidadId: "pablo-alfonso-lopez-chau-nava", fuenteId: "f-lopez-chau-rector-mistica", estadio: 5, confianza: "media" as const,
    justificacion: "Dice 'llegué a ser rector sin plata, creo en la mística'. Articula que el liderazgo se basa en valores y convicciones, no en recursos económicos. Costo político: en Perú decir que no tienes plata para campaña te descalifica ante muchos. Lo asume por principio.",
    citas: [{ texto: "Yo creo en la mística. Yo llegué a ser rector, sin plata", ubicacion: "Entrevista Ojo Público", indicador: "Liderazgo basado en convicciones sobre recursos — Estadio 5" }],
    estadioAlternativo: 4, notas: "Coherente con su perfil académico. La 'mística' como principio vs el 'dinero' como instrumento." },
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

  // Recalcular scores con mediana decimal
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

  console.log("\nRonda 5 completada.\n");
}

main().catch(console.error);
