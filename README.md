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
│   │   └── reportes.py       # Estadísticas
│   ├── models/
│   ├── uploads/
│   ├── main.py
│   ├── database.py
│   ├── schema.sql
│   ├── requirements.txt
│   └── .env.example
├── frontend/                 # HTML original (referencia)
├── frontend-react/           # Frontend activo en React
│   ├── src/
│   │   ├── api/axios.js
│   │   ├── components/       # Header, Sidebar, Footer, Accesibilidad, SesionExpirando
│   │   ├── pages/            # Login, Dashboard, Admin, Configuracion, etc.
│   │   └── assets/styles.css
│   ├── .env.example
│   └── README.md
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
| Expedientes | CRUD, asignación de abogado, cierre y reactivación | ✅ |
| Documentos | Subida de archivos PDF/Word/imagen por expediente | ✅ |
| Alertas | Tabla de casos por vencimiento (urgente/próximo/a tiempo) | ✅ |
| PQRS | Gestión interna y radicación pública sin cuenta | ✅ |
| Módulo IA | Resumen y clasificación de documentos con Gemini | ✅ |
| Reportes | Gráficas y tabla de vencimientos con filtros | ✅ |
| Admin — Usuarios | CRUD con activar/desactivar, filtros por rol y estado | ✅ |
| Admin — Backups | Generar y restaurar copias en Google Drive | ✅ |
| Admin — Auditoría | Log de acciones con IP, detalle y exportar CSV (Ley 1581) | ✅ |
| Consulta pública | Búsqueda de procesos sin cuenta por radicado/nombre/tipo | ✅ |
| Configuración | Cambio de nombre y contraseña desde el perfil | ✅ |
| Accesibilidad | Widget con fuente, contraste, dislexia, daltonismo, lector | ✅ |
| Sesión expirando | Aviso 5 min antes con opción de extender sesión | ✅ |
| Ayuda | Centro de ayuda con descripción de cada módulo | ✅ |



*SIGJEP — SENA Programación de Software 223104 — 2026*