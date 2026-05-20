from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy import text
from database import get_db
from auth_utils import obtener_usuario_actual, requiere_rol
from pathlib import Path
import shutil

router = APIRouter()

UPLOAD_DIR = Path("uploads")


# GET — listar documentos de un expediente
@router.get("/documentos/expediente/{id_expediente}")
def get_documentos_por_expediente(
    id_expediente: int,
    db=Depends(get_db),
    usuario: dict = Depends(requiere_rol("administrador", "admin", "secretaria", "abogado"))
):
    resultado = db.execute(
        text("""
            SELECT d.*, u.nombre AS subido_por_nombre
            FROM documentos d
            JOIN usuarios u ON d.subido_por = u.id_usuarios
            WHERE d.id_expediente = :id_exp
            ORDER BY d.fecha_subida DESC
        """),
        {"id_exp": id_expediente}
    ).fetchall()
    return [dict(fila._mapping) for fila in resultado]


# GET — un documento por id
@router.get("/documentos/{id}")
def get_documento(
    id: int,
    db=Depends(get_db),
    usuario: dict = Depends(requiere_rol("administrador", "admin", "secretaria", "abogado"))
):
    resultado = db.execute(
        text("""
            SELECT d.*, u.nombre AS subido_por_nombre
            FROM documentos d
            JOIN usuarios u ON d.subido_por = u.id_usuarios
            WHERE d.id_documento = :id
        """),
        {"id": id}
    ).fetchone()
    if not resultado:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    return dict(resultado._mapping)


# POST — subir documento a un expediente
@router.post("/documentos/subir")
async def subir_documento(
    id_expediente: int,
    archivo: UploadFile = File(...),
    db=Depends(get_db),
    usuario: dict = Depends(requiere_rol("administrador", "admin", "secretaria", "abogado"))
):
    # Validar formato
    extensiones_validas = [".pdf", ".docx", ".doc", ".jpg", ".jpeg", ".png"]
    extension = Path(archivo.filename).suffix.lower()
    if extension not in extensiones_validas:
        raise HTTPException(status_code=400, detail=f"Formato {extension} no soportado. Validos: {extensiones_validas}")

    # Validar tamano (10 MB max)
    contenido = await archivo.read()
    if len(contenido) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Archivo excede 10 MB")

    # Guardar archivo
    UPLOAD_DIR.mkdir(exist_ok=True)
    nombre_guardado = f"{id_expediente}_{archivo.filename}"
    ruta_archivo = UPLOAD_DIR / nombre_guardado

    with open(ruta_archivo, "wb") as f:
        f.write(contenido)

    # Guardar en BD
    db.execute(
        text("""
            INSERT INTO documentos (id_expediente, nombre_archivo, tipo_formato, ruta, subido_por)
            VALUES (:id_exp, :nombre, :tipo, :ruta, :subido_por)
        """),
        {
            "id_exp": id_expediente,
            "nombre": archivo.filename,
            "tipo": extension.replace(".", ""),
            "ruta": str(ruta_archivo),
            "subido_por": int(usuario["sub"]),
        }
    )
    db.commit()
    return {"status": "Documento subido", "archivo": archivo.filename}


# DELETE — borrar documento (dueno o admin)
@router.delete("/documentos/{id}")
def borrar_documento(
    id: int,
    db=Depends(get_db),
    usuario: dict = Depends(requiere_rol("administrador", "admin", "secretaria", "abogado"))
):
    # Buscar documento
    doc = db.execute(
        text("SELECT id_documento, subido_por, ruta FROM documentos WHERE id_documento = :id"),
        {"id": id}
    ).fetchone()

    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")

    doc = dict(doc._mapping)
    es_admin = usuario.get("rol") in ("administrador", "admin")
    es_dueno = str(doc["subido_por"]) == usuario["sub"]

    if not es_admin and not es_dueno:
        raise HTTPException(status_code=403, detail="Solo puedes borrar tus propios archivos")

    # Borrar archivo fisico si existe
    ruta = Path(doc["ruta"])
    if ruta.exists():
        ruta.unlink()

    # Borrar de BD
    db.execute(text("DELETE FROM documentos WHERE id_documento = :id"), {"id": id})
    db.commit()
    return {"status": "Documento eliminado"}
