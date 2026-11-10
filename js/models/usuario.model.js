/* Modelo Usuario (equivale a una interface/clase en Angular) */
const ROLES = Object.freeze({ CLIENTE: 'cliente', ADMIN: 'admin' });

/** @typedef {{id:number, nombre:string, usuario:string, email:string, clave:string,
 *            nacimiento:string, direccion:string, rol:string}} Usuario */
const UsuarioModel = {
  nuevo(d) {
    return {
      id: d.id,
      nombre: d.nombre.trim(),
      usuario: d.usuario.trim(),
      email: d.email.trim().toLowerCase(),
      clave: d.clave,
      nacimiento: d.nacimiento,
      direccion: (d.direccion || '').trim(),
      rol: d.rol || ROLES.CLIENTE
    };
  }
};
