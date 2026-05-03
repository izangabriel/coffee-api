# ☕ Café Imperium — API

Backend REST para la tienda de café en línea **Café Imperium**. Construido con Node.js, Express y MongoDB.

## 🚀 Demo

| | URL |
|---|---|
| **Frontend** | [cafe-imperium.netlify.app](https://cafe-imperium.netlify.app) |
| **API** | [coffee-api-qas5.onrender.com](https://coffee-api-qas5.onrender.com) |

---

## 🛠️ Tecnologías

- **Node.js** + **Express** — servidor y rutas REST
- **MongoDB** + **Mongoose** — base de datos y modelos
- **Stripe** — procesamiento de pagos
- **Cloudinary** — almacenamiento de imágenes
- **bcryptjs** — encriptación de contraseñas

---

## ✨ Funcionalidades

- Autenticación de usuarios con bcrypt
- CRUD completo de productos con imágenes en Cloudinary
- Carrito de compras persistente por usuario
- Integración de pagos con Stripe (Payment Intents)
- Gestión de órdenes con estados: pending, paid, shipped, delivered, cancelled
- Panel de administración con endpoints protegidos

---

## 📁 Estructura del proyecto

```
BackCoffee/
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
└── server.js
```

---

## 📌 Endpoints

### Usuarios `/users`
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/users` | Obtener todos los usuarios |
| GET | `/users/:id` | Obtener usuario por ID |
| POST | `/users` | Crear usuario |
| POST | `/users/login` | Login |
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
| GET | `/orders/admin` | Obtener todas las órdenes (admin) |
| GET | `/orders` | Obtener órdenes del usuario |
| GET | `/orders/:id` | Obtener orden por ID |
| PUT | `/orders/:id/status` | Actualizar status de orden |
| DELETE | `/orders/:id` | Eliminar orden |

---

## ⚙️ Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
PORT=3001
MONGO_DB_URI=mongodb+srv://...
STRIPE_SECRET_KEY=sk_test_...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

---

## 🏃 Cómo correrlo localmente

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

## 🔗 Repositorio del frontend

El frontend de este proyecto está disponible en:
[github.com/izangabriel](https://github.com/izangabriel)

---

## 👤 Autor

**Izan Gabriel**
- GitHub: [@izangabriel](https://github.com/izangabriel)
