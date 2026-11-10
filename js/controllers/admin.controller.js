/* Controlador del panel del administrador: mantenedores de espacios, reservas y usuarios */
document.addEventListener('DOMContentLoaded', () => {
  const admin = AuthService.exigir([ROLES.ADMIN]);
  if (!admin) return;

  const el = id => document.getElementById(id);

  /* ================= ESPACIOS ================= */
  const f = el('formEspacio');
  const editId = () => Number(el('espId').value) || null;

  const chequeos = {
    espNombre: () => {
      let msg = V.m.obligatorio(el('espNombre').value, 'el nombre');
      if (!msg && EspacioService.existeNombre(el('espNombre').value, editId())) msg = 'Ya existe un espacio con ese nombre';
      return V.campo(el('espNombre'), msg);
    },
    espCapacidad: () => {
      const n = Number(el('espCapacidad').value);
      return V.campo(el('espCapacidad'), V.vacio(el('espCapacidad').value) || !Number.isInteger(n) || n < 1 || n > 1000
        ? 'Capacidad entre 1 y 1000' : '');
    },
    espPrecio: () => {
      const n = Number(el('espPrecio').value);
      return V.campo(el('espPrecio'), V.vacio(el('espPrecio').value) || n < 1000 || n > 1000000
        ? 'Precio entre $1.000 y $1.000.000' : '');
    },
    espIcono: () => V.campo(el('espIcono'), V.m.obligatorio(el('espIcono').value, 'un ícono')),
    espDescripcion: () => V.campo(el('espDescripcion'),
      el('espDescripcion').value.trim().length < 10 ? 'Describe el espacio (mínimo 10 caracteres)' : '')
  };
  Object.keys(chequeos).forEach(k => el(k).addEventListener('blur', chequeos[k]));

  function salirEdicionEsp() {
    el('espId').value = '';
    el('tituloEspacio').textContent = 'Nuevo espacio';
    el('btnEspGuardar').textContent = 'Agregar';
    el('btnEspCancelar').classList.add('d-none');
    f.reset();
    el('espIcono').value = '🏛️';
    V.limpiar(f);
  }

  f.addEventListener('submit', e => {
    e.preventDefault();
    if (!Object.values(chequeos).map(fn => fn()).every(Boolean)) {
      Aviso.mostrar('Revisa los campos marcados en rojo', 'danger');
      return;
    }
    const id = editId();
    EspacioService.guardar({
      nombre: el('espNombre').value,
      capacidad: el('espCapacidad').value,
      precioHora: el('espPrecio').value,
      icono: el('espIcono').value,
      descripcion: el('espDescripcion').value
    }, id);
    Aviso.mostrar(id ? 'Espacio actualizado' : 'Espacio agregado', 'success');
    salirEdicionEsp();
    pintarEspacios();
  });
  el('btnEspCancelar').addEventListener('click', salirEdicionEsp);

  function pintarEspacios() {
    const lista = EspacioService.listar();
    el('tablaEspacios').innerHTML = lista.length ? lista.map(e => `
      <tr>
        <td>${V.esc(e.icono)} <strong>${V.esc(e.nombre)}</strong><br><small class="text-secondary">${V.esc(e.descripcion)}</small></td>
        <td>${e.capacidad}</td>
        <td>${Formato.dinero(e.precioHora)}</td>
        <td class="text-nowrap">
          <button class="btn btn-sm btn-outline-primary" data-acc="editarEsp" data-id="${e.id}">Editar</button>
          <button class="btn btn-sm btn-outline-danger" data-acc="borrarEsp" data-id="${e.id}">Eliminar</button>
        </td></tr>`).join('')
      : '<tr><td colspan="4" class="text-center text-secondary py-4">No hay espacios</td></tr>';
  }

  /* ================= RESERVAS ================= */
  function pintarReservas() {
    const lista = ReservaService.listarTodas();
    el('tablaReservasAdmin').innerHTML = lista.length ? lista.map(r => {
      const u = UsuarioService.obtener(r.usuarioId);
      const esp = EspacioService.obtener(r.espacioId);
      return `<tr>
        <td>${r.id}</td>
        <td>${V.esc(u ? u.nombre : '(usuario eliminado)')}</td>
        <td>${V.esc(esp ? esp.nombre : '(espacio eliminado)')}</td>
        <td>${V.esc(r.fecha)}<br><small>${Formato.hora(r.hora)} - ${Formato.hora(r.hora + r.duracion)}</small></td>
        <td>${Formato.dinero(r.total)}</td>
        <td>
          <select class="form-select form-select-sm" data-acc="estado" data-id="${r.id}">
            ${Object.values(ESTADOS).map(s => `<option ${s === r.estado ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </td>
        <td><button class="btn btn-sm btn-outline-danger" data-acc="borrarRes" data-id="${r.id}">Eliminar</button></td>
      </tr>`;
    }).join('') : '<tr><td colspan="7" class="text-center text-secondary py-4">No hay reservas</td></tr>';
  }

  /* ================= USUARIOS ================= */
  function pintarUsuarios() {
    el('tablaUsuarios').innerHTML = UsuarioService.listar().map(u => {
      const yo = u.id === admin.id;
      return `<tr>
        <td>${V.esc(u.nombre)}</td>
        <td>${V.esc(u.usuario)}</td>
        <td>${V.esc(u.email)}</td>
        <td>
          <select class="form-select form-select-sm" data-acc="rol" data-id="${u.id}" ${yo ? 'disabled' : ''}>
            ${Object.values(ROLES).map(r => `<option value="${r}" ${u.rol === r ? 'selected' : ''}>${r}</option>`).join('')}
          </select>
        </td>
        <td>${yo ? '<span class="text-secondary small">(tú)</span>'
          : `<button class="btn btn-sm btn-outline-danger" data-acc="borrarUsu" data-id="${u.id}">Eliminar</button>`}</td>
      </tr>`;
    }).join('');
  }

  /* ================= EVENTOS (delegación) ================= */
  document.addEventListener('click', e => {
    const b = e.target.closest('button[data-acc]');
    if (!b) return;
    const id = Number(b.dataset.id);

    if (b.dataset.acc === 'editarEsp') {
      const esp = EspacioService.obtener(id);
      el('espId').value = esp.id;
      el('espNombre').value = esp.nombre;
      el('espCapacidad').value = esp.capacidad;
      el('espPrecio').value = esp.precioHora;
      el('espIcono').value = esp.icono;
      el('espDescripcion').value = esp.descripcion;
      el('tituloEspacio').textContent = 'Editar espacio #' + esp.id;
      el('btnEspGuardar').textContent = 'Guardar cambios';
      el('btnEspCancelar').classList.remove('d-none');
      V.limpiar(f);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (b.dataset.acc === 'borrarEsp') {
      const activas = ReservaService.contarActivasPorEspacio(id);
      if (activas) { Aviso.mostrar(`No se puede eliminar: tiene ${activas} reserva(s) activa(s)`, 'warning'); return; }
      if (!confirm('¿Eliminar este espacio?')) return;
      EspacioService.eliminar(id);
      Aviso.mostrar('Espacio eliminado', 'success');
      pintarEspacios();
    }

    if (b.dataset.acc === 'borrarRes') {
      if (!confirm('¿Eliminar esta reserva?')) return;
      ReservaService.eliminar(id);
      Aviso.mostrar('Reserva eliminada', 'success');
      pintarReservas();
    }

    if (b.dataset.acc === 'borrarUsu') {
      if (!confirm('¿Eliminar este usuario y todas sus reservas?')) return;
      UsuarioService.eliminar(id);
      Aviso.mostrar('Usuario eliminado', 'success');
      pintarUsuarios();
      pintarReservas();
    }
  });

  document.addEventListener('change', e => {
    const s = e.target.closest('select[data-acc]');
    if (!s) return;
    const id = Number(s.dataset.id);
    if (s.dataset.acc === 'estado') {
      ReservaService.cambiarEstado(id, s.value);
      Aviso.mostrar('Estado de la reserva actualizado', 'success');
    }
    if (s.dataset.acc === 'rol') {
      UsuarioService.cambiarRol(id, s.value);
      Aviso.mostrar('Rol actualizado', 'success');
    }
  });

  pintarEspacios();
  pintarReservas();
  pintarUsuarios();
});
