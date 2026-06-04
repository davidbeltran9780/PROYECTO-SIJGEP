from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from models.user import User
from pydantic import BaseModel
import bcrypt
import secrets
import smtplib
import os
from datetime import datetime, timedelta
from email.message import EmailMessage
from dotenv import load_dotenv
from auth_utils import crear_token

load_dotenv()

router = APIRouter()

class UserCreate(BaseModel):
    nombre: str
    email: str
    password: str
    rol: str

class UserLogin(BaseModel):
    email: str
    password: str

class RecuperarPassword(BaseModel):
    email: str


class ResetPassword(BaseModel):
    token: str
    password: str


def enviar_correo_recuperacion(destinatario: str, token: str):
    frontend_url = "http://localhost:5173/reset-password"
    link = f"{frontend_url}?token={token}"

    msg = EmailMessage()
    msg["Subject"] = "Recuperación de contraseña - SIGJEP"
    msg["From"] = os.getenv("MAIL_FROM")
    msg["To"] = destinatario
    msg.set_content(f"""
Hola,

Solicitaste recuperar tu contraseña en SIGJEP.

Haz clic en este enlace para cambiarla:
{link}

Este enlace vence en 30 minutos.

Si no solicitaste este cambio, ignora este mensaje.
""")

    with smtplib.SMTP(os.getenv("MAIL_SERVER"), int(os.getenv("MAIL_PORT"))) as smtp:
        smtp.starttls()
        smtp.login(os.getenv("MAIL_USERNAME"), os.getenv("MAIL_PASSWORD"))
        smtp.send_message(msg)


# REGISTRO
@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):

    usuario_existente = db.query(User).filter(User.email == user.email).first()
    if usuario_existente:
         raise HTTPException(status_code=409, detail="El usuario ya existe, incie sesion")

    password_hash = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt()).decode()

    nuevo_usuario = User(
        nombre=user.nombre,
        email=user.email,
        password=password_hash,
        rol=user.rol.lower(),  
        estado="activo"
    )

    db.add(nuevo_usuario)
    db.commit()

    return {"msg": "Usuario registrado correctamente"}


# LOGIN — devuelve JWT
@router.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):

    usuario = db.query(User).filter(User.email == data.email).first()

    if not usuario:
        raise HTTPException(status_code=401, detail="Usuario no existe")

    if not bcrypt.checkpw(data.password.encode(), usuario.password.encode()):
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")

    if usuario.estado != 'activo':
        raise HTTPException(status_code=403, detail="Tu cuenta está desactivada. Contacta al administrador.")

    token = crear_token({
        "sub": str(usuario.id_usuarios),
        "email": usuario.email,
        "rol": usuario.rol,
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "id_usuarios": usuario.id_usuarios,
        "nombre": usuario.nombre,
        "email": usuario.email,
        "rol": usuario.rol,
    }

# SOLICITAR LA RECUPERACION

@router.post("/recuperar-password")
def recuperar_password(data: RecuperarPassword, db: Session = Depends(get_db)):

    usuario = db.query(User).filter(User.email == data.email).first()

    if not usuario:
        return {"msg": "Si el correo existe, se enviará un enlace de recuperación"}

    token = secrets.token_urlsafe(32)
    fecha_expiracion = datetime.now() + timedelta(minutes=30)

    db.execute(
        text("""
            INSERT INTO password_reset_tokens (id_usuario, token, fecha_expiracion)
            VALUES (:id_usuario, :token, :fecha_expiracion)
        """),
        {
            "id_usuario": usuario.id_usuarios,
            "token": token,
            "fecha_expiracion": fecha_expiracion
        }
    )

    db.commit()

    enviar_correo_recuperacion(usuario.email, token)

    return {"msg": "Se envió un enlace de recuperación al correo"}


# CAMBIAR LA CONTRASEÑA

@router.post("/reset-password")
def reset_password(data: ResetPassword, db: Session = Depends(get_db)):

    resultado = db.execute(
        text("""
            SELECT id, id_usuario, usado, fecha_expiracion
            FROM password_reset_tokens
            WHERE token = :token
            LIMIT 1
        """),
        {"token": data.token}
    ).mappings().first()

    if not resultado:
        return {"error": "Token inválido"}

    if resultado["usado"]:
        return {"error": "Este token ya fue usado"}

    if resultado["fecha_expiracion"] < datetime.now():
        return {"error": "El token expiró"}

    nuevo_hash = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode()

    db.execute(
        text("""
            UPDATE usuarios
            SET password = :password
            WHERE id_usuarios = :id_usuario
        """),
        {
            "password": nuevo_hash,
            "id_usuario": resultado["id_usuario"]
        }
    )

    db.execute(
        text("""
            UPDATE password_reset_tokens
            SET usado = TRUE
            WHERE id = :id
        """),
        {"id": resultado["id"]}
    )

    db.commit()

    return {"msg": "Contraseña actualizada correctamente"}

@router.get("/prueba-auth")
def prueba_auth():
    return {"msg": "auth actualizado"}