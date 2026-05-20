from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from database import get_db
from auth_utils import obtener_usuario_actual, requiere_rol

router = APIRouter()


# GET — listar todos (admin, secretaria, abogado)
@router.get("/expedientes")
def get_expedientes(
    db=Depends(get_db),
    usuario: dict = Depends(requiere_rol("administrador", "admin", "secretaria", "abogado"))
):
    resultado = db.execute(text("""
        SELECT e.*, c.tipo, c.titulo, c.estado AS estado_caso
        FROM expedientes e
        JOIN casos c ON e.id_caso = c.id_caso
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
    resultado = db.execute(
        text("""
            SELECT e.*, c.tipo, c.titulo, c.estado AS estado_caso
            FROM expedientes e
            JOIN casos c ON e.id_caso = c.id_caso
            WHERE e.id_expediente = :id
        """),
        {"id": id}
    ).fetchone()
    if not resultado:
        raise HTTPException(status_code=404, detail="Expediente no encontrado")
    return dict(resultado._mapping)


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
