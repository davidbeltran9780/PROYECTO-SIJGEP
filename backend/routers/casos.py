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


# GET — listar todos (admin, auxiliar, abogado)
@router.get("/casos")
def get_casos(
    db=Depends(get_db),
    usuario: dict = Depends(requiere_rol("administrador", "admin", "auxiliar", "abogado"))
):
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
    usuario: dict = Depends(requiere_rol("administrador", "admin", "auxiliar", "abogado"))
):
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
    return dict(resultado._mapping)


# POST — crear (admin, auxiliar)
@router.post("/casos")
def crear_caso(
    datos: CasoCreate,
    db=Depends(get_db),
    usuario: dict = Depends(requiere_rol("administrador", "admin", "auxiliar"))
):
    tipos_validos = ["tutela", "demanda", "pqrs", "derecho_peticion", "otro"]
    if datos.tipo.lower() not in tipos_validos:
        raise HTTPException(status_code=400, detail=f"Tipo invalido. Validos: {tipos_validos}")

    db.execute(
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
            "fecha_vencimiento": datos.fecha_vencimiento,
            "id_creador": int(usuario["sub"]),
            "id_abogado": datos.id_abogado_asignado,
        }
    )
    db.commit()
    return {"status": "Caso creado"}


# PUT — editar (admin, auxiliar, abogado)
@router.put("/casos/{id}")
def editar_caso(
    id: int,
    datos: CasoUpdate,
    db=Depends(get_db),
    usuario: dict = Depends(requiere_rol("administrador", "admin", "auxiliar", "abogado"))
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
