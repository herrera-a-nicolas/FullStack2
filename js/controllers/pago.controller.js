/* Controlador de pago simulado */
document.addEventListener('DOMContentLoaded', () => {
  const usuario = AuthService.exigir([ROLES.CLIENTE]);
  if (!usuario) return;

  const el = id => document.getElementById(id);
  const id = Number(new URLSearchParams(location.search).get('id'));
  const r = ReservaService.obtener(id);
  const detalle = el('detalle');
  const formPago = el('formPago');
  const volver = '<a href="reservas.html" class="btn btn-principal">Volver a mis reservas</a>';

  if (!r || r.usuarioId !== usuario.id) {
    detalle.innerHTML = '<div class="alert alert-danger">No encontramos esa reserva.</div>' + volver;
    formPago.classList.add('d-none');
    return;
  }

  const esp = EspacioService.obtener(r.espacioId);
  detalle.innerHTML = `
    <ul class="list-group">
      <li class="list-group-item"><strong>Reserva #${r.id}</strong> · <span class="badge badge-estado-${r.estado}">${r.estado}</span></li>
      <li class="list-group-item">Espacio: ${V.esc(esp ? esp.nombre : '(eliminado)')}</li>
      <li class="list-group-item">Fecha: ${V.esc(r.fecha)} · ${Formato.hora(r.hora)} a ${Formato.hora(r.hora + r.duracion)}</li>
      <li class="list-group-item">Evento: ${V.esc(r.tipo)} · ${r.personas} personas</li>
      <li class="list-group-item fs-5">Total a pagar: <strong class="precio">${Formato.dinero(r.total)}</strong></li>
    </ul>`;

  if (r.estado !== ESTADOS.PENDIENTE) {
    formPago.classList.add('d-none');
    const msg = r.estado === ESTADOS.CONFIRMADA
      ? '<div class="alert alert-success mt-3">Esta reserva ya está pagada.</div>'
      : '<div class="alert alert-secondary mt-3">Esta reserva está cancelada.</div>';
    detalle.insertAdjacentHTML('beforeend', msg + '<div class="mt-2">' + volver + '</div>');
    return;
  }

  formPago.addEventListener('submit', e => {
    e.preventDefault();
    const okM = V.campo(el('metodo'), V.m.obligatorio(el('metodo').value, 'un método de pago'));
    const okT = el('terminos').checked;
    el('terminos').classList.toggle('is-invalid', !okT);
    if (!okT) el('terminos').parentElement.querySelector('.invalid-feedback').textContent = 'Debes aceptar las condiciones';
    if (!okM || !okT) return;

    const pagada = ReservaService.pagar(r.id, el('metodo').value);
    formPago.classList.add('d-none');
    detalle.classList.add('d-none');
    el('codigoPago').textContent = pagada.codigoPago;
    el('exito').classList.remove('d-none');
  });
});
