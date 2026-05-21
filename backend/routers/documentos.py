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

    # Guardar archivo en subcarpeta por expediente
    carpeta_expediente = UPLOAD_DIR / f"expediente_{id_expediente}"
    carpeta_expediente.mkdir(parents=True, exist_ok=True)

    # Si ya existe un archivo con ese nombre, agregar sufijo para no sobreescribir
    ruta_archivo = carpeta_expediente / archivo.filename
    if ruta_archivo.exists():
        from datetime import datetime
        sufijo = datetime.now().strftime("%Y%m%d%H%M%S")
        nombre_guardado = f"{Path(archivo.filename).stem}_{sufijo}{extension}"
        ruta_archivo = carpeta_expediente / nombre_guardado
    else:
        nombre_guardado = archivo.filename

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
            "nombre": nombre_guardado,
            "tipo": extension.replace(".", ""),
            "ruta": str(ruta_archivo),
            "subido_por": int(usuario["sub"]),
        }
    )
    db.commit()
    return {"status": "Documento subido", "archivo": nombre_guardado}


# PATCH — enviar documento (cambia estado de borrador a enviado)
@router.patch("/documentos/{id}/enviar")
def enviar_documento(
    id: int,
    db=Depends(get_db),
    usuario: dict = Depends(requiere_rol("administrador", "admin", "secretaria", "abogado"))
):
    doc = db.execute(
        text("SELECT id_documento, subido_por, estado FROM documentos WHERE id_documento = :id"),
        {"id": id}
    ).fetchone()

    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")

    doc = dict(doc._mapping)

    if doc["estado"] == "enviado":
        raise HTTPException(status_code=400, detail="El documento ya fue enviado")

    es_admin = usuario.get("rol") in ("administrador", "admin")
    es_dueno = str(doc["subido_por"]) == usuario["sub"]

    if not es_admin and not es_dueno:
        raise HTTPException(status_code=403, detail="Solo puedes enviar tus propios documentos")

    db.execute(
        text("UPDATE documentos SET estado = 'enviado' WHERE id_documento = :id"),
        {"id": id}
    )
    db.commit()
    return {"status": "Documento enviado correctamente"}


# DELETE — borrar documento (dueno o admin, con restriccion si esta enviado)
@router.delete("/documentos/{id}")
def borrar_documento(
    id: int,
    db=Depends(get_db),
    usuario: dict = Depends(requiere_rol("administrador", "admin", "secretaria", "abogado"))
):
    # Buscar documento
    doc = db.execute(
        text("SELECT id_documento, subido_por, ruta, estado FROM documentos WHERE id_documento = :id"),
        {"id": id}
    ).fetchone()

    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")

    doc = dict(doc._mapping)
    es_admin = usuario.get("rol") in ("administrador", "admin")
    es_dueno = str(doc["subido_por"]) == usuario["sub"]

    # Si ya fue enviado, solo admin puede borrar
    if doc["estado"] == "enviado" and not es_admin:
        raise HTTPException(status_code=403, detail="Este documento ya fue enviado. Solo un administrador puede eliminarlo")

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
