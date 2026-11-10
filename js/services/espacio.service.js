/* Servicio de espacios (mantenedor del administrador y catálogo) */
const EspacioService = {
  /* Siempre devuelve los espacios ordenados por precio por hora (de menor a mayor) */
  listar() {
    return [...DB.get('espacios', [])].sort((a, b) => a.precioHora - b.precioHora || a.nombre.localeCompare(b.nombre));
  },

  obtener(id) { return this.listar().find(e => e.id === id) || null; },

  existeNombre(nombre, ignorarId = null) {
    const v = String(nombre).trim().toLowerCase();
    return this.listar().some(e => e.id !== ignorarId && e.nombre.toLowerCase() === v);
  },

  /* Crea (id = null) o actualiza un espacio */
  guardar(datos, id = null) {
    const lista = this.listar();
    if (id) {
      const e = lista.find(x => x.id === id);
      Object.assign(e, EspacioModel.nuevo({ ...datos, id }));
    } else {
      lista.push(EspacioModel.nuevo({ ...datos, id: DB.siguienteId(lista) }));
    }
    DB.set('espacios', lista);
  },

  /* No permite eliminar un espacio con reservas activas */
  eliminar(id) {
    const activas = ReservaService.contarActivasPorEspacio(id);
    if (activas) return { ok: false, activas };
    DB.set('espacios', this.listar().filter(e => e.id !== id));
    return { ok: true, activas: 0 };
  }
};
