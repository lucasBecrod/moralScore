# El Algoritmo de Musk — Contención de Complejidad Generativa

> Referencia para planificacion y ejecucion de misiones.
> Origen: doc 52.05 (Fusión Jobs-Musk AI-First Fintech)

## El Problema: La Liebre Dopada

La IA genera código más rápido de lo que un humano puede auditarlo.
La **Hipótesis de Ammann** dice: la complejidad para *predecir* un sistema
es exponencialmente mayor que para *generarlo*. Sin contención, cada feature
nueva añade deuda técnica invisible.

## Los 5 Pasos del Algoritmo

Secuencia estricta. Nunca saltar pasos. Nunca invertir el orden.

### Paso 1: Cuestionar cada requisito

**Todo requisito debe tener nombre y apellido.**

- Si viene de "buenas prácticas", o "es lo estándar"
  → es un requisito anónimo. Cuestionarlo hasta que alguien lo defienda.
- Si Claude propone importar una librería, crear un schema nuevo, o añadir
  un estado intermedio → preguntar: "¿quién dijo que esto es necesario?"
- Si la respuesta es "por si acaso" → eliminarlo.

**En el SMEAC**: Antes de redactar la misión, validar que cada requisito
del feature tenga origen trazable (JTBD, ADR, o decisión explícita de Lucas).

### Paso 2: Eliminar partes (La Métrica Destructiva del 10%)

**"Si no te ves obligado a volver a agregar al menos el 10% de lo que
eliminaste, no estás eliminando lo suficiente."**

Aplicar a:
- **Código**: abstracciones de 1 uso, estados intermedios, validaciones
  redundantes, código defensivo para escenarios imposibles
- **UX**: pantallas, campos, pasos del flujo, opciones de navegación
- **Arquitectura**: colecciones Firestore, API routes, schemas

**En el SMEAC**: Toda misión incluye sección PURGADO. El agente debe
identificar y eliminar al menos 1 elemento existente relacionado al feature
para compensar la nueva complejidad.

### Paso 3: Simplificar y optimizar

**Solo DESPUÉS de eliminar.** Nunca optimizar una "cosa estúpida".

- El error más común: invertir semanas optimizando queries complejas
  cuando la mitad de esas queries no se necesitan.
- Primero borrar, luego simplificar lo que sobrevivió.

**En el SMEAC**: Si el agente propone optimizar algo, verificar que
el Paso 2 ya se aplicó a ese componente.

### Paso 4: Acelerar el tiempo de ciclo

**Maximizar lo que ya existe antes de escalar.**

- Exprimir la infraestructura actual antes de añadir más
- Resolver cuellos de botella humanos antes de automatizar
- No crear nuevas API routes si una existente puede absorber el caso

**En el SMEAC**: Preferir extender funciones existentes sobre crear nuevas.

### Paso 5: Automatizar (SIEMPRE el último)

**La automatización es máximo el 20% final del esfuerzo, nunca el 80% inicial.**

Lección del Model 3 de Tesla: automatizar un proceso no purgado solo
escala los errores. Si el flujo manual no está pulido y minimizado,
automatizarlo será un multiplicador de caos.

**En el SMEAC**: Si la misión incluye automatización, verificar que
los Pasos 1-4 ya se aplicaron al flujo.

## Bloque PURGADO para misiones

Toda misión incluye este bloque después de la implementación:

```
## PURGADO — Algoritmo de Musk, Paso 2

Antes de validar, aplica el Paso 2 (Eliminar):
1. Revisa lo que escribiste. Identifica:
   - Abstracciones que solo se usan 1 vez
   - Estados intermedios que pueden eliminarse
   - Validaciones redundantes con lo que ya existe
   - Código defensivo para escenarios imposibles
2. Elimina al menos 1 elemento concreto
3. Si algún archivo supera 200 LOC (150 .tsx), divídelo ahora
4. Verifica que sigue funcionando después de podar

> Métrica del 10%: si no tuviste que re-agregar nada, no fuiste agresivo.
```

## Antipatrones a Detectar

| Antipatrón | Paso que viola | Señal |
|-----------|---------------|-------|
| "Por si acaso" | Paso 1 | Código defensivo sin escenario real |
| "Es lo estándar" | Paso 1 | Requisito sin autor trazable |
| Optimizar antes de podar | Paso 3 | Refactorizar sin haber eliminado primero |
| Crear ruta nueva pudiendo extender | Paso 4 | Nueva API route para caso absorbible |
| Automatizar flujo manual no pulido | Paso 5 | Automatización sobre proceso con pasos innecesarios |
| Archivo >200 LOC sin dividir | Paso 2 | Complejidad generativa sin contención |
