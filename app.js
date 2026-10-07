(function () {
  const C = window.CALC_CONFIG;
  const $ = (id) => document.getElementById(id);
  const fmt = (v, d = 1) => (v === null || v === undefined ? "—" : v.toFixed(d));

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } },
  };

  const selMateria = $("materia");
  const selGrupo = $("grupo");

  // ---------- selects de materia / grupo
  for (const [key, m] of Object.entries(C.materias)) {
    selMateria.add(new Option(m.nombre, key));
  }
  const savedM = store.get("cc_materia");
  if (savedM && C.materias[savedM]) selMateria.value = savedM;

  function llenarGrupos() {
    selGrupo.innerHTML = "";
    for (const g of Object.keys(C.materias[selMateria.value].grupos)) selGrupo.add(new Option(g, g));
    const savedG = store.get("cc_grupo");
    if (savedG && C.materias[selMateria.value].grupos[savedG]) selGrupo.value = savedG;
  }

  const grupoActual = () => C.materias[selMateria.value].grupos[selGrupo.value];

  // ---------- construcción del formulario
  function numInput(id, label, max, hint, step = "any") {
    return `<label class="field"><span>${label}</span>
      <input type="number" inputmode="decimal" id="${id}" min="0" max="${max}" step="${step}" placeholder="0–${max}">
      ${hint ? `<small>${hint}</small>` : ""}</label>`;
  }
  function tareaInput(id, label) {
    return `<label class="field"><span>${label}</span>
      <select id="${id}">
        <option value="">— elige —</option>
        <option value="1">Completa</option>
        <option value="0.5">Incompleta</option>
        <option value="0">No entregada</option>
      </select></label>`;
  }

  function construir() {
    const g = grupoActual();
    const html = [];

    html.push(`<fieldset><legend>Asistencia <em>10%</em></legend>
      ${numInput("asis", "¿Cuántas asistencias llevas?", g.maxAsistencias, `El que más ha venido en tu grupo lleva <strong>${g.maxAsistencias}</strong>; esa cifra vale el 10% completo.`, "1")}
      </fieldset>`);

    if (g.examenes.length) {
      html.push(`<fieldset><legend>Parciales <em>50%</em></legend><div class="grid">
        ${g.examenes.map((n, i) => numInput(`ex${i}`, n, 100, "", "any")).join("")}
        </div></fieldset>`);
    }
    if (g.tareas.length) {
      html.push(`<fieldset><legend>Tareas <em>20%</em></legend><div class="grid">
        ${g.tareas.map((n, i) => tareaInput(`ta${i}`, n)).join("")}
        </div></fieldset>`);
    }
    if (g.equipo.length) {
      html.push(`<fieldset><legend>Trabajo en equipo <em>5%</em></legend>
        <p class="note">Es la calificación que tu equipo te asignó (autoevaluación). Si presentaste y no hubo ajuste, pon 100.</p><div class="grid">
        ${g.equipo.map((n, i) => numInput(`eq${i}`, n, 100, "", "any")).join("")}
        </div></fieldset>`);
    }
    if (g.proyecto) {
      html.push(`<fieldset><legend>Proyecto en equipo <em>10%</em></legend>
        ${numInput("proy", "Calificación del proyecto", 100, "")}</fieldset>`);
    }
    if (g.otros) {
      html.push(`<fieldset><legend>Otros <em>5%</em></legend>
        ${numInput("otros", "Calificación en otros (colaboración, honestidad…)", 100, "")}</fieldset>`);
    }

    const pend = [];
    if (!g.equipo.length) pend.push("trabajo en equipo");
    if (!g.proyecto) pend.push("proyecto");
    if (!g.otros) pend.push("otros");
    if (pend.length) {
      html.push(`<p class="note muted">Aún no se evalúa en tu grupo: ${pend.join(", ")}. No cuentan en tu calificación actual, pero sí en la proyección.</p>`);
    }

    $("inputs").innerHTML = html.join("");
    $("meta").textContent = `Evaluado en ${selGrupo.value}: ${g.examenes.length} parcial(es), ${g.tareas.length} tarea(s)${g.equipo.length ? `, ${g.equipo.length} actividad(es) de equipo` : ""}.`;
    $("inputs").querySelectorAll("input, select").forEach((el) => el.addEventListener("input", calcular));
    calcular();
  }

  // ---------- lectura y cálculo
  const val = (id) => {
    const el = $(id);
    if (!el || el.value === "") return null;
    const n = parseFloat(el.value);
    return isFinite(n) ? n : null;
  };

  function calcular() {
    const g = grupoActual();
    const datos = {
      asistencias: val("asis"),
      examenes: g.examenes.map((_, i) => val(`ex${i}`)),
      tareas: g.tareas.map((_, i) => val(`ta${i}`)),
      equipo: g.equipo.map((_, i) => val(`eq${i}`)),
      proyecto: val("proy"),
      otros: val("otros"),
    };
    const r = Calc.calcular(g, datos, C.ponderacion);

    // Actual
    $("actual").textContent = fmt(r.actual);
    const st = $("estatus");
    if (r.actual === null) { st.textContent = "Captura tus datos para ver el resultado."; st.className = "status"; }
    else if (r.actual >= C.minimoAprobatorio) { st.textContent = "Vas aprobando"; st.className = "status ok"; }
    else { st.textContent = "Vas por debajo de " + C.minimoAprobatorio; st.className = "status bad"; }

    // Desglose
    $("desglose").innerHTML = Calc.RUBROS.map((rb) => {
      const x = r.rubros[rb.key];
      const txt = !x.evaluado ? '<span class="muted">sin evaluar</span>'
        : x.valor === null ? '<span class="muted">sin capturar</span>' : fmt(x.valor * 100, 0) + "%";
      return `<tr><td>${rb.label}</td><td>${C.ponderacion[rb.key]}%</td><td>${txt}</td></tr>`;
    }).join("");

    // Faltantes
    const falt = [];
    if (datos.asistencias === null) falt.push("asistencias");
    g.examenes.forEach((n, i) => { if (datos.examenes[i] === null) falt.push(n); });
    g.tareas.forEach((n, i) => { if (datos.tareas[i] === null) falt.push(n); });
    g.equipo.forEach((n, i) => { if (datos.equipo[i] === null) falt.push(n); });
    if (g.proyecto && datos.proyecto === null) falt.push("proyecto");
    if (g.otros && datos.otros === null) falt.push("otros");
    const fEl = $("faltan");
    if (falt.length && r.actual !== null) {
      fEl.hidden = false;
      fEl.innerHTML = `Te falta capturar: <strong>${falt.join(", ")}</strong>. Mientras estén vacíos no cuentan, así que el resultado puede verse más alto o más bajo de lo real. Si no entregaste algo, ponlo en 0.`;
    } else fEl.hidden = true;

    // Proyección
    const s = parseInt($("escenario").value, 10) / 100;
    $("s-val").textContent = Math.round(s * 100);
    const final = r.proy.A + r.proy.B * s;
    $("final").textContent = fmt(final);
    $("final").className = "num-sm " + (final >= C.minimoAprobatorio ? "ok" : "bad");

    const nec = Calc.necesario(r.proy, C.minimoAprobatorio);
    const nEl = $("necesitas");
    if (nec.tipo === "asegurado") { nEl.textContent = "Ya lo tienes"; nEl.className = "num-sm ok"; }
    else if (nec.tipo === "imposible") { nEl.textContent = "Más de 100%"; nEl.className = "num-sm bad"; }
    else { nEl.textContent = fmt(nec.s * 100, 0) + "%"; nEl.className = "num-sm"; }

    const p = g.planeado || {};
    $("proy-hint").textContent = `Supone ${p.examenes || 3} parciales y ${p.tareas || 3} tareas en el semestre, que mantienes tu porcentaje de asistencia, y que lo que falta (incluido proyecto y otros) lo sacas al porcentaje que elijas abajo.`;
  }

  // ---------- eventos
  selMateria.addEventListener("change", () => { store.set("cc_materia", selMateria.value); llenarGrupos(); store.set("cc_grupo", selGrupo.value); construir(); });
  selGrupo.addEventListener("change", () => { store.set("cc_grupo", selGrupo.value); construir(); });
  $("escenario").addEventListener("input", calcular);
  $("min-lbl").textContent = C.minimoAprobatorio;
  $("upd").textContent = `Configuración actualizada al ${C.actualizado}.`;

  llenarGrupos();
  construir();
})();
