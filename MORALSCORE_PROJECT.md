# MoralScore — Documento Maestro del Proyecto

## Identidad

- **Nombre:** MoralScore
- **Tagline:** "Razonamiento moral verificable. Democracia basada en evidencia."
- **Repo:** https://github.com/lucasBecrod/moralScore
- **Local:** C:\Users\lucas\proyectos\moralScore
- **Autores:** Lucas (Economista) + Lady (Psicóloga)
- **Inicio:** Abril 2026
- **Contexto:** Elecciones Generales del Perú 2026

---

## 1. Qué es MoralScore

Plataforma web pública que asigna un score de razonamiento moral (estadios 1-6 de Kohlberg) a candidatos políticos peruanos. Cada puntuación es verificable: el usuario clickea el score y accede a las fuentes originales (videos, entrevistas, noticias) con las citas exactas que lo sustentan.

### Flujo principal

```
Usuario pega URL (video YouTube, nota periodística, entrevista)
  → La app extrae/recibe el contenido
  → IA analiza usando rúbrica Kohlberg (system prompt calibrado)
  → Retorna: estadio + confianza + citas textuales del material
  → Frontend muestra score con evidencia clickeable a la fuente original
```

### Qué NO es MoralScore

- No evalúa posiciones ideológicas (izquierda/derecha)
- No mide simpatía ni carisma
- No asigna moralidad interna, solo razonamiento público observable
- No es un detector de mentiras

---

## 2. Marco Teórico: Kohlberg Operacionalizado

### Los 6 estadios aplicados al discurso político

| Estadio | Nivel | Nombre | Indicador en discurso político | Ejemplo |
|---------|-------|--------|-------------------------------|---------|
| 1 | Pre-convencional | Castigo y obediencia | Justifica solo por miedo a consecuencias, no diferencia legalidad de moralidad | "Hay que meter presos a todos, mano dura y punto" |
| 2 | Pre-convencional | Intercambio instrumental | Ve relaciones como transacciones, clientelismo | "Si me apoyas, te doy obras para tu distrito" |
| 3 | Convencional | Expectativas interpersonales | Busca aprobación, apela a emociones y lealtades | "Es lo que el pueblo pide, yo escucho a la gente" |
| 4 | Convencional | Ley y orden social | Apela a leyes, instituciones, procedimientos | "Debemos respetar la Constitución y fortalecer las instituciones" |
| 5 | Post-convencional | Contrato social | Reconoce que leyes pueden ser injustas, apela a derechos universales | "Los derechos fundamentales están por encima de cualquier mayoría coyuntural" |
| 6 | Post-convencional | Principios éticos universales | Justicia y dignidad como fines en sí mismos, acepta costos por coherencia | "Esta política es justa porque protege la dignidad humana sin importar el costo político" |

### Regla de oro para codificar

Se evalúa la **justificación** que da el candidato, NO su posición. Dos candidatos pueden defender la misma política pero uno razona en estadio 2 (transaccional) y otro en estadio 5 (contrato social).

### Protocolo de evaluación

- **Unidad de análisis:** Una intervención = una respuesta argumentada ante un tema o dilema
- **Muestra mínima:** 5 intervenciones por candidato (ideal: 10)
- **Fuentes válidas:** Entrevistas en medios, debates, conferencias de prensa, declaraciones ante comisiones
- **Fuentes NO válidas:** Discursos preparados sin interacción, spots publicitarios, comunicados de prensa del equipo
- **Score final del candidato:** Mediana de los estadios asignados a sus intervenciones
- **Validación humana:** Doble codificación (Lady + Lucas), concordancia inter-evaluador kappa de Cohen ≥ 0.70

---

## 3. Arquitectura Técnica

### Stack recomendado (prototipo con Claude Code)

```
React + Tailwind (frontend)
API de Anthropic con web_search tool (análisis de contenido)
Sin backend dedicado por ahora — API key en .env local
Datos de candidatos en JSON local
Deploy: Vercel o GitHub Pages
```

### Estructura del proyecto

```
moralScore/
├── src/
│   ├── pages/
│   │   ├── index.tsx          # Landing: lista de candidatos + scores
│   │   ├── candidato/[id].tsx # Perfil con score detallado y fuentes
│   │   └── analizar.tsx       # Tool interno: pegar URL → score
│   ├── components/
│   │   ├── ScoreGauge.tsx     # Visualización circular del score 1-6
│   │   ├── SourceCard.tsx     # Tarjeta de fuente con cita y link
│   │   ├── KohlbergScale.tsx  # Barra visual de los 6 estadios
│   │   ├── CandidateCard.tsx  # Card de candidato con score resumen
│   │   └── Methodology.tsx    # Sección explicativa de la metodología
│   ├── lib/
│   │   ├── anthropic.ts       # Llamadas a la API de Anthropic
│   │   ├── scoring.ts         # Lógica de agregación de scores
│   │   └── types.ts           # TypeScript types
│   └── data/
│       ├── candidatos.json    # Candidatos con metadata
│       └── evaluaciones.json  # Resultados de análisis guardados
├── public/
│   └── img/                   # Fotos de candidatos
├── .env.local                 # ANTHROPIC_API_KEY
├── package.json
├── tailwind.config.js
└── README.md
```

### System Prompt para la IA evaluadora

```
Eres un evaluador experto en razonamiento moral basado en la teoría 
del desarrollo moral de Lawrence Kohlberg. Proyecto MoralScore.

TAREA: Analizar intervenciones de candidatos políticos peruanos y 
asignar un estadio de desarrollo moral (1-6).

INSTRUCCIONES ESTRICTAS:
1. Lee el material proporcionado (transcripción, artículo, entrevista)
2. Identifica las JUSTIFICACIONES morales del candidato — no sus posiciones
3. Busca indicadores específicos de cada estadio (ver rúbrica)
4. Asigna el estadio que mejor representa el razonamiento dominante
5. Cita TEXTUALMENTE las frases que sustentan tu evaluación
6. Si el material no contiene razonamiento moral suficiente, responde INSUFICIENTE

RÚBRICA DE ESTADIOS:

ESTADIO 1 — Castigo/Obediencia:
- Justifica por miedo a consecuencias
- "Hay que castigar", "mano dura" sin análisis
- No diferencia legalidad de moralidad

ESTADIO 2 — Intercambio instrumental:
- Relaciones como transacciones
- "Si me apoyas te doy...", clientelismo explícito
- Busca beneficio mutuo, no principios

ESTADIO 3 — Expectativas interpersonales:
- Busca aprobación: "el pueblo quiere", "la gente pide"
- Apela a emociones, lealtades, popularidad
- Populismo emocional sin sustento técnico

ESTADIO 4 — Ley y orden:
- Apela a Constitución, leyes, instituciones
- "El marco legal establece...", "las instituciones deben..."
- Respeto al orden establecido como valor central

ESTADIO 5 — Contrato social:
- Reconoce que leyes pueden ser injustas
- Propone reformas por derechos previos al sistema
- Bienestar colectivo sobre legalidad formal

ESTADIO 6 — Principios universales:
- Justicia y dignidad humana como fines absolutos
- Acepta costos personales/políticos por coherencia ética
- Razonamiento abstracto aplicado a casos concretos

FORMATO DE RESPUESTA (JSON estricto):
{
  "estadio": 4,
  "confianza": "alta",
  "justificacion": "El candidato fundamenta su posición apelando 
    consistentemente al marco constitucional y al rol de las 
    instituciones...",
  "citas": [
    {
      "texto": "Frase textual del candidato",
      "ubicacion": "Minuto 3:42 / Párrafo 5 / etc.",
      "indicador": "Qué indicador de Kohlberg refleja esta frase"
    }
  ],
  "estadio_alternativo": null,
  "notas": "Observaciones relevantes"
}

REGLAS ANTI-SESGO:
- No penalizar ni premiar posiciones ideológicas (izquierda/derecha)
- Evaluar SOLO la estructura del razonamiento, no el contenido político
- Si hay ambigüedad entre dos estadios, reportar ambos y explicar
- No inferir intenciones no declaradas
```

### Colores del scoring (para UI)

```
Estadio 1: #DC2626 (rojo)
Estadio 2: #EA580C (naranja oscuro)
Estadio 3: #D97706 (ámbar)
Estadio 4: #2563EB (azul)
Estadio 5: #7C3AED (violeta)
Estadio 6: #059669 (verde esmeralda)
```

---

## 4. Datos iniciales de candidatos

### Candidatos para el prototipo (Elecciones 2026)

```json
[
  {
    "id": "keiko-fujimori",
    "nombre": "Keiko Fujimori",
    "partido": "Fuerza Popular",
    "intencion_voto": "8.0% - 10.0%",
    "plan_gobierno": "Perú con Orden 2026-2031",
    "urls_analisis": []
  },
  {
    "id": "rafael-lopez-aliaga",
    "nombre": "Rafael López Aliaga",
    "partido": "Renovación Popular",
    "intencion_voto": "8.7% - 12.0%",
    "plan_gobierno": "Plan de Gobierno 100 días",
    "urls_analisis": []
  },
  {
    "id": "carlos-alvarez",
    "nombre": "Carlos Álvarez",
    "partido": "País para Todos",
    "intencion_voto": "4.0%",
    "plan_gobierno": "Ruta de Acción 2026-2031",
    "urls_analisis": []
  },
  {
    "id": "jorge-nieto",
    "nombre": "Jorge Nieto Montesinos",
    "partido": "Partido del Buen Gobierno",
    "intencion_voto": "2.0%",
    "plan_gobierno": "Recuperación institucional",
    "urls_analisis": []
  }
]
```

---

## 5. Roadmap

### Fase 0 — Fundacional (esta semana)
- [x] Nombre, concepto, repo en GitHub
- [x] Marco teórico (Kohlberg operacionalizado)
- [x] Documento maestro del proyecto
- [ ] Prototipo funcional con Claude Code
- [ ] Probar con 2-3 URLs de candidatos reales
- [ ] Primer score publicado

### Fase 1 — Calibración (semana 2)
- [ ] Lady y Lucas codifican manualmente 10 intervenciones
- [ ] Calcular kappa de Cohen (concordancia inter-evaluador)
- [ ] Ajustar rúbrica y system prompt según discrepancias
- [ ] Comparar scoring humano vs scoring IA
- [ ] Documentar decisiones de calibración

### Fase 2 — Plataforma pública (semana 3-4)
- [ ] Landing page con scores de candidatos principales
- [ ] Página de metodología transparente
- [ ] Cada score con drill-down a fuentes verificables
- [ ] Compartible en redes sociales
- [ ] Deploy en Vercel

### Fase 3 — Expansión (post-electoral)
- [ ] Abrir a cualquier figura pública
- [ ] Sistema de contribución ciudadana (proponer URLs para análisis)
- [ ] Histórico de scores
- [ ] API pública

---

## 6. Consideraciones Éticas

1. **Transparencia total:** Metodología, rúbrica y system prompt son públicos en el repo
2. **Sin sesgo partidario:** Se evalúa estructura de razonamiento, no posición política
3. **Verificabilidad:** Todo score tiene fuentes que el usuario puede auditar
4. **Limitaciones declaradas:** Medimos razonamiento público observable, no moralidad interna
5. **Derecho de réplica:** Los evaluados pueden enviar material adicional
6. **Revisión humana:** Ningún score se publica sin validación de Lady o Lucas

---

## 7. Instrucciones para Claude Code

Al abrir el proyecto en Claude Code, usa este prompt inicial:

```
Lee el archivo MORALSCORE_PROJECT.md completo. Es el documento 
maestro del proyecto MoralScore. Construye el prototipo siguiendo 
la arquitectura, stack y estructura definidos ahí. Empieza por:

1. Inicializar el proyecto React + Tailwind
2. Crear la estructura de carpetas
3. Implementar la landing page con lista de candidatos
4. Implementar la página de análisis (input de URL → score)
5. Conectar con la API de Anthropic usando el system prompt del documento
6. Implementar la visualización del score con fuentes verificables

La API key de Anthropic va en .env.local como ANTHROPIC_API_KEY.
El diseño debe ser sobrio, académico y profesional — no genérico.
Colores del scoring están definidos en el documento.
```
