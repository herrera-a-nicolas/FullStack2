# EspacioYa 🏛️

Aplicación FrontEnd para **reserva de horas de espacios para eventos** (salones, salas, terrazas).
Proyecto educativo · Desarrollo Full Stack II (DSY2202) · Evaluación sumativa Semana 3.

## Tecnologías
HTML5 · CSS3 (variables, animaciones, media queries) · Bootstrap 5.3 (CDN, grid de 12 columnas) · JavaScript puro.
No hay backend: los datos se simulan con `localStorage`.

## Cómo ejecutarlo
Abrir `index.html` en el navegador, o con la extensión *Live Server* de VS Code (clic derecho en `index.html` → *Open with Live Server*).
Requiere internet para cargar Bootstrap desde el CDN.

## Cuentas de prueba
| Rol | Usuario | Contraseña |
|---|---|---|
| Administrador | `admin` | `Admin123!` |
| Cliente | `cliente` | `Cliente1!` |

Para volver a los datos iniciales: borrar el *localStorage* del sitio (F12 → Application → Local Storage → Clear).

## Arquitectura (capas tipo MVC)
```
EspacioYa/
├── index.html                  Vista de inicio
├── pages/                      VISTAS (V): login, registro, recuperar, perfil, reservas, pago, admin
├── css/style.css               Estilos propios (sobre Bootstrap)
├── data/seed.js                Datos iniciales de demostración
└── js/
    ├── models/                 MODELOS (M): forma de Usuario, Espacio y Reserva + constantes (ROLES, ESTADOS)
    ├── services/               LÓGICA Y DATOS: único lugar que lee/escribe datos y que aplica reglas de negocio
    │   ├── storage.service.js    acceso a localStorage
    │   ├── auth.service.js       sesión, login, protección de páginas por rol
    │   ├── usuario.service.js    CRUD de usuarios
    │   ├── espacio.service.js    CRUD de espacios
    │   └── reserva.service.js    reservas: choque de horarios, total, pago simulado
    ├── controllers/            CONTROLADORES (C): un archivo por página; leen el formulario, validan y llaman a los servicios
    ├── components/layout.js    Navbar, footer y avisos compartidos
    ├── utils/                  Validaciones reutilizables y formato (dinero, fechas, horas)
    └── config/rutas.js         Rutas de navegación
```
Regla de oro: **los controladores no tocan `localStorage`**; siempre pasan por un servicio.
Se usan scripts normales (no módulos ES) para que el proyecto funcione abriendo los archivos directamente, sin servidor.

## Camino hacia Angular (próximas semanas)
| Hoy (JS puro) | En Angular |
|---|---|
| `models/*.model.js` | `interface` / clases en `models/` |
| `services/*.service.js` | `@Injectable() services` (cambia `localStorage` por `HttpClient` a una API REST) |
| `controllers/*.controller.js` | `*.component.ts` |
| `pages/*.html` y `components/layout.js` | plantillas `*.component.html` y componentes compartidos |
| `config/rutas.js` | `app.routes.ts` (Router) |
| `AuthService.exigir()` | `Guards` de rutas |
| `data/seed.js` | respuestas JSON de la API |
| `utils/validaciones.js` | validadores de formularios reactivos |

## Páginas
| Página | Acceso | Descripción |
|---|---|---|
| `index.html` | Público | Inicio y catálogo de espacios |
| `pages/login.html` | Público | Inicio de sesión |
| `pages/registro.html` | Público | Registro de clientes |
| `pages/recuperar.html` | Público | Recuperar contraseña (simulado) |
| `pages/perfil.html` | Cliente y admin | Modificación de perfil y cambio de contraseña |
| `pages/reservas.html` | Cliente | Crear, modificar, eliminar y listar reservas |
| `pages/pago.html` | Cliente | Pago simulado de una reserva |
| `pages/admin.html` | Admin | Mantenedores de espacios, reservas y usuarios |

## Roles
- **Cliente:** reserva espacios, paga (simulado) y gestiona sus reservas y perfil.
- **Administrador:** administra espacios (crear/editar/eliminar), cambia el estado de reservas, y gestiona usuarios y roles.

## Validaciones principales
- Contraseña (5 reglas): 6 a 18 caracteres, mayúscula, minúscula, número y carácter especial.
- Correo con formato válido y único, usuario único, mayor de 13 años, contraseñas iguales.
- Reservas: fecha no pasada, horario sin choques con otras reservas, capacidad máxima del espacio, término a más tardar a las 23:00.

## Nota de seguridad
Las contraseñas se guardan en texto plano en `localStorage` **solo porque es un proyecto educativo sin servidor**. En un sistema real se almacenan con hash en el backend.
