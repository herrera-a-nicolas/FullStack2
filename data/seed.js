/* Datos iniciales de demostración (se cargan la primera vez que se abre el sitio).
   Más adelante este archivo se reemplaza por una API / archivos JSON. */
const SEED = {
  usuarios: [
    { id: 1, nombre: 'Administrador del Sistema', usuario: 'admin', email: 'admin@espacioya.cl',
      clave: 'Admin123!', nacimiento: '1990-01-01', direccion: '', rol: 'admin' },
    { id: 2, nombre: 'Cliente de Prueba', usuario: 'cliente', email: 'cliente@espacioya.cl',
      clave: 'Cliente1!', nacimiento: '1995-05-15', direccion: 'Av. Ejemplo 123', rol: 'cliente' }
  ],
  espacios: [
    { id: 1, nombre: 'Salón Aurora', capacidad: 120, precioHora: 45000, icono: '🎉',
      descripcion: 'Amplio salón ideal para matrimonios y celebraciones grandes.' },
    { id: 2, nombre: 'Sala Ejecutiva', capacidad: 30, precioHora: 18000, icono: '💼',
      descripcion: 'Equipada con proyector y wifi para reuniones y capacitaciones.' },
    { id: 3, nombre: 'Terraza Jardín', capacidad: 60, precioHora: 30000, icono: '🌿',
      descripcion: 'Espacio al aire libre perfecto para cumpleaños y eventos sociales.' },
    { id: 4, nombre: 'Estudio Creativo', capacidad: 15, precioHora: 12000, icono: '🎨',
      descripcion: 'Pequeño y luminoso, ideal para talleres y sesiones de fotos.' }
  ]
};
