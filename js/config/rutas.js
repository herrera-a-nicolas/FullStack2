/* Rutas de navegación. Las páginas viven en /pages y el inicio en la raíz,
   por eso los enlaces se calculan según desde dónde se esté navegando. */
const Rutas = {
  enPages: location.pathname.includes('/pages/'),
  archivos: {
    inicio: 'index.html',
    login: 'login.html',
    registro: 'registro.html',
    recuperar: 'recuperar.html',
    perfil: 'perfil.html',
    reservas: 'reservas.html',
    pago: 'pago.html',
    admin: 'admin.html'
  },
  url(nombre, query = '') {
    const prefijo = nombre === 'inicio' ? (this.enPages ? '../' : '') : (this.enPages ? '' : 'pages/');
    return prefijo + this.archivos[nombre] + query;
  },
  ir(nombre, query = '') { location.href = this.url(nombre, query); }
};
