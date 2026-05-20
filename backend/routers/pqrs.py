from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from datetime import datetime
import random

from database import get_db
from models.pqrs import PQRS
from auth_utils import obtener_usuario_actual, requiere_rol

router = APIRouter()


class PQRSCreate(BaseModel):
    nombre_ciudadano: str
    correo: str
    tipo: str
    descripcion: str


# POST — crear PQRS (ciudadano o cualquier logueado)
@router.post("/pqrs")
def crear_pqrs(data: PQRSCreate, db: Session = Depends(get_db)):
    tipo = data.tipo.lower()
    tipos_validos = ["peticion", "queja", "reclamo", "sugerencia", "derecho_peticion"]

    if tipo not in tipos_validos:
        raise HTTPException(status_code=400, detail=f"Tipo invalido. Validos: {tipos_validos}")

    numero_radicado = f"PQRS-{datetime.now().strftime('%Y%m%d%H%M%S')}-{random.randint(100,999)}"

    nueva_pqrs = PQRS(
        numero_radicado=numero_radicado,
        nombre_ciudadano=data.nombre_ciudadano,
        correo=data.correo,
        tipo=tipo,
        descripcion=data.descripcion,
        estado="recibido",
        id_caso=None
    )

    db.add(nueva_pqrs)
    db.commit()
    db.refresh(nueva_pqrs)

    return {
        "msg": "PQRS registrada correctamente",
        "numero_radicado": nueva_pqrs.numero_radicado
    }


# GET — listar todas (admin, auxiliar, abogado)
@router.get("/pqrs")
def listar_pqrs(
    db: Session = Depends(get_db),
    usuario: dict = Depends(requiere_rol("administrador", "admin", "auxiliar", "abogado"))
):
    return db.query(PQRS).order_by(PQRS.id_pqrs.desc()).all()


# GET — ciudadano logueado ve solo las suyas (por correo del JWT)
@router.get("/pqrs/mis-pqrs")
def mis_pqrs(
    db: Session = Depends(get_db),
    usuario: dict = Depends(obtener_usuario_actual)
):
    email = usuario.get("email")
    resultado = db.execute(
        text("""
            SELECT id_pqrs, numero_radicado, tipo, descripcion, estado, fecha_creacion
            FROM pqrs
            WHERE correo = :correo
            ORDER BY fecha_creacion DESC
        """),
        {"correo": email}
    ).fetchall()
    return [dict(fila._mapping) for fila in resultado]


# GET — consulta publica por radicado (SIN login)
@router.get("/pqrs/consultar/{numero_radicado}")
def consultar_por_radicado(numero_radicado: str, db: Session = Depends(get_db)):
    resultado = db.execute(
        text("""
            SELECT numero_radicado, tipo, estado, fecha_creacion
            FROM pqrs
            WHERE numero_radicado = :radicado
        """),
        {"radicado": numero_radicado}
    ).fetchone()

    if not resultado:
        raise HTTPException(status_code=404, detail="Radicado no encontrado")

    return dict(resultado._mapping)
