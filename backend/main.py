from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from pathlib import Path
from routers import auditoria

# Routers
from routers import auth, usuarios, casos, expedientes, documentos, ia, reportes, backups
from routers import pqrs
from routers import consulta

# Crear carpeta uploads/ al arrancar
@asynccontextmanager
async def lifespan(app: FastAPI):
    Path("uploads").mkdir(parents=True, exist_ok=True)
    print("✅ Carpeta uploads/ lista")
    yield

app = FastAPI(
    title="SIGJEP API",
    description="Sistema Inteligente de Gestión Jurídica para Entidades Públicas",
    version="1.0.0",
    lifespan=lifespan
)

# CORS — permite que el frontend se conecte
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:5501",
        "http://127.0.0.1:5501",
        "http://localhost:3000",
        "http://localhost:5173",   
        "http://127.0.0.1:5173",   
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir archivos subidos
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Conectar routers
app.include_router(auth.router,        tags=["Auth"])
app.include_router(usuarios.router,    tags=["Usuarios"])
app.include_router(casos.router,       tags=["Casos"])
app.include_router(expedientes.router, tags=["Expedientes"])
app.include_router(documentos.router,  tags=["Documentos"])
app.include_router(ia.router,          tags=["IA"])
app.include_router(reportes.router,    tags=["Reportes"])
app.include_router(backups.router,     tags=["Backups"])
app.include_router(pqrs.router, tags=["PQRS"])
app.include_router(auditoria.router, tags=["Auditoria"])
app.include_router(consulta.router, tags=["Consulta Pública"])

# Ruta de prueba
@app.get("/")
def inicio():
    return {"status": "SIGJEP API funcionando ✅"}

# ─────────────────────────────────────────
# PRUEBA — ejecutar con: python main.py
# ─────────────────────────────────────────
# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)