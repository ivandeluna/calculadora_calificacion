/*
 * CONFIGURACIÓN DE LA CALCULADORA
 * ------------------------------------------------------------------
 * Este es el ÚNICO archivo que hay que editar durante el semestre.
 * No contiene datos de alumnos: sólo lo que se ha evaluado en cada grupo.
 *
 * Por cada grupo:
 *   maxAsistencias  -> asistencias del alumno que MÁS vino en el periodo.
 *                      Quien tenga ese número obtiene el 10% completo; los
 *                      demás, la proporción (asistencias / maxAsistencias).
 *   examenes        -> parciales YA aplicados en ese grupo.
 *   tareas          -> tareas YA dejadas en ese grupo (pueden diferir entre grupos).
 *   equipo          -> actividades de trabajo en equipo YA evaluadas (autoevaluación).
 *   proyecto        -> true cuando ya haya calificación de proyecto.
 *   otros           -> true cuando ya haya calificación de "otros".
 *   planeado        -> cuántos parciales / tareas / actividades de equipo habrá
 *                      en TODO el semestre (sirve para proyectar la calificación final).
 */
window.CALC_CONFIG = {
  actualizado: "6 de octubre de 2026",
  minimoAprobatorio: 70,

  // Pesos (deben sumar 100). Iguales en ambas materias.
  ponderacion: {
    asistencia: 10,
    parciales: 50,
    tareas: 20,
    proyecto: 10,
    equipo: 5,
    otros: 5,
  },

  materias: {
    AAF: {
      nombre: "Aplicar Administración Financiera",
      grupos: {
        "8A": {
          maxAsistencias: 12,
          examenes: ["Parcial 1"],
          tareas: ["Tarea 1"],
          equipo: [],
          proyecto: false,
          otros: false,
          planeado: { examenes: 3, tareas: 3, equipo: 3 },
        },
        "8D": {
          maxAsistencias: 6,
          examenes: ["Parcial 1"],
          tareas: ["Tarea 1"],
          equipo: [],
          proyecto: false,
          otros: false,
          planeado: { examenes: 3, tareas: 3, equipo: 3 },
        },
      },
    },
    MFI: {
      nombre: "Manejar Finanzas Internacionales",
      grupos: {
        "7Q": {
          maxAsistencias: 18,
          examenes: ["Parcial 1"],
          tareas: ["Tarea 1"],
          equipo: ["Equipo 1"],
          proyecto: false,
          otros: false,
          planeado: { examenes: 3, tareas: 3, equipo: 3 },
        },
        "7S": {
          maxAsistencias: 7,
          examenes: ["Parcial 1"],
          tareas: ["Tarea 1"],
          equipo: ["Equipo 1"],
          proyecto: false,
          otros: false,
          planeado: { examenes: 3, tareas: 3, equipo: 3 },
        },
      },
    },
  },
};
