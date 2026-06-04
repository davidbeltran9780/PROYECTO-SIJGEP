from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from database import get_db
from auth_utils import obtener_usuario_actual, requiere_rol
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class CasoCreate(BaseModel):
    tipo: str
    titulo: str
    descripcion: Optional[str] = None
    prioridad: Optional[str] = "media"
    fecha_vencimiento: Optional[str] = None
    id_abogado_asignado: Optional[int] = None


class CasoUpdate(BaseModel):
    estado: Optional[str] = None
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    prioridad: Optional[str] = None
    fecha_vencimiento: Optional[str] = None
    id_abogado_asignado: Optional[int] = None


# GET — listar (admin/secretaria ven todos, abogado solo los suyos)
@router.get("/casos")
def get_casos(
    db=Depends(get_db),
    usuario: dict = Depends(requiere_rol("administrador", "admin", "secretaria", "abogado"))
):
    es_abogado = usuario.get("rol") == "abogado"

    if es_abogado:
        resultado = db.execute(
            text("""
                SELECT c.*, u.nombre AS creador, a.nombre AS abogado_nombre
                FROM casos c
                JOIN usuarios u ON c.id_usuario_creador = u.id_usuarios
                LEFT JOIN usuarios a ON c.id_abogado_asignado = a.id_usuarios
                WHERE c.id_abogado_asignado = :mi_id
                ORDER BY c.fecha_radicacion DESC
            """),
            {"mi_id": int(usuario["sub"])}
        ).fetchall()
    else:
        resultado = db.execute(text("""
            SELECT c.*, u.nombre AS creador, a.nombre AS abogado_nombre
            FROM casos c
            JOIN usuarios u ON c.id_usuario_creador = u.id_usuarios
            LEFT JOIN usuarios a ON c.id_abogado_asignado = a.id_usuarios
            ORDER BY c.fecha_radicacion DESC
        """)).fetchall()

    return [dict(fila._mapping) for fila in resultado]


# GET por id
@router.get("/casos/{id}")
def get_caso(
    id: int,
    db=Depends(get_db),
    usuario: dict = Depends(requiere_rol("administrador", "admin", "secretaria", "abogado"))
):
    es_abogado = usuario.get("rol") == "abogado"

    resultado = db.execute(
        text("""
            SELECT c.*, u.nombre AS creador, a.nombre AS abogado_nombre
            FROM casos c
            JOIN usuarios u ON c.id_usuario_creador = u.id_usuarios
            LEFT JOIN usuarios a ON c.id_abogado_asignado = a.id_usuarios
            WHERE c.id_caso = :id
        """),
        {"id": id}
    ).fetchone()

    if not resultado:
        raise HTTPException(status_code=404, detail="Caso no encontrado")

    resultado = dict(resultado._mapping)

    # Abogado solo puede ver casos asignados a él
    if es_abogado and resultado.get("id_abogado_asignado") != int(usuario["sub"]):
        raise HTTPException(status_code=403, detail="No tienes acceso a este caso")

    return resultado


# POST — crear (admin, secretaria)
@router.post("/casos")
def crear_caso(
    datos: CasoCreate,
    db=Depends(get_db),
    usuario: dict = Depends(requiere_rol("administrador", "admin", "secretaria"))
):
    tipos_validos = ["tutela", "demanda", "pqrs", "derecho_peticion", "otro"]
    if datos.tipo.lower() not in tipos_validos:
        raise HTTPException(status_code=400, detail=f"Tipo invalido. Validos: {tipos_validos}")

    result = db.execute(
        text("""
            INSERT INTO casos (tipo, titulo, descripcion, prioridad, fecha_radicacion,
                               fecha_vencimiento, id_usuario_creador, id_abogado_asignado, estado)
            VALUES (:tipo, :titulo, :descripcion, :prioridad, CURDATE(),
                    :fecha_vencimiento, :id_creador, :id_abogado, 'activo')
        """),
        {
            "tipo": datos.tipo.lower(),
            "titulo": datos.titulo,
            "descripcion": datos.descripcion,
            "prioridad": datos.prioridad or "media",
            "fecha_vencimiento": datos.fecha_vencimiento or None,
            "id_creador": int(usuario["sub"]),
            "id_abogado": datos.id_abogado_asignado,
        }
    )
    db.commit()
    return {"status": "Caso creado", "id_caso": result.lastrowid}


# PUT — editar (admin, secretaria, abogado)
@router.put("/casos/{id}")
def editar_caso(
    id: int,
    datos: CasoUpdate,
    db=Depends(get_db),
    usuario: dict = Depends(requiere_rol("administrador", "admin", "secretaria", "abogado"))
):
    campos = []
    valores = {"id": id}

    if datos.estado:
        campos.append("estado = :estado")
        valores["estado"] = datos.estado
    if datos.titulo:
        campos.append("titulo = :titulo")
        valores["titulo"] = datos.titulo
    if datos.descripcion is not None:
        campos.append("descripcion = :descripcion")
        valores["descripcion"] = datos.descripcion
    if datos.prioridad:
        campos.append("prioridad = :prioridad")
        valores["prioridad"] = datos.prioridad
    if datos.fecha_vencimiento:
        campos.append("fecha_vencimiento = :fecha_vencimiento")
        valores["fecha_vencimiento"] = datos.fecha_vencimiento
    if datos.id_abogado_asignado is not None:
        campos.append("id_abogado_asignado = :id_abogado")
        valores["id_abogado"] = datos.id_abogado_asignado

    if not campos:
        raise HTTPException(status_code=400, detail="No hay campos para actualizar")

    query = f"UPDATE casos SET {', '.join(campos)} WHERE id_caso = :id"
    db.execute(text(query), valores)
    db.commit()
    return {"status": "Caso actualizado"}


# PATCH — cambiar estado del caso (solo admin y secretaria)
@router.patch("/casos/{id}/estado")
def cambiar_estado_caso(
    id: int,
    datos: dict,
    db=Depends(get_db),
    usuario: dict = Depends(requiere_rol("administrador", "admin", "secretaria"))
):
    estados_validos = ["activo", "en_proceso", "cerrado", "archivado"]
    nuevo_estado = datos.get("estado")
    if nuevo_estado not in estados_validos:
        raise HTTPException(status_code=400, detail=f"Estado inválido. Válidos: {estados_validos}")
    db.execute(
        text("UPDATE casos SET estado = :estado WHERE id_caso = :id"),
        {"estado": nuevo_estado, "id": id}
    )
    db.commit()
    return {"status": "Estado actualizado", "nuevo_estado": nuevo_estado}


# DELETE — solo admin
@router.delete("/casos/{id}")
def eliminar_caso(
    id: int,
    db=Depends(get_db),
    usuario: dict = Depends(requiere_rol("administrador", "admin"))
):
    db.execute(text("DELETE FROM casos WHERE id_caso = :id"), {"id": id})
    db.commit()
    return {"status": "Caso eliminado"}
