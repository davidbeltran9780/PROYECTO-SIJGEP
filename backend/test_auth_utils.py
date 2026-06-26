"""
Pruebas unitarias para backend/auth_utils.py
Modulo del sistema SIGJEP - RF-10 Gestion de usuarios y roles (RBAC)

Tecnica aplicada: error adivinado (token invalido/expirado) + cobertura de
decision (caja blanca) sobre crear_token, decodificar_token y requiere_rol.
"""
import time
from datetime import timedelta
import jwt
import pytest
from fastapi import HTTPException

from auth_utils import crear_token, decodificar_token, requiere_rol, SECRET_KEY, ALGORITHM


# ---------------------------------------------------------------------------
# GRUPO 1: crear_token()
# ---------------------------------------------------------------------------

def test_crear_token_devuelve_string_no_vacio():
    token = crear_token({"sub": "1", "email": "abogado@sigjep.com", "rol": "abogado"})
    assert isinstance(token, str)
    assert len(token) > 0


def test_token_contiene_los_datos_del_payload():
    token = crear_token({"sub": "5", "email": "auxiliar@sigjep.com", "rol": "auxiliar"})
    datos = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    assert datos["sub"] == "5"
    assert datos["email"] == "auxiliar@sigjep.com"
    assert datos["rol"] == "auxiliar"


def test_token_incluye_fecha_expiracion_y_emision():
    """El token debe incluir 'exp' (expiracion) y 'iat' (emision), requeridos por JWT."""
    token = crear_token({"sub": "1", "email": "a@sigjep.com", "rol": "admin"})
    datos = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    assert "exp" in datos
    assert "iat" in datos
    assert datos["exp"] > datos["iat"]


# ---------------------------------------------------------------------------
# GRUPO 2: decodificar_token() -- caja blanca, cubre las 3 ramas (try / except / except)
# ---------------------------------------------------------------------------

def test_decodificar_token_valido_devuelve_payload_correcto():
    token = crear_token({"sub": "2", "email": "ciudadano@sigjep.com", "rol": "ciudadano"})
    datos = decodificar_token(token)
    assert datos["rol"] == "ciudadano"


def test_decodificar_token_expirado_lanza_401():
    """Rama 2 del try/except: token cuya fecha de expiracion ya paso."""
    token = crear_token({"sub": "1", "email": "x@sigjep.com", "rol": "admin"}, expires_min=-1)
    with pytest.raises(HTTPException) as exc_info:
        decodificar_token(token)
    assert exc_info.value.status_code == 401
    assert "expirado" in exc_info.value.detail.lower()


def test_decodificar_token_invalido_lanza_401():
    """Rama 3 del try/except: cadena que no es un JWT valido en absoluto."""
    with pytest.raises(HTTPException) as exc_info:
        decodificar_token("esto-no-es-un-token-jwt-valido")
    assert exc_info.value.status_code == 401
    assert "invalido" in exc_info.value.detail.lower()


def test_decodificar_token_firmado_con_otra_clave_es_rechazado():
    """Error adivinado: un token firmado con una clave secreta distinta debe rechazarse."""
    token_falso = jwt.encode({"sub": "99", "rol": "admin"}, "clave-incorrecta", algorithm=ALGORITHM)
    with pytest.raises(HTTPException) as exc_info:
        decodificar_token(token_falso)
    assert exc_info.value.status_code == 401


# ---------------------------------------------------------------------------
# GRUPO 3: requiere_rol() -- particion de equivalencia: rol permitido vs no permitido
# ---------------------------------------------------------------------------

def test_requiere_rol_permite_rol_autorizado():
    verificador = requiere_rol("admin", "abogado")
    resultado = verificador(usuario={"rol": "admin"})
    assert resultado["rol"] == "admin"


def test_requiere_rol_rechaza_rol_no_autorizado():
    verificador = requiere_rol("admin")
    with pytest.raises(HTTPException) as exc_info:
        verificador(usuario={"rol": "ciudadano"})
    assert exc_info.value.status_code == 403


def test_requiere_rol_acepta_multiples_roles_validos():
    """Particion de equivalencia: 'auxiliar' y 'abogado' ambos deben pasar si estan en la lista."""
    verificador = requiere_rol("abogado", "auxiliar")
    assert verificador(usuario={"rol": "abogado"})["rol"] == "abogado"
    assert verificador(usuario={"rol": "auxiliar"})["rol"] == "auxiliar"
