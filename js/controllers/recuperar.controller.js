/* Controlador de recuperación de contraseña (simulado) */
document.addEventListener('DOMContentLoaded', () => {
  const el = id => document.getElementById(id);
  const formEmail = el('formEmail');
  const formNueva = el('formNueva');
  const reglas = el('reglas');
  let usuarioId = null;
  V.pintarReglas(reglas, '');

  formEmail.addEventListener('submit', e => {
    e.preventDefault();
    let msg = V.m.email(el('email').value);
    if (!msg) {
      const u = UsuarioService.buscarPorEmail(el('email').value);
      if (!u) msg = 'No existe una cuenta con ese correo';
      else usuarioId = u.id;
    }
    if (!V.campo(el('email'), msg)) return;
    Aviso.mostrar('Instrucciones enviadas (simulado)', 'success');
    formEmail.classList.add('d-none');
    formNueva.classList.remove('d-none');
  });

  const chequeoClave = () => V.campo(el('clave'), V.m.clave(el('clave').value));
  const chequeoClave2 = () => V.campo(el('clave2'), V.m.clave2(el('clave2').value, el('clave').value));
  el('clave').addEventListener('input', () => {
    V.pintarReglas(reglas, el('clave').value);
    if (el('clave2').value) chequeoClave2();
  });
  el('clave').addEventListener('blur', chequeoClave);
  el('clave2').addEventListener('input', chequeoClave2);

  formNueva.addEventListener('submit', e => {
    e.preventDefault();
    const ok = [chequeoClave(), chequeoClave2()].every(Boolean);
    if (!ok || usuarioId === null) return;
    UsuarioService.actualizar(usuarioId, { clave: el('clave').value });
    Aviso.mostrar('Contraseña actualizada. Ya puedes ingresar', 'success');
    setTimeout(() => Rutas.ir('login'), 1500);
  });
});
