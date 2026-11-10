/* Controlador de registro de usuarios (rol cliente) */
document.addEventListener('DOMContentLoaded', () => {
  if (AuthService.actual()) { Rutas.ir('inicio'); return; }

  const el = id => document.getElementById(id);
  const f = el('formRegistro');
  const reglas = el('reglas');
  V.pintarReglas(reglas, '');

  const chequeos = {
    nombre: () => V.campo(el('nombre'), V.m.nombre(el('nombre').value)),
    usuario: () => {
      let msg = V.m.usuario(el('usuario').value);
      if (!msg && UsuarioService.existe('usuario', el('usuario').value)) msg = 'Ese nombre de usuario ya está en uso';
      return V.campo(el('usuario'), msg);
    },
    email: () => {
      let msg = V.m.email(el('email').value);
      if (!msg && UsuarioService.existe('email', el('email').value)) msg = 'Ese correo ya está registrado';
      return V.campo(el('email'), msg);
    },
    nacimiento: () => V.campo(el('nacimiento'), V.m.nacimiento(el('nacimiento').value)),
    clave: () => V.campo(el('clave'), V.m.clave(el('clave').value)),
    clave2: () => V.campo(el('clave2'), V.m.clave2(el('clave2').value, el('clave').value))
  };

  Object.keys(chequeos).forEach(k => el(k).addEventListener('blur', chequeos[k]));
  el('nacimiento').max = Formato.hoyISO();
  el('clave').addEventListener('input', () => {
    V.pintarReglas(reglas, el('clave').value);
    if (el('clave2').value) chequeos.clave2();
  });
  el('clave2').addEventListener('input', chequeos.clave2);

  f.addEventListener('submit', e => {
    e.preventDefault();
    const resultados = Object.values(chequeos).map(fn => fn()); // corre todas para marcar todos los errores
    if (!resultados.every(Boolean)) {
      Aviso.mostrar('Revisa los campos marcados en rojo', 'danger');
      return;
    }
    UsuarioService.registrar({
      nombre: el('nombre').value,
      usuario: el('usuario').value,
      email: el('email').value,
      clave: el('clave').value,
      nacimiento: el('nacimiento').value,
      direccion: el('direccion').value
    });
    Aviso.mostrar('¡Cuenta creada! Ahora puedes iniciar sesión', 'success');
    setTimeout(() => Rutas.ir('login'), 1500);
  });

  f.addEventListener('reset', () => setTimeout(() => { V.limpiar(f); V.pintarReglas(reglas, ''); }, 0));
});
