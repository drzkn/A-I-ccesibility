# Update Docs

Genera las pautas para actualizar la documentación del proyecto con los cambios de la rama actual.

---

## Instrucciones

Analiza los cambios de la rama actual respecto a `master` y genera un plan detallado para actualizar la documentación del proyecto AccessibilityHub.

### Paso 1 — Obtener los cambios de la rama

Ejecuta los siguientes comandos git para recopilar información:

1. `git diff master...HEAD --name-status` — archivos añadidos, modificados o eliminados.
2. `git diff master...HEAD --stat` — resumen estadístico de los cambios.
3. `git log master..HEAD --oneline` — lista de commits en la rama.

Con esta información, clasifica los cambios en las siguientes categorías:

| Categoría | Ruta afectada | Impacto en docs |
|-----------|---------------|-----------------|
| Nueva tool | `src/tools/<ToolName>/` | Alto |
| Tool modificada | `src/tools/<ToolName>/` | Medio |
| Nuevo prompt | `src/prompts/<category>/` | Alto |
| Prompt modificado | `src/prompts/<category>/` | Medio |
| Nuevo recurso | `src/resources/<name>/` | Alto |
| Recurso modificado | `src/resources/<name>/` | Medio |
| Utilidades compartidas | `src/shared/` | Bajo |
| Tests | `tests/` | Bajo |
| Configuración | raíz del proyecto | Bajo |
| Documentación existente | `docs/` | Revisar coherencia |

### Paso 2 — Determinar qué documentación actualizar

Según los cambios detectados, determina qué archivos de documentación necesitan ser creados o actualizados siguiendo estas reglas:

#### Nueva tool

- **Crear** `docs/tools/<tool-name>.md` con: descripción, parámetros de entrada, formato de salida, ejemplos de uso y criterios WCAG relacionados. Usa como referencia `docs/tools/analyze-with-axe.md`.
- **Actualizar** `docs/tools/README.md` — añadir entrada en la tabla de herramientas.
- **Actualizar** `README.md` — añadir fila en la tabla "Available Tools".

#### Tool modificada

- **Actualizar** `docs/tools/<tool-name>.md` — reflejar cambios en parámetros, comportamiento o salida.
- **Revisar** `docs/guides/workflows.md` y `docs/guides/effective-prompts.md` por si los cambios afectan a flujos o recomendaciones.

#### Nuevo prompt

- **Crear** `docs/prompts/<prompt-name>.md` con: descripción, argumentos, ejemplo de uso y salida esperada. Usa como referencia `docs/prompts/full-accessibility-audit.md`.
- **Actualizar** `docs/prompts/README.md` — añadir entrada en la tabla de prompts.
- **Actualizar** `README.md` — añadir fila en la tabla "Available Prompts".

#### Prompt modificado

- **Actualizar** `docs/prompts/<prompt-name>.md` — reflejar cambios en argumentos o comportamiento.

#### Nuevo recurso

- **Crear** `docs/resources/<resource-name>.md` con: descripción, URI, formato de datos y ejemplo. Usa como referencia `docs/resources/wcag-criteria.md`.
- **Actualizar** `docs/resources/README.md` — añadir entrada en la tabla de recursos.
- **Actualizar** `README.md` — añadir fila en la tabla "Available Resources".

#### Recurso modificado

- **Actualizar** `docs/resources/<resource-name>.md` — reflejar cambios en estructura de datos o URIs.

#### Cambios en shared/utils

- **Revisar** si los cambios afectan el comportamiento descrito en `docs/guides/interpreting-results.md`.
- **Revisar** si se añade funcionalidad visible al usuario que deba documentarse.

#### Cambios en configuración del proyecto

- **Actualizar** `CONTRIBUTING.md` si cambian scripts, dependencias o estructura del proyecto.
- **Actualizar** `docs/getting-started.md` si cambian requisitos de instalación o configuración del cliente MCP.

### Paso 3 — Generar el plan de actualización

Presenta el resultado como una lista de acciones concretas con el siguiente formato:

```
## Plan de actualización de documentación

### Rama: <nombre-de-la-rama>
### Commits: <número-de-commits>

---

### Archivos a CREAR

- [ ] `<ruta-del-archivo>` — <descripción breve de qué debe contener>

### Archivos a ACTUALIZAR

- [ ] `<ruta-del-archivo>` — <descripción de los cambios necesarios>

### Archivos a REVISAR (posible impacto)

- [ ] `<ruta-del-archivo>` — <motivo de la revisión>

---

### Notas adicionales

<Cualquier observación relevante sobre los cambios que pueda afectar la documentación>
```

### Paso 4 — Ejecutar el plan

Una vez presentado el plan, procede a ejecutar cada una de las acciones:

1. Crea los archivos nuevos de documentación siguiendo la estructura y estilo de los existentes en la misma carpeta.
2. Actualiza los archivos existentes incorporando las referencias a los nuevos elementos.
3. Revisa que los índices (`README.md` de cada subcarpeta de docs) estén completos y ordenados.
4. Verifica que el `README.md` raíz refleje todos los tools, prompts y resources disponibles.

### Referencia

- Documentación de tools: `docs/tools/`
- Documentación de prompts: `docs/prompts/`
- Documentación de recursos: `docs/resources/`
- Guías: `docs/guides/`
- Estructura del proyecto: `CONTRIBUTING.md`
