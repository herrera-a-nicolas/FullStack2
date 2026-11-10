/* Utilidades de formato (equivalentes a "pipes" en Angular) */
const Formato = {
  dinero(n) { return '$' + Number(n).toLocaleString('es-CL'); },
  hoyISO() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  },
  hora(h) { return String(h).padStart(2, '0') + ':00'; }
};
