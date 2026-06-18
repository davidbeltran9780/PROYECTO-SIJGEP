# ⚖️ SIGJEP
### Sistema Inteligente de Gestión Jurídica para Entidades Públicas
**SENA — Programación de Software | Código: 223104**

---

## ¿Qué es SIGJEP?
Aplicación web para automatizar la gestión jurídica de alcaldías colombianas. Gestiona expedientes de tutelas, demandas y PQRS, clasifica documentos con IA, genera resúmenes jurídicos y alerta sobre vencimientos legales.

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + PrimeReact + Axios |
| Backend | Python 3.13 + FastAPI |
| Base de datos | MySQL local |
| Autenticación | PyJWT + bcrypt |
| IA | Google Gemini API |
| Backups | Google Drive API |
| Control de versiones | Git / GitHub |

---

## Estructura del Proyecto

```
PROYECTO-SIGJEP/
├── backend/
│   ├── routers/
│   │   ├── auth.py           # Login, registro, recuperar contraseña
│   │   ├── expedientes.py    # CRUD expedientes
│   │   ├── casos.py          # CRUD casos
│   │   ├── documentos.py     # Subir archivos
│   │   ├── usuarios.py       # CRUD usuarios
│   │   ├── ia.py             # Gemini — resumir y clasificar
│   │   ├── backups.py        # Backups a Google Drive
│   │   ├── pqrs.py           # Módulo PQRS
│   │   ├── consulta.py       # Consulta pública sin cuenta
│   │   └── reportes.py       # Estadísticas
│   ├── models/
│   ├── uploads/
│   ├── main.py
│   ├── database.py
│   ├── auth_utils.py         # Utilidades JWT y autenticación
│   ├── auditoria_utils.py    # Registro automático de acciones
│   ├── fechas_utils.py       # Cálculo de días hábiles
│   ├── schema.sql            # Estructura de la base de datos
│   ├── datos_prueba.sql      # Datos iniciales para desarrollo
│   ├── requirements.txt
│   └── .env.example
├── frontend-react/           # Frontend React (activo)
│   ├── src/
│   │   ├── api/axios.js
│   │   ├── components/       # Header, Sidebar, Footer, Paginacion, ConfirmModal, Accesibilidad, SesionExpirando
│   │   ├── pages/            # Login, Dashboard, Expedientes, Documentos, PQRS, Alertas, Reportes, ModuloIA, Admin, Ayuda, Configuracion, etc.
│   │   ├── context/          # ToastContext
│   │   └── assets/styles.css # Hoja de estilos principal (36 secciones documentadas)
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## Instalación

### Requisitos
- Python 3.13
- Node.js LTS → https://nodejs.org
- MySQL Workbench
- Git + VS Code

### Backend

```bash
cd backend
py -3.13 -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Crear `backend/.env` basado en `.env.example`.

Crear la base de datos en MySQL Workbench:
```
File → Open SQL Script → backend/schema.sql → Execute
```

Arrancar:
```bash
uvicorn main:app --reload
```
→ http://127.0.0.1:8000
→ Docs: http://127.0.0.1:8000/docs

### Frontend React

```bash
cd frontend-react
npm install
```

Crear `frontend-react/.env`:
```
VITE_API_URL=http://127.0.0.1:8000
```

Arrancar:
```bash
npm run dev
```
→ http://localhost:5173

---

## Datos de prueba

Cargar en MySQL Workbench después del schema:
```
File → Open SQL Script → backend/datos_prueba.sql → Execute
```

**Todos los usuarios tienen contraseña: `Sena2026`**

| Usuario | Email | Rol |
|---------|-------|-----|
| Manuel Rodríguez | admin@sigjep.co | administrador |
| Laura Jiménez | abogado@sigjep.co | abogado |
| Andrés Castellanos | acastellanos@sigjep.co | abogado |
| Patricia Vargas | pvargas@sigjep.co | abogado |
| Sofía Morales | secretaria@sigjep.co | secretaria |
| Jorge Quintero | jquintero@sigjep.co | secretaria |
| Carlos Pérez | ciudadano@sigjep.co | ciudadano |

> Incluye 23 expedientes, 16 PQRS con fechas variadas, 30 documentos, auditoría y backups de ejemplo.

---

## En desarrollo — DOS terminales

| Terminal | Comando | Puerto |
|----------|---------|--------|
| Backend | `uvicorn main:app --reload` | :8000 |
| Frontend | `npm run dev` | :5173 |

---

## Base de Datos

| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Usuarios con roles |
| `casos` | Tutelas, demandas, PQRS |
| `expedientes` | Expedientes por caso |
| `documentos` | Archivos subidos |
| `borradores_respuesta` | Borradores IA |
| `ia_resumenes` | Resúmenes Gemini |
| `backups_log` | Historial backups Drive |
| `pqrs` | Solicitudes ciudadanos |
| `alertas` | Alertas de vencimiento |
| `log_auditoria` | Registro acciones (Ley 1581) |
| `password_reset_tokens` | Tokens recuperación contraseña |

### Roles

| Rol | Permisos |
|-----|----------|
| `administrador` | Acceso total |
| `abogado` | Expedientes y casos |
| `secretaria` | Apoyo documental |
| `ciudadano` | Solo PQRS |

---

## Endpoints

| Método | Endpoint | Estado |
|--------|----------|--------|
| POST | `/login` | ✅ |
| POST | `/register` | ✅ |
| POST | `/recuperar-password` | ✅ |
| POST | `/reset-password` | ✅ |
| POST | `/renovar-token` | ✅ |
| GET | `/perfil` | ✅ |
| PUT | `/perfil` | ✅ |
| GET/POST/PUT/DELETE | `/expedientes` | ✅ |
| GET/POST/PUT/DELETE | `/usuarios` | ✅ |
| PATCH | `/usuarios/{id}/activar` | ✅ |
| PATCH | `/usuarios/{id}/desactivar` | ✅ |
| POST | `/ia/resumir` | ✅ |
| POST | `/backups/manual` | ✅ |
| GET | `/backups/listar` | ✅ |
| GET/POST | `/pqrs` | ✅ |
| GET/POST/PUT/DELETE | `/casos` | ✅ |
| POST | `/documentos/subir` | ✅ |
| GET | `/auditoria/` | ✅ |
| GET | `/auditoria/exportar` | ✅ |
| GET | `/reportes/casos-por-tipo` | ✅ |
| GET | `/reportes/casos-por-mes` | ✅ |
| GET | `/reportes/vencimientos` | ✅ |
| GET | `/reportes/notificaciones` | ✅ |
| GET | `/consulta/buscar` | ✅ |

---

## Tipos de commit

| Tipo | Uso |
|------|-----|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Documentación |
| `style` | Formato |
| `refactor` | Refactorización |

---

## Equipo

| Nombre | Rol |
|--------|-----|
| Daniel Dionisio | Backend, coordinación |
| Brayan Trujillo | Scrum Master |
| Valentina Sabogal | Desarrollo |
| Miguel Corredor | Desarrollo |

**Instructora:** Jenny Guio

---

## Módulos implementados

| Módulo | Descripción | Estado |
|--------|-------------|--------|
| Login / Registro | Autenticación JWT con roles | ✅ |
| Recuperar contraseña | Envío de correo con token | ✅ |
| Dashboard | Tarjetas, gráficas y tabla de expedientes con filtros | ✅ |
| Expedientes | CRUD, asignación de abogado con confirmación, cierre, reactivación, paginación y filtro de fechas | ✅ |
| Documentos | Subida de archivos por expediente, columna de días a vencer con colores, filtro por tipo y estado de vencimiento, ordenado por urgencia | ✅ |
| Alertas | Tablas de vencimientos clasificados (vencido/urgente/próximo/a tiempo) con paginación | ✅ |
| PQRS | Gestión interna con fecha creación/vencimiento, filtro de fechas, confirmación al cambiar estado, radicación pública con verificación de correo para anónimas | ✅ |
| Módulo IA | Análisis jurídico con Gemini: partes, hechos, pretensiones, normas y borrador; resumen en pantalla, análisis completo en PDF/Word | ✅ |
| Reportes | Gráficas y tablas de vencimientos y PQRS pendientes con paginación | ✅ |
| Admin — Usuarios | CRUD con activar/desactivar, filtros por rol/estado, confirmación al guardar edición | ✅ |
| Admin — Backups | Generar y restaurar copias en Google Drive con historial | ✅ |
| Admin — Auditoría | Log de acciones con IP, detalle y exportar CSV (Ley 1581) | ✅ |
| Consulta pública | Búsqueda de procesos sin cuenta por radicado/nombre/tipo | ✅ |
| Configuración | Cambio de nombre y contraseña desde cualquier rol | ✅ |
| Accesibilidad | Widget con fuente ajustable, alto contraste, dislexia, daltonismo | ✅ |
| Sesión expirando | Aviso 5 min antes con cuenta regresiva y opción de extender | ✅ |
| Ayuda | Centro de ayuda con guía de todos los módulos y preguntas frecuentes | ✅ |



*SIGJEP — SENA Programación de Software 223104 — 2026*