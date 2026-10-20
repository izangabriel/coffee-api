#Café Imperium — API

Backend REST para la tienda de café en línea **Café Imperium**. Construido con Node.js, Express y MongoDB.

##Demo

| | URL |
|---|---|
| **Frontend** | [cafe-imperium.netlify.app](https://cafe-imperium.netlify.app) |
| **API** | [coffee-api-qas5.onrender.com](https://coffee-api-qas5.onrender.com) |

> La API y la base de datos corren en planes gratuitos. Si llevan un rato inactivas, la primera petición puede tardar en responder mientras se reactivan.

**Probar el pago:** los pagos usan el modo de prueba de Stripe, así que no se cobra dinero real. En el checkout puedes usar la tarjeta de prueba `4242 4242 4242 4242`, con cualquier fecha futura y cualquier CVC.

---

##Tecnologías

- **Node.js** + **Express** — servidor y rutas REST
- **MongoDB** + **Mongoose** — base de datos y modelos
- **Stripe** — procesamiento de pagos
- **Cloudinary** — almacenamiento de imágenes
- **bcryptjs** — encriptación de contraseñas

---

##Funcionalidades

- Registro y login de usuarios, con contraseñas encriptadas con bcrypt
- CRUD de productos con imágenes en Cloudinary
- Carrito de compras persistente por usuario
- Integración de pagos con Stripe (Payment Intents)
- Gestión de órdenes con estados: pending, paid, shipped, delivered, cancelled
- Endpoints de administración para órdenes (la verificación del rol todavía no se hace en el servidor, ver [Limitaciones conocidas](#️-limitaciones-conocidas))

---

##Estructura del proyecto

```
coffee-api/
├── models/
│   ├── userModel.js
│   ├── productModel.js
│   ├── cartModel.js
│   └── orderModel.js
├── routes/
│   ├── userRoute.js
│   ├── productsRoute.js
│   ├── cartRoute.js
│   └── orderRoute.js
├── middleware/
│   └── upload.js
├── config/
│   └── cloudinary.js
├── .env.example
├── .gitignore
├── package.json
├── request.http
└── server.js
```

---

##Endpoints

Las rutas de órdenes esperan un header `user-id` con el id del usuario (ver [Limitaciones conocidas](#️-limitaciones-conocidas)).

### Usuarios `/users`
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/users` | Obtener todos los usuarios |
| GET | `/users/:id` | Obtener usuario por ID |
| POST | `/users` | Crear usuario (siempre con rol `user`) |
| POST | `/users/login` | Login (devuelve el usuario, sin token) |
| PUT | `/users/:id` | Actualizar usuario |
| DELETE | `/users/:id` | Eliminar usuario |

### Productos `/products`
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/products` | Obtener todos los productos |
| GET | `/products/:id` | Obtener producto por ID |
| POST | `/products` | Crear producto |
| PUT | `/products/:id` | Editar producto |
| DELETE | `/products/:id` | Eliminar producto |

### Carrito `/carts`
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/carts` | Obtener carrito del usuario |
| POST | `/carts/add` | Agregar producto |
| PUT | `/carts/update/:productId` | Actualizar cantidad |
| DELETE | `/carts/clear` | Vaciar carrito |
| DELETE | `/carts/:productId` | Eliminar producto |

### Órdenes `/orders`
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/orders/create-payment-intent` | Crear intento de pago con Stripe |
| POST | `/orders/confirm` | Confirmar orden tras pago exitoso |
| GET | `/orders/admin` | Obtener todas las órdenes (uso de administración) |
| GET | `/orders` | Obtener órdenes del usuario |
| GET | `/orders/:id` | Obtener orden por ID |
| PUT | `/orders/:id/status` | Actualizar status de orden |
| DELETE | `/orders/:id` | Eliminar orden |

---

##Variables de entorno

Copia `.env.example` a `.env` y completa los valores:

```env
PORT=3001
MONGO_DB_URI=mongodb+srv://...
STRIPE_SECRET_KEY=sk_test_...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

---

##Cómo correrlo localmente

```bash
# Clonar el repositorio
git clone https://github.com/izangabriel/coffee-api.git
cd coffee-api

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita el .env con tus credenciales

# Correr en desarrollo
npm run dev
```

---

##Limitaciones conocidas

Este es un proyecto de práctica y todavía no está listo para producción:

- **Autenticación sin token.** El login valida el email y la contraseña, pero no devuelve ningún token. Las rutas de órdenes identifican al usuario con un header `user-id`, un valor que controla el cliente.
- **Rutas de administración sin verificación de rol en el servidor.** El frontend oculta el panel de administración con rutas protegidas, pero la API todavía no comprueba el rol en endpoints como `GET /orders/admin`, `PUT /orders/:id/status` o `DELETE /orders/:id`.
- **Pagos en modo de prueba.** Stripe está configurado con claves de prueba.
- Sin pruebas automatizadas ni límite de peticiones por cliente.

**Mejora planeada:** autenticación con JWT y un middleware que exija el rol de administrador en las rutas que lo necesitan.

---

##Repositorio del frontend

El frontend de este proyecto está disponible en:
[PEGA AQUÍ EL LINK DEL REPOSITORIO DEL FRONTEND]

---

##Autor

**Izan Gabriel**
- GitHub: [@izangabriel](https://github.com/izangabriel)
