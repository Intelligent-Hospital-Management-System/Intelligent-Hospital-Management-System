# IHMS - Backend (API REST)

Backend desarrollado en **NestJS** para el sistema IHMS (Intelligent Hospital Management System).

## Endpoints de la API REST (`/items`)

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/items` | Obtener todos los centros de salud |
| `GET` | `/items/:id` | Obtener un centro de salud por ID |
| `POST` | `/items` | Crear un nuevo centro de salud |
| `PUT` | `/items/:id` | Reemplazar completamente un centro de salud |
| `PATCH` | `/items/:id` | Actualizar propiedades de un centro de salud |
| `DELETE` | `/items/:id` | Eliminar un centro de salud |

## Comandos para ejecutar localmente

```bash
# Instalar dependencias
npm install

# Modo desarrollo (auto-reload)
npm run start:dev

# Compilar para producción
npm run build

# Iniciar producción
npm run start:prod
```

## Carga inicial de datos

Al iniciar la aplicación, el servidor realiza automáticamente una petición HTTP a `healthsites.io` para cargar los establecimientos de Argentina en memoria local.
