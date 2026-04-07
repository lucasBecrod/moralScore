# Validación de mercado: User Research no solicitado (WhatsApp)

> Fecha: 7 de abril 2026 (6 días antes de primera vuelta)
> Fuente: Conversación orgánica en grupo de WhatsApp de profesionales tech peruanos (~200 miembros)
> Contexto: Un miembro preguntó "¿saben por quién votar?" y detonó un debate espontáneo de 40 minutos

## Hallazgos clave

### 1. El JTBD no son las propuestas, es el historial

> "No solo habría que analizar las propuestas, sino también la trayectoria del candidato y evaluar qué tan probable es que realmente cumpla lo que promete."

**Validación**: El núcleo de MoralScore (evaluar discurso en vivo, no PDFs de planes de gobierno) está alineado con lo que la gente realmente busca. Los planes los escriben asesores; el Estadio de Kohlberg se revela bajo presión.

### 2. La sospecha del "lobby algorítmico"

> "Recordemos que ahora GPT trabaja bajo publicidad... si vas a tomar una decisión sobre eso, estás decidiendo por quien posiblemente ya invirtió en publicidad."
>
> "Usa Ollama con algún modelo lite y tu RAG, y te salvas del lobby."

**Validación**: La desconfianza en modelos cerrados (ChatGPT, Gemini) para temas políticos es real y creciente. La página de Metodología, los prompts en código abierto, y la narrativa "Cero Lobby" son el mayor foso defensivo de MoralScore. No vendemos "IA avanzada", vendemos "IA Auditable".

### 3. La trampa de los planes de gobierno

> "Podrían pasarle los planes de gobierno de cada partido a NotebookLM y de esta manera tener respuestas precisas con bajas alucinaciones."

**Señal**: Si MoralScore evalúa planes de gobierno, pierde su diferenciador. Los planes los escribe un consultor, no el político. La decisión de usar videos, debates y entrevistas (discurso en vivo) es la correcta — ahí es donde se rompe el guion.

### 4. Toxicidad política y moderación forzada

> "Sugiero que si empezarán con temas de lobby y por quién votar, este no es el grupo."

La conversación escaló de broma → reproches morales → moderación forzada en menos de 10 minutos. Esto valida:
- **Eliminar comentarios** de la v1 (un foro abierto sobre política se sale de control)
- **Tercerizar el juicio**: Al enviar un link de MoralScore, el usuario no está peleando, está diciendo "yo no lo digo, lo dice una auditoría matemática basada en N fuentes"

### 5. El cinismo y el voto de broma vs. la indignación

> "Si falla, al menos las risas no faltarán :v"
>
> vs.
>
> "No es por ser aguafiestas pero por gente así que toma todo a la broma el país está como está. Infórmense bien, representamos más del 20% de la población."

**Señal**: El choque tribal entre el ciudadano apático y el ciudadano indignado es el motor del Growth Loop. La tarjeta OG es el arma que el ciudadano indignado usará para responder con un número frío al que dice "votaré por las risas".

### 6. La ventana de 72 horas

> "Con tanto trabajo ni cuenta que las elecciones son este domingo."

**Patrón confirmado**: La mayoría busca información útil a 48-72 horas de la votación. La ventana de viralidad es extremadamente corta y explosiva. El producto debe ser inmediato (score visible en <10 segundos).

## Las 3 Leyes Inmutables de MoralScore

Derivadas de esta validación:

### Ley 1: El Historial Vivo
No leemos PDFs de 100 páginas escritos por consultores. Auditamos el discurso en vivo. El político no puede esconder su Estadio de Kohlberg cuando está bajo presión.

### Ley 2: El "Weaponized Share"
No albergamos debates en nuestra plataforma (cero comentarios). Le damos al ciudadano la tarjeta dinámica (OG Image) para que vaya a ganar el debate a su grupo de WhatsApp.

### Ley 3: El Oráculo Ciego
Jamás usaremos "Inteligencia Artificial" como argumento de venta. La narrativa es "Matemática Insobornable" y "Cero Lobby". La IA es solo la calculadora; los humanos auditan la fórmula (prompts públicos) y aportan los datos (fuentes).

## Copy estratégico validado

> "No leemos planes de gobierno ni promesas vacías. Auditamos la trayectoria y el discurso en vivo de los políticos para detectar demagogia y clientelismo. Algoritmos ciegos. Código abierto. Cero lobby."

## Implicaciones para el producto

| Decisión | Validada por | Estado |
|----------|-------------|--------|
| Evaluar discurso en vivo, no planes de gobierno | Hallazgo 1 y 3 | Confirmada |
| Prompts y metodología en código abierto | Hallazgo 2 | Confirmada |
| Sin comentarios ni foro en v1 | Hallazgo 4 | Confirmada |
| OG Image + botón WhatsApp como motor de crecimiento | Hallazgo 5 | En desarrollo (misión metrics-engagement) |
| UI que muestra score en <10 segundos | Hallazgo 6 | Implementada |
| Likes condicionados a consumir evidencia | Hallazgo 4 (fricción deliberada) | En desarrollo |

## Competencia real

La competencia directa de MoralScore no es la web del JNE ni los medios tradicionales. Es la **desinformación, la apatía y el boca a boca en grupos de WhatsApp** (Dark Social).
