"""
Pruebas unitarias para la logica de backend/routers/usuarios.py
Modulo del sistema SIGJEP - RF-10 Gestion de usuarios y roles (RBAC)

Tecnica aplicada: dobles de prueba (mocks) para aislar la logica de negocio
de la base de datos real, manteniendo el caracter unitario de la prueba.
La base de datos se simula con unittest.mock; en ningun momento se conecta
a MySQL.
"""
from unittest.mock import MagicMock, call
import bcrypt
import pytest
from usuarios_logica import crear_usuario_logica, editar_usuario_logica


# ---------------------------------------------------------------------------
# GRUPO 1: crear_usuario_logica()
# ---------------------------------------------------------------------------

def test_crear_usuario_hashea_la_contrasena_antes_de_guardar():
    """La contraseña nunca debe enviarse en texto plano a la base de datos."""
    db_mock = MagicMock()
    db_mock.execute.return_value.scalar.return_value = 7
    auditoria_mock = MagicMock()

    datos = {"nombre": "Carlos Lopez", "email": "carlos@sigjep.com", "password": "Clave123*", "rol": "abogado"}
    crear_usuario_logica(datos, db_mock, auditoria_mock, usuario_actual={"sub": "1", "rol": "administrador"})

    primera_llamada = db_mock.execute.call_args_list[0]
    params_insert = primera_llamada[0][1]
    assert params_insert["password"] != "Clave123*"
    assert bcrypt.checkpw("Clave123*".encode(), params_insert["password"].encode())


def test_crear_usuario_llama_a_commit():
    """Toda operacion de escritura debe confirmarse con commit()."""
    db_mock = MagicMock()
    db_mock.execute.return_value.scalar.return_value = 1
    auditoria_mock = MagicMock()

    datos = {"nombre": "Ana Ruiz", "email": "ana@sigjep.com", "password": "Segura456*", "rol": "auxiliar"}
    crear_usuario_logica(datos, db_mock, auditoria_mock, usuario_actual={"sub": "1", "rol": "administrador"})

    db_mock.commit.assert_called_once()


def test_crear_usuario_registra_auditoria_con_datos_correctos():
    """Conforme a la Ley 1581, toda creacion de usuario debe quedar en auditoria."""
    db_mock = MagicMock()
    db_mock.execute.return_value.scalar.return_value = 42
    auditoria_mock = MagicMock()

    datos = {"nombre": "Luis Gomez", "email": "luis@sigjep.com", "password": "Pass789*", "rol": "ciudadano"}
    crear_usuario_logica(datos, db_mock, auditoria_mock, usuario_actual={"sub": "1", "rol": "administrador"}, ip="192.168.1.10")

    auditoria_mock.assert_called_once()
    args, kwargs = auditoria_mock.call_args
    assert args[2] == "CREAR"
    assert args[3] == "usuarios"
    assert args[4] == 42
    assert "Luis Gomez" in kwargs["detalle"]
    assert kwargs["ip"] == "192.168.1.10"


def test_crear_usuario_devuelve_mensaje_de_exito():
    db_mock = MagicMock()
    db_mock.execute.return_value.scalar.return_value = 1
    auditoria_mock = MagicMock()
    datos = {"nombre": "Test User", "email": "t@sigjep.com", "password": "Clave000*", "rol": "abogado"}
    resultado = crear_usuario_logica(datos, db_mock, auditoria_mock, usuario_actual={"sub": "1", "rol": "administrador"})
    assert resultado == {"status": "Usuario creado"}


# ---------------------------------------------------------------------------
# GRUPO 2: editar_usuario_logica() -- particion de equivalencia: con/sin cambios
# ---------------------------------------------------------------------------

def test_editar_usuario_detecta_cambio_de_rol():
    """Caja blanca: cubre la rama donde el rol anterior es diferente al nuevo."""
    db_mock = MagicMock()
    fila_anterior = MagicMock(nombre="Pedro Diaz", rol="auxiliar")
    db_mock.execute.return_value.fetchone.return_value = fila_anterior
    auditoria_mock = MagicMock()

    editar_usuario_logica(
        10, {"nombre": "Pedro Diaz", "rol": "abogado"}, db_mock, auditoria_mock,
        usuario_actual={"sub": "1", "rol": "administrador"}
    )

    _, kwargs = auditoria_mock.call_args
    assert "rol: 'auxiliar' -> 'abogado'" in kwargs["detalle"]


def test_editar_usuario_sin_cambios_reales_lo_indica_en_detalle():
    """Caja blanca: cubre la rama donde nombre y rol son iguales a los anteriores."""
    db_mock = MagicMock()
    fila_anterior = MagicMock(nombre="Sofia Vargas", rol="abogado")
    db_mock.execute.return_value.fetchone.return_value = fila_anterior
    auditoria_mock = MagicMock()

    editar_usuario_logica(
        11, {"nombre": "Sofia Vargas", "rol": "abogado"}, db_mock, auditoria_mock,
        usuario_actual={"sub": "1", "rol": "administrador"}
    )

    _, kwargs = auditoria_mock.call_args
    assert kwargs["detalle"] == "Sin cambios detectados"


def test_editar_usuario_id_inexistente_no_genera_detalle_de_cambios():
    """Error adivinado: si fetchone() devuelve None (id no existe), no debe lanzar excepcion."""
    db_mock = MagicMock()
    db_mock.execute.return_value.fetchone.return_value = None
    auditoria_mock = MagicMock()

    resultado = editar_usuario_logica(
        999, {"nombre": "Nadie", "rol": "abogado"}, db_mock, auditoria_mock,
        usuario_actual={"sub": "1", "rol": "administrador"}
    )
    assert resultado == {"status": "Usuario actualizado"}
