/* Modelo Reserva */
const ESTADOS = Object.freeze({ PENDIENTE: 'Pendiente', CONFIRMADA: 'Confirmada', CANCELADA: 'Cancelada' });

/** @typedef {{id:number, usuarioId:number, espacioId:number, fecha:string, hora:number,
 *            duracion:number, personas:number, tipo:string, notas:string, total:number,
 *            estado:string, creada:string, pagado:boolean}} Reserva */
const ReservaModel = {
  nueva(d) {
    return {
      id: d.id,
      usuarioId: d.usuarioId,
      espacioId: Number(d.espacioId),
      fecha: d.fecha,
      hora: Number(d.hora),
      duracion: Number(d.duracion),
      personas: Number(d.personas),
      tipo: d.tipo,
      notas: (d.notas || '').trim(),
      total: d.total,
      estado: ESTADOS.PENDIENTE,
      creada: d.creada,
      pagado: false
    };
  }
};
