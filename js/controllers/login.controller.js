/* Controlador de inicio de sesión */
document.addEventListener('DOMContentLoaded', () => {
  const actual = AuthService.actual();
  if (actual) { Rutas.ir(AuthService.paginaInicial(actual)); return; }

  const f = document.getElementById('formLogin');
  const inUsuario = document.getElementById('usuario');
  const inClave = document.getElementById('clave');

  f.addEventListener('submit', e => {
    e.preventDefault();
    const okU = V.campo(inUsuario, V.m.obligatorio(inUsuario.value, 'tu usuario o correo'));
    const okC = V.campo(inClave, V.m.obligatorio(inClave.value, 'tu contraseña'));
    if (!okU || !okC) return;

    const usuario = AuthService.login(inUsuario.value, inClave.value);
    if (!usuario) {
      V.campo(inClave, 'Usuario o contraseña incorrectos');
      Aviso.mostrar('Credenciales incorrectas', 'danger');
      return;
    }
    Rutas.ir(AuthService.paginaInicial(usuario));
  });
});
