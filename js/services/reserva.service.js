/* Servicio de reservas: reglas de negocio (choque de horarios, total, pago simulado) */
const ReservaService = {
  HORA_MIN: 8,          // primera hora de inicio permitida
  HORA_MAX_INICIO: 22,  // última hora de inicio permitida
  HORA_FIN_MAX: 23,     // el evento debe terminar a más tardar a esta hora
  DURACION_MAX: 8,

  listar() { return DB.get('reservas', []); },

  listarTodas() {
    return this.listar().sort((a, b) => (b.fecha + b.hora).localeCompare(a.fecha + a.hora));
  },

  listarPorUsuario(usuarioId) {
    return this.listarTodas().filter(r => r.usuarioId === usuarioId);
  },

  obtener(id) { return this.listar().find(r => r.id === id) || null; },

  calcularTotal(espacioId, duracion) {
    const esp = EspacioService.obtener(espacioId);
    return esp && duracion > 0 ? esp.precioHora * duracion : 0;
  },

  /* Dos reservas chocan si el mismo espacio, el mismo día, tiene horarios que se solapan */
  hayChoque(espacioId, fecha, hora, duracion, ignorarId = null) {
    return this.listar().some(r =>
      r.id !== ignorarId && r.espacioId === espacioId && r.fecha === fecha &&
      r.estado !== ESTADOS.CANCELADA &&
      hora < r.hora + r.duracion && r.hora < hora + duracion);
  },

  contarActivasPorEspacio(espacioId) {
    return this.listar().filter(r => r.espacioId === espacioId && r.estado !== ESTADOS.CANCELADA).length;
  },

  crear(usuarioId, datos) {
    const lista = this.listar();
    const r = ReservaModel.nueva({
      ...datos,
      id: DB.siguienteId(lista),
      usuarioId,
      total: this.calcularTotal(Number(datos.espacioId), Number(datos.duracion)),
      creada: Formato.hoyISO()
    });
    lista.push(r);
    DB.set('reservas', lista);
    return r;
  },

  actualizar(id, datos) {
    const lista = this.listar();
    const r = lista.find(x => x.id === id);
    Object.assign(r, datos, { total: this.calcularTotal(Number(datos.espacioId), Number(datos.duracion)) });
    DB.set('reservas', lista);
    return r;
  },

  cambiarEstado(id, estado) {
    const lista = this.listar();
    lista.find(x => x.id === id).estado = estado;
    DB.set('reservas', lista);
  },

  /* Pago simulado: no maneja dinero ni datos bancarios, solo confirma la reserva */
  pagar(id, metodo) {
    const lista = this.listar();
    const r = lista.find(x => x.id === id);
    r.estado = ESTADOS.CONFIRMADA;
    r.pagado = true;
    r.metodoPago = metodo;
    r.codigoPago = 'PAG-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    DB.set('reservas', lista);
    return r;
  },

  eliminar(id) { DB.set('reservas', this.listar().filter(r => r.id !== id)); },

  eliminarPorUsuario(usuarioId) { DB.set('reservas', this.listar().filter(r => r.usuarioId !== usuarioId)); }
};
