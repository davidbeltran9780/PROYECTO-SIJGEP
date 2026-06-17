import os
import jwt
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
EXPIRACION_MINUTOS = 180

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY no esta definido en .env")

bearer_scheme = HTTPBearer()


def crear_token(payload: dict, expires_min: int = EXPIRACION_MINUTOS) -> str:
    data = payload.copy()
    ahora = datetime.now(timezone.utc)
    data.update({"exp": ahora + timedelta(minutes=expires_min), "iat": ahora})
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)


def decodificar_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, detail="Token expirado, vuelve a iniciar sesion")
    except jwt.InvalidTokenError:
        raise HTTPException(401, detail="Token invalido")


def obtener_usuario_actual(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """Devuelve el payload del JWT: id_usuarios, email, rol."""
    return decodificar_token(credentials.credentials)


def requiere_rol(*roles_permitidos: str):
    """Dependencia para restringir endpoints por rol."""
    def verificador(usuario: dict = Depends(obtener_usuario_actual)) -> dict:
        if usuario.get("rol") not in roles_permitidos:
            raise HTTPException(403, detail="No tienes permiso para esta operacion")
        return usuario
    return verificador