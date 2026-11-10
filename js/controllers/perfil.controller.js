/* Controlador de modificación de perfil (cliente y administrador) */
document.addEventListener('DOMContentLoaded', () => {
  const usuario = AuthService.exigir();
  if (!usuario) return;

  const el = id => document.getElementById(id);
  const f = el('formPerfil');
  const reglas = el('reglas');

  function cargar() {
    const u = AuthService.actual();
    el('rolBadge').textContent = u.rol;
    el('nombre').value = u.nombre;
    el('usuario').value = u.usuario;
    el('email').value = u.email;
    el('nacimiento').value = u.nacimiento;
    el('direccion').value = u.direccion || '';
    ['claveActual', 'clave', 'clave2'].forEach(id => (el(id).value = ''));
    V.limpiar(f);
    V.pintarReglas(reglas, '');
  }
  cargar();
  el('nacimiento').max = Formato.hoyISO();

  const quiereCambiarClave = () => el('claveActual').value || el('clave').value || el('clave2').value;

  const chequeos = {
    nombre: () => V.campo(el('nombre'), V.m.nombre(el('nombre').value)),
    email: () => {
      let msg = V.m.email(el('email').value);
      if (!msg && UsuarioService.existe('email', el('email').value, usuario.id)) msg = 'Ese correo ya pertenece a otra cuenta';
      return V.campo(el('email'), msg);
    },
    nacimiento: () => V.campo(el('nacimiento'), V.m.nacimiento(el('nacimiento').value))
  };
  const chequeosClave = {
    claveActual: () => V.campo(el('claveActual'),
      V.vacio(el('claveActual').value) ? 'Ingresa tu contraseña actual'
        : el('claveActual').value !== AuthService.actual().clave ? 'La contraseña actual no es correcta' : ''),
    clave: () => {
      let msg = V.m.clave(el('clave').value);
      if (!msg && el('clave').value === el('claveActual').value) msg = 'La nueva contraseña debe ser distinta a la actual';
      return V.campo(el('clave'), msg);
    },
    clave2: () => V.campo(el('clave2'), V.m.clave2(el('clave2').value, el('clave').value))
  };

  Object.keys(chequeos).forEach(k => el(k).addEventListener('blur', chequeos[k]));
  el('clave').addEventListener('input', () => {
    V.pintarReglas(reglas, el('clave').value);
    if (el('clave2').value) chequeosClave.clave2();
  });
  el('clave2').addEventListener('input', chequeosClave.clave2);

  f.addEventListener('submit', e => {
    e.preventDefault();
    let ok = Object.values(chequeos).map(fn => fn()).every(Boolean);
    if (quiereCambiarClave()) {
      ok = Object.values(chequeosClave).map(fn => fn()).every(Boolean) && ok;
    }
    if (!ok) { Aviso.mostrar('Revisa los campos marcados en rojo', 'danger'); return; }

    const cambios = {
      nombre: el('nombre').value.trim(),
      email: el('email').value.trim().toLowerCase(),
      nacimiento: el('nacimiento').value,
      direccion: el('direccion').value.trim()
    };
    if (quiereCambiarClave()) cambios.clave = el('clave').value;
    UsuarioService.actualizar(usuario.id, cambios);
    Aviso.mostrar('Perfil actualizado correctamente', 'success');
    cargar();
  });

  el('btnRestablecer').addEventListener('click', cargar);
});
