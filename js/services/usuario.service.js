/* Servicio de usuarios: CRUD y búsquedas */
const UsuarioService = {
  listar() { return DB.get('usuarios', []); },

  obtener(id) { return this.listar().find(u => u.id === id) || null; },

  buscarPorEmail(email) {
    const v = String(email).trim().toLowerCase();
    return this.listar().find(u => u.email.toLowerCase() === v) || null;
  },

  /* ¿Existe otro usuario con ese valor en el campo (usuario / email)? */
  existe(campo, valor, ignorarId = null) {
    const v = String(valor).trim().toLowerCase();
    return this.listar().some(u => u.id !== ignorarId && String(u[campo]).toLowerCase() === v);
  },

  registrar(datos) {
    const lista = this.listar();
    const u = UsuarioModel.nuevo({ ...datos, id: DB.siguienteId(lista), rol: ROLES.CLIENTE });
    lista.push(u);
    DB.set('usuarios', lista);
    return u;
  },

  actualizar(id, cambios) {
    const lista = this.listar();
    const u = lista.find(x => x.id === id);
    if (!u) return null;
    Object.assign(u, cambios);
    DB.set('usuarios', lista);
    return u;
  },

  cambiarRol(id, rol) { return this.actualizar(id, { rol }); },

  eliminar(id) {
    DB.set('usuarios', this.listar().filter(u => u.id !== id));
    ReservaService.eliminarPorUsuario(id); // un usuario eliminado no deja reservas huérfanas
  }
};
