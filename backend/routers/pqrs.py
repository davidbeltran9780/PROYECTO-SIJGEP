from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from datetime import datetime, timedelta
import random
import smtplib
import os
from email.message import EmailMessage
from dotenv import load_dotenv

from database import get_db
from models.pqrs import PQRS
from auth_utils import obtener_usuario_actual, requiere_rol

load_dotenv()

router = APIRouter()

# Almacén en memoria para códigos de verificación: { email: { code, expires } }
_codigos_verificacion: dict = {}


def _enviar_correo(destinatario: str, asunto: str, cuerpo: str):
    msg = EmailMessage()
    msg["Subject"] = asunto
    msg["From"] = os.getenv("MAIL_FROM")
    msg["To"] = destinatario
    msg.set_content(cuerpo)
    with smtplib.SMTP(os.getenv("MAIL_SERVER"), int(os.getenv("MAIL_PORT"))) as smtp:
        smtp.starttls()
        smtp.login(os.getenv("MAIL_USERNAME"), os.getenv("MAIL_PASSWORD"))
        smtp.send_message(msg)


class PQRSCreate(BaseModel):
    nombre_ciudadano: str
    correo: str
    tipo: str
    descripcion: str


class VerificarCorreo(BaseModel):
    correo: str


class ConfirmarCodigo(BaseModel):
    correo: str
    codigo: str


# POST — enviar código de verificación al correo (para PQRS anónimas)
@router.post("/pqrs/verificar-correo")
def verificar_correo(data: VerificarCorreo):
    codigo = str(random.randint(100000, 999999))
    _codigos_verificacion[data.correo.lower()] = {
        "code": codigo,
        "expires": datetime.now() + timedelta(minutes=10)
    }
    try:
        _enviar_correo(
            data.correo,
            "Código de verificación — SIGJEP",
            f"""
Hola,

Para radicar tu solicitud anónima en SIGJEP, ingresa el siguiente código:

  {codigo}

Este código vence en 10 minutos.

Si no solicitaste esto, ignora este mensaje.
"""
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"No se pudo enviar el correo de verificación: {e}")
    return {"msg": "Código enviado al correo"}


# POST — confirmar código de verificación
@router.post("/pqrs/confirmar-codigo")
def confirmar_codigo(data: ConfirmarCodigo):
    entrada = _codigos_verificacion.get(data.correo.lower())
    if not entrada:
        return {"valido": False, "detalle": "No se encontró un código para este correo"}
    if datetime.now() > entrada["expires"]:
        del _codigos_verificacion[data.correo.lower()]
        return {"valido": False, "detalle": "El código expiró, solicita uno nuevo"}
    if entrada["code"] != data.codigo.strip():
        return {"valido": False, "detalle": "Código incorrecto"}
    del _codigos_verificacion[data.correo.lower()]
    return {"valido": True}


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

    try:
        _enviar_correo(
            data.correo,
            f"PQRS radicada correctamente — {nueva_pqrs.numero_radicado}",
            f"""
Hola{' ' + data.nombre_ciudadano if data.nombre_ciudadano != 'Anónimo' else ''},

Tu solicitud ha sido radicada exitosamente en SIGJEP.

  Número de radicado: {nueva_pqrs.numero_radicado}
  Tipo: {data.tipo.upper()}
  Fecha: {datetime.now().strftime('%d/%m/%Y %H:%M')}

Guarda este número para consultar el estado de tu solicitud en cualquier momento.

De conformidad con la Ley 1755 de 2015, la entidad tiene hasta 15 días hábiles para dar respuesta.

Este es un mensaje automático, no respondas a este correo.
"""
        )
    except Exception as e:
        print(f"No se pudo enviar correo de confirmación PQRS: {e}")

    return {
        "msg": "PQRS registrada correctamente",
        "numero_radicado": nueva_pqrs.numero_radicado
    }


# GET — listar PQRS (admin/secretaria ven todas, abogado solo las de sus casos)
@router.get("/pqrs")
def listar_pqrs(
    db: Session = Depends(get_db),
    usuario: dict = Depends(requiere_rol("administrador", "admin", "secretaria", "abogado"))
):
    es_abogado = usuario.get("rol") == "abogado"

    if es_abogado:
        resultado = db.execute(
            text("""
                SELECT p.id_pqrs, p.numero_radicado, p.nombre_ciudadano, p.correo,
                       p.tipo, p.descripcion, p.estado, p.id_caso,
                       p.fecha_creacion, p.respuesta
                FROM pqrs p
                JOIN casos c ON p.id_caso = c.id_caso
                WHERE c.id_abogado_asignado = :mi_id
                ORDER BY p.id_pqrs DESC
            """),
            {"mi_id": int(usuario["sub"])}
        ).fetchall()
        return [dict(fila._mapping) for fila in resultado]

    # Admin y secretaria — todo con SQL directo para incluir todos los campos
    resultado = db.execute(text("""
        SELECT id_pqrs, numero_radicado, nombre_ciudadano, correo,
               tipo, descripcion, estado, id_caso,
               fecha_creacion, respuesta
        FROM pqrs
        ORDER BY id_pqrs DESC
    """)).fetchall()
    return [dict(fila._mapping) for fila in resultado]


# GET — ciudadano logueado ve solo las suyas (por correo del JWT)
@router.get("/pqrs/mis-pqrs")
def mis_pqrs(
    db: Session = Depends(get_db),
    usuario: dict = Depends(obtener_usuario_actual)
):
    email = usuario.get("email")
    resultado = db.execute(
        text("""
            SELECT id_pqrs, numero_radicado, tipo, descripcion,
                   estado, fecha_creacion, respuesta
            FROM pqrs
            WHERE correo = :correo
            ORDER BY fecha_creacion DESC
        """),
        {"correo": email}
    ).fetchall()
    return [dict(fila._mapping) for fila in resultado]


# PATCH — cambiar estado de una PQRS (solo admin y secretaria)
@router.patch("/pqrs/{id}/estado")
def cambiar_estado_pqrs(
    id: int,
    datos: dict,
    db: Session = Depends(get_db),
    usuario: dict = Depends(requiere_rol("administrador", "admin", "secretaria"))
):
    estados_validos = ["recibido", "en_proceso", "respondido", "cerrado"]
    nuevo_estado = datos.get("estado")
    if nuevo_estado not in estados_validos:
        raise HTTPException(status_code=400, detail=f"Estado inválido. Válidos: {estados_validos}")
    db.execute(
        text("UPDATE pqrs SET estado = :estado WHERE id_pqrs = :id"),
        {"estado": nuevo_estado, "id": id}
    )
    db.commit()
    return {"status": "Estado actualizado", "nuevo_estado": nuevo_estado}


# PATCH — guardar respuesta de una PQRS (solo admin y secretaria)
@router.patch("/pqrs/{id}/respuesta")
def guardar_respuesta_pqrs(
    id: int,
    datos: dict,
    db: Session = Depends(get_db),
    usuario: dict = Depends(requiere_rol("administrador", "admin", "secretaria"))
):
    respuesta = datos.get("respuesta", "").strip()
    if not respuesta:
        raise HTTPException(status_code=400, detail="La respuesta no puede estar vacía")
    db.execute(
        text("UPDATE pqrs SET respuesta = :respuesta WHERE id_pqrs = :id"),
        {"respuesta": respuesta, "id": id}
    )
    db.commit()
    return {"status": "Respuesta guardada correctamente"}


# PUT — asignar PQRS a un caso existente (solo admin y secretaria)
@router.put("/pqrs/{id}/caso")
def asignar_caso_pqrs(
    id: int,
    datos: dict,
    db: Session = Depends(get_db),
    usuario: dict = Depends(requiere_rol("administrador", "admin", "secretaria"))
):
    id_caso = datos.get("id_caso")
    db.execute(
        text("UPDATE pqrs SET id_caso = :id_caso WHERE id_pqrs = :id"),
        {"id_caso": id_caso, "id": id}
    )
    db.commit()
    return {"status": "Caso asignado correctamente"}


# POST — enviar respuesta oficial por correo al ciudadano
@router.post("/pqrs/{id}/enviar-respuesta")
def enviar_respuesta_correo(
    id: int,
    datos: dict,
    db: Session = Depends(get_db),
    usuario: dict = Depends(requiere_rol("administrador", "admin", "secretaria"))
):
    respuesta = datos.get("respuesta", "").strip()
    if not respuesta:
        raise HTTPException(status_code=400, detail="La respuesta no puede estar vacía")

    # Guardar respuesta y cambiar estado
    db.execute(
        text("UPDATE pqrs SET respuesta = :respuesta, estado = 'respondido' WHERE id_pqrs = :id"),
        {"respuesta": respuesta, "id": id}
    )
    db.commit()

    # Obtener datos del ciudadano
    fila = db.execute(
        text("SELECT numero_radicado, nombre_ciudadano, correo, tipo FROM pqrs WHERE id_pqrs = :id"),
        {"id": id}
    ).fetchone()

    if not fila:
        raise HTTPException(status_code=404, detail="PQRS no encontrada")

    try:
        _enviar_correo(
            fila.correo,
            f"Respuesta a su solicitud {fila.numero_radicado} — SIGJEP",
            f"""
Estimado(a) {fila.nombre_ciudadano},

Su solicitud de {fila.tipo.upper()} radicada bajo el número {fila.numero_radicado} ha sido resuelta.

━━━ RESPUESTA OFICIAL ━━━

{respuesta}

━━━━━━━━━━━━━━━━━━━━━━━

Si tiene alguna inquietud adicional, puede radicar una nueva solicitud o consultar el estado en el portal SIGJEP.

Atentamente,
Alcaldía Municipal — SIGJEP
"""
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Respuesta guardada, pero no se pudo enviar el correo: {e}")

    return {"msg": "Respuesta enviada correctamente al ciudadano"}


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
