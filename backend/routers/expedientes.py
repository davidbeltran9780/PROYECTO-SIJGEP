from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from database import get_db
from auth_utils import obtener_usuario_actual, requiere_rol

router = APIRouter()


# GET — listar (admin/secretaria ven todos, abogado solo los suyos)
@router.get("/expedientes")
def get_expedientes(
    db=Depends(get_db),
    usuario: dict = Depends(requiere_rol("administrador", "admin", "secretaria", "abogado"))
):
    es_abogado = usuario.get("rol") == "abogado"

    if es_abogado:
        resultado = db.execute(
            text("""
                SELECT e.*, c.tipo, c.titulo, c.estado AS estado_caso,
                       c.id_abogado_asignado, c.fecha_vencimiento,
                       a.nombre AS abogado_nombre
                FROM expedientes e
                JOIN casos c ON e.id_caso = c.id_caso
                LEFT JOIN usuarios a ON c.id_abogado_asignado = a.id_usuarios
                WHERE c.id_abogado_asignado = :mi_id
                ORDER BY e.fecha_creacion DESC
            """),
            {"mi_id": int(usuario["sub"])}
        ).fetchall()
    else:
        resultado = db.execute(text("""
            SELECT e.*, c.tipo, c.titulo, c.estado AS estado_caso,
                   c.id_abogado_asignado, c.fecha_vencimiento,
                   a.nombre AS abogado_nombre
            FROM expedientes e
            JOIN casos c ON e.id_caso = c.id_caso
            LEFT JOIN usuarios a ON c.id_abogado_asignado = a.id_usuarios
            ORDER BY e.fecha_creacion DESC
        """)).fetchall()

    return [dict(fila._mapping) for fila in resultado]


# GET por id
@router.get("/expedientes/{id}")
def get_expediente(
    id: int,
    db=Depends(get_db),
    usuario: dict = Depends(requiere_rol("administrador", "admin", "secretaria", "abogado"))
):
    es_abogado = usuario.get("rol") == "abogado"

    resultado = db.execute(
        text("""
            SELECT e.*, c.tipo, c.titulo, c.estado AS estado_caso,
                   c.id_abogado_asignado, c.fecha_vencimiento,
                   a.nombre AS abogado_nombre
            FROM expedientes e
            JOIN casos c ON e.id_caso = c.id_caso
            LEFT JOIN usuarios a ON c.id_abogado_asignado = a.id_usuarios
            WHERE e.id_expediente = :id
        """),
        {"id": id}
    ).fetchone()

    if not resultado:
        raise HTTPException(status_code=404, detail="Expediente no encontrado")

    resultado = dict(resultado._mapping)

    # Abogado solo puede ver expedientes asignados a él
    if es_abogado and resultado.get("id_abogado_asignado") != int(usuario["sub"]):
        raise HTTPException(status_code=403, detail="No tienes acceso a este expediente")

    return resultado


# POST — crear (solo admin y secretaria)
@router.post("/expedientes")
def crear_expediente(
    datos: dict,
    db=Depends(get_db),
    usuario: dict = Depends(requiere_rol("administrador", "admin", "secretaria"))
):
    db.execute(
        text("INSERT INTO expedientes (id_caso, fecha_creacion) VALUES (:id_caso, NOW())"),
        {"id_caso": datos["id_caso"]}
    )
    db.commit()
    return {"status": "Expediente creado"}


# PUT — editar (admin, secretaria, abogado)
@router.put("/expedientes/{id}")
def editar_expediente(
    id: int,
    datos: dict,
    db=Depends(get_db),
    usuario: dict = Depends(requiere_rol("administrador", "admin", "secretaria", "abogado"))
):
    db.execute(
        text("UPDATE expedientes SET id_caso = :id_caso WHERE id_expediente = :id"),
        {"id_caso": datos["id_caso"], "id": id}
    )
    db.commit()
    return {"status": "Expediente actualizado"}


# DELETE — solo admin
@router.delete("/expedientes/{id}")
def eliminar_expediente(
    id: int,
    db=Depends(get_db),
    usuario: dict = Depends(requiere_rol("administrador", "admin"))
):
    db.execute(
        text("DELETE FROM expedientes WHERE id_expediente = :id"),
        {"id": id}
    )
    db.commit()
    return {"status": "Expediente eliminado"}
