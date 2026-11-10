/* Controlador de reservas del cliente: crear, modificar, eliminar y listar */
document.addEventListener('DOMContentLoaded', () => {
  const usuario = AuthService.exigir([ROLES.CLIENTE]);
  if (!usuario) return;

  const el = id => document.getElementById(id);
  const f = el('formReserva');
  const nombreEspacio = id => (EspacioService.obtener(id) || { nombre: '(espacio eliminado)' }).nombre;

  /* ---- Cargar selects ---- */
  el('espacio').innerHTML = '<option value="">Selecciona...</option>' +
    EspacioService.listar().map(e =>
      `<option value="${e.id}">${V.esc(e.nombre)} · ${Formato.dinero(e.precioHora)}/h · hasta ${e.capacidad} pers.</option>`).join('');
  let optsHora = '<option value="">Selecciona...</option>';
  for (let h = ReservaService.HORA_MIN; h <= ReservaService.HORA_MAX_INICIO; h++) {
    optsHora += `<option value="${h}">${Formato.hora(h)}</option>`;
  }
  el('hora').innerHTML = optsHora;
  el('fecha').min = Formato.hoyISO();
  el('duracion').max = ReservaService.DURACION_MAX;

  const preseleccion = new URLSearchParams(location.search).get('espacio');
  if (preseleccion) el('espacio').value = preseleccion;

  const actualizarResumen = () => {
    el('resumen').textContent = Formato.dinero(
      ReservaService.calcularTotal(Number(el('espacio').value), Number(el('duracion').value)));
  };

  /* ---- Validaciones ---- */
  const chequeos = {
    espacio: () => V.campo(el('espacio'), V.m.obligatorio(el('espacio').value, 'un espacio')),
    fecha: () => {
      let msg = V.m.obligatorio(el('fecha').value, 'una fecha');
      if (!msg && el('fecha').value < Formato.hoyISO()) msg = 'La fecha no puede ser anterior a hoy';
      return V.campo(el('fecha'), msg);
    },
    hora: () => {
      let msg = V.m.obligatorio(el('hora').value, 'la hora de inicio');
      if (!msg && el('fecha').value === Formato.hoyISO() && Number(el('hora').value) <= new Date().getHours()) msg = 'Esa hora ya pasó';
      return V.campo(el('hora'), msg);
    },
    duracion: () => {
      const d = Number(el('duracion').value);
      const h = Number(el('hora').value);
      let msg = '';
      if (V.vacio(el('duracion').value) || !Number.isInteger(d)) msg = 'Ingresa un número entero de horas';
      else if (d < 1 || d > ReservaService.DURACION_MAX) msg = `La duración debe ser entre 1 y ${ReservaService.DURACION_MAX} horas`;
      else if (h && h + d > ReservaService.HORA_FIN_MAX) msg = `El evento debe terminar a las ${Formato.hora(ReservaService.HORA_FIN_MAX)} como máximo`;
      return V.campo(el('duracion'), msg);
    },
    personas: () => {
      const p = Number(el('personas').value);
      const esp = EspacioService.obtener(Number(el('espacio').value));
      let msg = '';
      if (V.vacio(el('personas').value) || !Number.isInteger(p) || p < 1) msg = 'Ingresa un número de personas válido';
      else if (esp && p > esp.capacidad) msg = `Este espacio admite hasta ${esp.capacidad} personas`;
      return V.campo(el('personas'), msg);
    },
    tipo: () => V.campo(el('tipo'), V.m.obligatorio(el('tipo').value, 'el tipo de evento'))
  };
  Object.keys(chequeos).forEach(k => el(k).addEventListener('change', () => { chequeos[k](); actualizarResumen(); }));
  ['duracion', 'personas'].forEach(k => el(k).addEventListener('input', () => { chequeos[k](); actualizarResumen(); }));

  /* ---- Modo edición ---- */
  function salirEdicion() {
    el('reservaId').value = '';
    el('tituloForm').textContent = 'Nueva reserva';
    el('btnGuardar').textContent = 'Reservar';
    el('btnCancelarEdicion').classList.add('d-none');
    f.reset();
  }

  function entrarEdicion(id) {
    const r = ReservaService.obtener(id);
    if (!r || r.usuarioId !== usuario.id || r.estado !== ESTADOS.PENDIENTE) return;
    el('reservaId').value = r.id;
    el('espacio').value = r.espacioId;
    el('fecha').value = r.fecha;
    el('hora').value = r.hora;
    el('duracion').value = r.duracion;
    el('personas').value = r.personas;
    el('tipo').value = r.tipo;
    el('notas').value = r.notas || '';
    el('tituloForm').textContent = 'Modificar reserva #' + r.id;
    el('btnGuardar').textContent = 'Guardar cambios';
    el('btnCancelarEdicion').classList.remove('d-none');
    V.limpiar(f);
    actualizarResumen();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---- Guardar ---- */
  f.addEventListener('submit', e => {
    e.preventDefault();
    const resultados = Object.values(chequeos).map(fn => fn());
    if (!resultados.every(Boolean)) { Aviso.mostrar('Revisa los campos marcados en rojo', 'danger'); return; }

    const editandoId = Number(el('reservaId').value) || null;
    const datos = {
      espacioId: Number(el('espacio').value),
      fecha: el('fecha').value,
      hora: Number(el('hora').value),
      duracion: Number(el('duracion').value),
      personas: Number(el('personas').value),
      tipo: el('tipo').value,
      notas: el('notas').value.trim()
    };

    if (ReservaService.hayChoque(datos.espacioId, datos.fecha, datos.hora, datos.duracion, editandoId)) {
      V.campo(el('hora'), 'Ese espacio ya está reservado en ese horario');
      Aviso.mostrar('El horario no está disponible. Prueba con otra hora o fecha', 'warning');
      return;
    }

    if (editandoId) {
      ReservaService.actualizar(editandoId, datos);
      Aviso.mostrar('Reserva modificada', 'success');
      salirEdicion();
      pintar();
    } else {
      const nueva = ReservaService.crear(usuario.id, datos);
      Rutas.ir('pago', '?id=' + nueva.id); // flujo: reservar -> pagar (simulado)
    }
  });

  f.addEventListener('reset', () => setTimeout(() => { V.limpiar(f); actualizarResumen(); }, 0));
  el('btnCancelarEdicion').addEventListener('click', salirEdicion);

  /* ---- Tabla ---- */
  function pintar() {
    const mias = ReservaService.listarPorUsuario(usuario.id);
    const tbody = el('tablaReservas');
    if (!mias.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-secondary py-4">Aún no tienes reservas</td></tr>';
      return;
    }
    tbody.innerHTML = mias.map(r => {
      const pendiente = r.estado === ESTADOS.PENDIENTE;
      return `<tr>
        <td>${V.esc(nombreEspacio(r.espacioId))}<br><small class="text-secondary">${V.esc(r.tipo)}</small></td>
        <td>${V.esc(r.fecha)}</td>
        <td>${Formato.hora(r.hora)} - ${Formato.hora(r.hora + r.duracion)}</td>
        <td>${Formato.dinero(r.total)}</td>
        <td><span class="badge badge-estado-${r.estado}">${r.estado}</span></td>
        <td class="text-nowrap">
          ${pendiente ? `<a class="btn btn-sm btn-secundario" href="${Rutas.url('pago', '?id=' + r.id)}">Pagar</a>
          <button class="btn btn-sm btn-outline-primary" data-accion="editar" data-id="${r.id}">Modificar</button>` : ''}
          <button class="btn btn-sm btn-outline-danger" data-accion="eliminar" data-id="${r.id}">Eliminar</button>
        </td></tr>`;
    }).join('');
  }

  el('tablaReservas').addEventListener('click', e => {
    const b = e.target.closest('button[data-accion]');
    if (!b) return;
    const id = Number(b.dataset.id);
    if (b.dataset.accion === 'editar') entrarEdicion(id);
    if (b.dataset.accion === 'eliminar') {
      if (!confirm('¿Seguro que quieres eliminar esta reserva?')) return;
      ReservaService.eliminar(id);
      if (Number(el('reservaId').value) === id) salirEdicion();
      Aviso.mostrar('Reserva eliminada', 'success');
      pintar();
    }
  });

  actualizarResumen();
  pintar();
});
