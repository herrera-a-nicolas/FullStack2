/* Modelo Espacio */
/** @typedef {{id:number, nombre:string, capacidad:number, precioHora:number,
 *            icono:string, descripcion:string}} Espacio */
const EspacioModel = {
  nuevo(d) {
    return {
      id: d.id,
      nombre: d.nombre.trim(),
      capacidad: Number(d.capacidad),
      precioHora: Number(d.precioHora),
      icono: d.icono.trim(),
      descripcion: d.descripcion.trim()
    };
  }
};
