/* Controlador de la página de inicio: muestra el catálogo de espacios */
document.addEventListener('DOMContentLoaded', () => {
  const cont = document.getElementById('listaEspacios');
  const u = AuthService.actual();
  const espacios = EspacioService.listar();

  if (!espacios.length) {
    cont.innerHTML = '<p class="text-center text-secondary">Aún no hay espacios publicados.</p>';
    return;
  }

  cont.innerHTML = espacios.map((e, i) => {
    let destino = Rutas.url('login');
    if (u && u.rol === ROLES.CLIENTE) destino = Rutas.url('reservas', '?espacio=' + e.id);
    if (u && u.rol === ROLES.ADMIN) destino = Rutas.url('admin');
    const texto = u && u.rol === ROLES.ADMIN ? 'Administrar' : 'Reservar';
    return `
      <div class="col">
        <div class="card tarjeta espacio-card h-100 text-center p-3" style="animation-delay:${i * 0.1}s">
          <div class="espacio-icono">${V.esc(e.icono)}</div>
          <div class="card-body">
            <h5 class="card-title fw-bold">${V.esc(e.nombre)}</h5>
            <p class="card-text text-secondary">${V.esc(e.descripcion)}</p>
            <p class="mb-1">👥 Hasta ${V.esc(e.capacidad)} personas</p>
            <p class="precio">${Formato.dinero(e.precioHora)} / hora</p>
            <a href="${destino}" class="btn btn-principal">${texto}</a>
          </div>
        </div>
      </div>`;
  }).join('');
});
