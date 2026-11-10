/* Capa de datos. Es el ÚNICO archivo que toca localStorage directamente.
   Proyecto educativo: no hay backend, por eso las claves se guardan en texto plano.
   En un sistema real NUNCA se guardan así. */

const DB = {
  get(clave, porDefecto = null) {
    try {
      const v = JSON.parse(localStorage.getItem(clave));
      return v === null ? porDefecto : v;
    } catch (e) {
      return porDefecto;
    }
  },
  set(clave, valor) { localStorage.setItem(clave, JSON.stringify(valor)); },
  eliminar(clave) { localStorage.removeItem(clave); },
  siguienteId(lista) { return lista.length ? Math.max(...lista.map(x => x.id)) + 1 : 1; }
};

function iniciarDatos() {
  if (!DB.get('usuarios')) DB.set('usuarios', SEED.usuarios);
  if (!DB.get('espacios')) DB.set('espacios', SEED.espacios);
  if (!DB.get('reservas')) DB.set('reservas', []);
}
iniciarDatos();
