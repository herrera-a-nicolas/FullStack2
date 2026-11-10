/* Servicio de autenticación (sesión simulada).
   Guardar la sesión en localStorage NO es seguridad real: es solo una demostración. */
const AuthService = {
  actual() {
    const id = DB.get('sesion');
    return id === null ? null : UsuarioService.obtener(id);
  },

  /* Devuelve el usuario si las credenciales son correctas y abre la sesión; si no, null */
  login(identificador, clave) {
    const v = String(identificador).trim().toLowerCase();
    const u = UsuarioService.listar().find(x =>
      (x.usuario.toLowerCase() === v || x.email.toLowerCase() === v) && x.clave === clave);
    if (u) DB.set('sesion', u.id);
    return u || null;
  },

  cerrar() { DB.eliminar('sesion'); },

  paginaInicial(usuario) { return usuario.rol === ROLES.ADMIN ? 'admin' : 'reservas'; },

  /* Protege una página: redirige al login o al inicio. Devuelve el usuario o null. */
  exigir(roles) {
    const u = this.actual();
    if (!u) { Rutas.ir('login'); return null; }
    if (roles && !roles.includes(u.rol)) { Rutas.ir('inicio'); return null; }
    return u;
  }
};
