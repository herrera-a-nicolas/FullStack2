/* Componentes compartidos: navbar, footer y avisos (equivalen a componentes de Angular) */

const Aviso = {
  mostrar(msg, tipo = 'success') {
    let cont = document.getElementById('avisos');
    if (!cont) {
      cont = document.createElement('div');
      cont.id = 'avisos';
      cont.className = 'position-fixed top-0 end-0 p-3';
      cont.style.zIndex = 2000;
      document.body.appendChild(cont);
    }
    const a = document.createElement('div');
    a.className = `alert alert-${tipo} shadow alert-dismissible fade show`;
    a.innerHTML = `${V.esc(msg)}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
    cont.appendChild(a);
    setTimeout(() => a.remove(), 4500);
  }
};

function renderLayout() {
  const u = AuthService.actual();
  const pagina = location.pathname.split('/').pop() || 'index.html';

  const enlaces = [{ nombre: 'inicio', txt: 'Inicio' }];
  if (!u) {
    enlaces.push({ nombre: 'login', txt: 'Ingresar' }, { nombre: 'registro', txt: 'Registrarse' });
  } else if (u.rol === ROLES.ADMIN) {
    enlaces.push({ nombre: 'admin', txt: 'Panel admin' }, { nombre: 'perfil', txt: 'Mi perfil' });
  } else {
    enlaces.push({ nombre: 'reservas', txt: 'Mis reservas' }, { nombre: 'perfil', txt: 'Mi perfil' });
  }

  const items = enlaces.map(e =>
    `<li class="nav-item"><a class="nav-link ${pagina === Rutas.archivos[e.nombre] ? 'active' : ''}"
        href="${Rutas.url(e.nombre)}">${e.txt}</a></li>`
  ).join('');

  const salir = u
    ? `<li class="nav-item"><span class="navbar-text text-white-50 me-2">👤 ${V.esc(u.usuario)} (${u.rol})</span></li>
       <li class="nav-item"><button id="btnSalir" class="btn btn-sm btn-light">Salir</button></li>`
    : '';

  const nav = document.getElementById('navbar');
  if (nav) {
    nav.innerHTML = `
      <nav class="navbar navbar-expand-lg navbar-dark navbar-espacioya sticky-top">
        <div class="container">
          <a class="navbar-brand" href="${Rutas.url('inicio')}">🏛️ EspacioYa</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menuPrincipal"
                  aria-controls="menuPrincipal" aria-expanded="false" aria-label="Abrir menú">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="menuPrincipal">
            <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-2">${items}${salir}</ul>
          </div>
        </div>
      </nav>`;
    const btn = document.getElementById('btnSalir');
    if (btn) btn.addEventListener('click', () => { AuthService.cerrar(); Rutas.ir('inicio'); });
  }

  const pie = document.getElementById('footer');
  if (pie) {
    pie.className = 'pie py-4 mt-5';
    pie.innerHTML = `<div class="container text-center small">
      © ${new Date().getFullYear()} EspacioYa · Proyecto educativo Duoc UC · Desarrollo Full Stack II</div>`;
  }
}

document.addEventListener('DOMContentLoaded', renderLayout);
