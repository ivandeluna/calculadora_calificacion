/*
 * Lógica de cálculo (sin DOM), para poder probarla por separado.
 * Todos los valores de rubro van de 0 a 1.
 */
(function (root) {
  const RUBROS = [
    { key: "asistencia", label: "Asistencia" },
    { key: "parciales", label: "Parciales" },
    { key: "tareas", label: "Tareas" },
    { key: "proyecto", label: "Proyecto" },
    { key: "equipo", label: "Trabajo en equipo" },
    { key: "otros", label: "Otros" },
  ];

  const isNum = (v) => typeof v === "number" && isFinite(v);
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const known = (arr) => arr.filter(isNum);

  /**
   * grupo: entrada de CALC_CONFIG.materias[x].grupos[y]
   * datos: {
   *   asistencias: number|null,
   *   examenes: [0..100|null], tareas: [0|0.5|1|null], equipo: [0..100|null],
   *   proyecto: 0..100|null, otros: 0..100|null
   * }
   */
  function calcular(grupo, datos, pesos) {
    const rub = {};

    // Asistencia: proporción contra el que más vino
    rub.asistencia = {
      evaluado: true,
      valor: isNum(datos.asistencias) && grupo.maxAsistencias > 0
        ? clamp01(datos.asistencias / grupo.maxAsistencias) : null,
    };

    const ex = (datos.examenes || []).map((v) => (isNum(v) ? clamp01(v / 100) : null));
    const ta = (datos.tareas || []).map((v) => (isNum(v) ? clamp01(v) : null));
    const eq = (datos.equipo || []).map((v) => (isNum(v) ? clamp01(v / 100) : null));

    const avg = (a) => { const k = known(a); return k.length ? k.reduce((s, x) => s + x, 0) / k.length : null; };

    rub.parciales = { evaluado: grupo.examenes.length > 0, valor: avg(ex), items: ex };
    rub.tareas = { evaluado: grupo.tareas.length > 0, valor: avg(ta), items: ta };
    rub.equipo = { evaluado: grupo.equipo.length > 0, valor: avg(eq), items: eq };
    rub.proyecto = { evaluado: !!grupo.proyecto, valor: grupo.proyecto && isNum(datos.proyecto) ? clamp01(datos.proyecto / 100) : null };
    rub.otros = { evaluado: !!grupo.otros, valor: grupo.otros && isNum(datos.otros) ? clamp01(datos.otros / 100) : null };

    // --- Calificación actual: sólo rubros con evidencia, normalizada a 100
    let num = 0, den = 0;
    for (const r of RUBROS) {
      const x = rub[r.key];
      if (x.evaluado && x.valor !== null) { num += pesos[r.key] * x.valor; den += pesos[r.key]; }
    }
    const actual = den > 0 ? (num / den) * 100 : null;

    // --- Proyección final: Final(s) = A + B·s, con s = desempeño en lo que falta (0..1)
    // Elementos sin capturar se tratan como "por venir".
    const plan = grupo.planeado || {};
    let A = 0, B = 0;
    const proyectaLista = (items, planeados, peso) => {
      const n = Math.max(planeados || 0, items.length, 1);
      const k = known(items);
      const suma = k.reduce((s, x) => s + x, 0);
      const pendientes = n - k.length;
      A += peso * (suma / n);
      B += peso * (pendientes / n);
    };
    // Asistencia: se supone que mantienes tu porcentaje actual (si no capturaste, cuenta como "por venir")
    if (rub.asistencia.valor !== null) A += pesos.asistencia * rub.asistencia.valor;
    else B += pesos.asistencia;
    proyectaLista(ex, plan.examenes, pesos.parciales);
    proyectaLista(ta, plan.tareas, pesos.tareas);
    proyectaLista(eq, plan.equipo, pesos.equipo);
    for (const key of ["proyecto", "otros"]) {
      if (rub[key].valor !== null) A += pesos[key] * rub[key].valor;
      else B += pesos[key];
    }

    return { rubros: rub, actual, evaluadoPeso: den, proy: { A, B } };
  }

  /** s (0..1) que se necesita para llegar a `meta` puntos. */
  function necesario(proy, meta) {
    if (proy.A >= meta) return { tipo: "asegurado" };
    if (proy.B <= 0) return { tipo: "imposible" };
    const s = (meta - proy.A) / proy.B;
    if (s > 1) return { tipo: "imposible", s };
    return { tipo: "ok", s };
  }

  const api = { RUBROS, calcular, necesario };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Calc = api;
})(typeof window !== "undefined" ? window : globalThis);
