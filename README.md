# Calculadora de calificación

Calculadora anónima para que los alumnos de la FCA de **Aplicar Administración Financiera** y **Manejar Finanzas Internacionales** estimen cuánto llevan. Es un sitio estático (HTML + JavaScript): todo se calcula en el navegador del alumno y no se guarda ni se envía nada.

## Ponderación

| Rubro | Peso |
|---|---|
| Asistencia | 10% |
| Parciales | 50% |
| Tareas | 20% |
| Proyecto en equipo | 10% |
| Trabajo en equipo | 5% |
| Otros | 5% |

## Cómo calcula

- **Asistencia:** se compara contra el alumno que más asistencias tiene en el grupo (`maxAsistencias`). Quien tenga ese número obtiene el 10% completo; los demás, la proporción.
- **Calificación actual:** igual que los cortes del control de calificaciones, usa sólo los rubros que ya se evaluaron en el grupo y la reescala a 100.
- **Proyección final:** combina lo que ya se tiene con un escenario ("si en lo que falta saco X%"). También calcula el promedio que hace falta en lo restante para llegar a 80 (calificación mínima aprobatoria, `minimoAprobatorio` en `config.js`).
- **Tareas:** Completa = 1, Incompleta = 0.5, No entregada = 0.
- **Trabajo en equipo:** cambia según la materia (`tipoEquipo` en `config.js`):
  - *Manejar Finanzas Internacionales* (`"exposiciones"`): una exposición por parcial; Presenté = 1, No presenté = 0, y se promedian.
  - *Aplicar Administración Financiera* (`"autoevaluacion"`): una sola calificación de 0 a 100 en el semestre, que se ponen los integrantes del equipo. En cada grupo se activa con `equipo: true`.

## Actualizar durante el semestre

Sólo se edita **`config.js`**. Por cada grupo:

- `maxAsistencias`: asistencias del alumno que más ha venido.
- `examenes`, `tareas`, `equipo` (en MFI): lo que ya se aplicó en ese grupo (cada grupo puede llevar tareas distintas). Cada elemento puede llevar una descripción para que el alumno sepa a cuál se refiere:

  ```js
  tareas: [
    { nombre: "Tarea 1", descripcion: "Razones financieras de Bimbo" },
    { nombre: "Tarea 2", descripcion: "Flujo de efectivo proyectado" },
  ],
  ```
- `proyecto`, `otros` y `equipo` (en AAF): cambiar a `true` cuando ya haya calificación.
- `planeado`: cuántos parciales, tareas y exposiciones habrá en todo el semestre (para la proyección).
- `actualizado`: fecha que se muestra al pie de la página.

## Publicar con GitHub Pages

Settings → Pages → *Deploy from a branch* → `main` / `(root)`. La calculadora queda en `https://ivandeluna.github.io/calculadora_calificacion/`.

## Privacidad

El repositorio es público: **no subas el Excel de calificaciones ni ningún archivo con nombres de alumnos.** El `.gitignore` ya bloquea `.xlsx`, `.xls` y `.csv`.
