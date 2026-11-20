/* Servicio de reservas: reglas de negocio (choque de horarios, total, pago simulado) */
const ReservaService = {
  HORA_MIN: 8,          // primera hora de inicio permitida
  HORA_MAX_INICIO: 22,  // última hora de inicio permitida
  HORA_FIN_MAX: 23,     // el evento debe terminar a más tardar a esta hora
  DURACION_MAX: 8,

  listar() { return DB.get('reservas', []); },

  /* Más recientes primero: se compara la fecha (ISO) y después la hora como NÚMERO.
     (Antes se concatenaban como texto y "8" quedaba después de "12"). */
  listarTodas() {
    return this.listar().sort((a, b) => b.fecha.localeCompare(a.fecha) || b.hora - a.hora);
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

  /* ÚNICO lugar donde cambia el estado de una reserva. Mantiene coherentes estado y pago:
     - Confirmada  => pagada (con método y código de pago)
     - Pendiente / Cancelada => no pagada (se limpian los datos de pago) */
  aplicarEstado(r, estado, metodo = null) {
    r.estado = estado;
    if (estado === ESTADOS.CONFIRMADA) {
      r.pagado = true;
      r.metodoPago = r.metodoPago || metodo || 'Registrado por el administrador';
      r.codigoPago = r.codigoPago || 'PAG-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    } else {
      r.pagado = false;
      delete r.metodoPago;
      delete r.codigoPago;
    }
    return r;
  },

  cambiarEstado(id, estado) {
    const lista = this.listar();
    this.aplicarEstado(lista.find(x => x.id === id), estado);
    DB.set('reservas', lista);
  },

  /* Pago simulado: no maneja dinero ni datos bancarios, solo confirma la reserva */
  pagar(id, metodo) {
    const lista = this.listar();
    const r = this.aplicarEstado(lista.find(x => x.id === id), ESTADOS.CONFIRMADA, metodo);
    DB.set('reservas', lista);
    return r;
  },

  eliminar(id) { DB.set('reservas', this.listar().filter(r => r.id !== id)); },

  eliminarPorUsuario(usuarioId) { DB.set('reservas', this.listar().filter(r => r.usuarioId !== usuarioId)); }
};
