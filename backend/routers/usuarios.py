from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import text
from database import get_db
from auth_utils import requiere_rol
from auditoria_utils import registrar_auditoria
import bcrypt

router = APIRouter()


def solo_admin():
    return requiere_rol("administrador", "admin")


def get_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "127.0.0.1"


# GET — listar todos
@router.get("/usuarios")
def get_usuarios(db=Depends(get_db), usuario: dict = Depends(solo_admin())):
    resultado = db.execute(
        text("SELECT id_usuarios, nombre, email, rol, estado FROM usuarios ORDER BY id_usuarios DESC")
    ).fetchall()
    return [dict(fila._mapping) for fila in resultado]


# GET — uno por id
@router.get("/usuarios/{id}")
def get_usuario(id: int, db=Depends(get_db), usuario: dict = Depends(solo_admin())):
    resultado = db.execute(
        text("SELECT id_usuarios, nombre, email, rol, estado FROM usuarios WHERE id_usuarios = :id"),
        {"id": id}
    ).fetchone()
    if not resultado:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return dict(resultado._mapping)


# POST — crear usuario
@router.post("/usuarios")
def crear_usuario(datos: dict, request: Request, db=Depends(get_db), usuario: dict = Depends(solo_admin())):
    password_hash = bcrypt.hashpw(datos["password"].encode(), bcrypt.gensalt()).decode()
    db.execute(
        text("""
            INSERT INTO usuarios (nombre, email, password, rol, estado)
            VALUES (:nombre, :email, :password, :rol, 'activo')
        """),
        {
            "nombre":   datos["nombre"],
            "email":    datos["email"],
            "password": password_hash,
            "rol":      datos["rol"]
        }
    )
    nuevo_id = db.execute(text("SELECT LAST_INSERT_ID()")).scalar()
    db.commit()
    registrar_auditoria(
        db, usuario, "CREAR", "usuarios", nuevo_id,
        detalle=f"Nuevo usuario: {datos['nombre']} | email: {datos['email']} | rol: {datos['rol']}",
        ip=get_ip(request)
    )
    return {"status": "Usuario creado"}


# PUT — editar
@router.put("/usuarios/{id}")
def editar_usuario(id: int, datos: dict, request: Request, db=Depends(get_db), usuario: dict = Depends(solo_admin())):
    anterior = db.execute(
        text("SELECT nombre, rol FROM usuarios WHERE id_usuarios = :id"), {"id": id}
    ).fetchone()
    db.execute(
        text("UPDATE usuarios SET nombre = :nombre, rol = :rol WHERE id_usuarios = :id"),
        {"nombre": datos["nombre"], "rol": datos["rol"], "id": id}
    )
    db.commit()
    detalle = ""
    if anterior:
        cambios = []
        if anterior.nombre != datos["nombre"]:
            cambios.append(f"nombre: '{anterior.nombre}' → '{datos['nombre']}'")
        if anterior.rol != datos["rol"]:
            cambios.append(f"rol: '{anterior.rol}' → '{datos['rol']}'")
        detalle = " | ".join(cambios) if cambios else "Sin cambios detectados"
    registrar_auditoria(
        db, usuario, "EDITAR", "usuarios", id,
        detalle=detalle, ip=get_ip(request)
    )
    return {"status": "Usuario actualizado"}


# DELETE — eliminar
@router.delete("/usuarios/{id}")
def eliminar_usuario(id: int, request: Request, db=Depends(get_db), usuario: dict = Depends(solo_admin())):
    anterior = db.execute(
        text("SELECT nombre, email, rol FROM usuarios WHERE id_usuarios = :id"), {"id": id}
    ).fetchone()
    if not anterior:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    # Desasignar casos antes de eliminar
    db.execute(text("UPDATE casos SET id_abogado_asignado = NULL WHERE id_abogado_asignado = :id"), {"id": id})
    db.execute(text("DELETE FROM usuarios WHERE id_usuarios = :id"), {"id": id})
    db.commit()
    detalle = f"Usuario eliminado: {anterior.nombre} | {anterior.email} | {anterior.rol}"
    registrar_auditoria(
        db, usuario, "BORRAR", "usuarios", id,
        detalle=detalle, ip=get_ip(request)
    )
    return {"status": "Usuario eliminado"}


# PATCH — desactivar
@router.patch("/usuarios/{id}/desactivar")
def desactivar_usuario(id: int, request: Request, db=Depends(get_db), usuario: dict = Depends(solo_admin())):
    db.execute(text("UPDATE usuarios SET estado = 'inactivo' WHERE id_usuarios = :id"), {"id": id})
    db.commit()
    registrar_auditoria(
        db, usuario, "EDITAR", "usuarios", id,
        detalle="Estado cambiado: activo → inactivo", ip=get_ip(request)
    )
    return {"status": "Usuario desactivado"}


# PATCH — activar
@router.patch("/usuarios/{id}/activar")
def activar_usuario(id: int, request: Request, db=Depends(get_db), usuario: dict = Depends(solo_admin())):
    db.execute(text("UPDATE usuarios SET estado = 'activo' WHERE id_usuarios = :id"), {"id": id})
    db.commit()
    registrar_auditoria(
        db, usuario, "EDITAR", "usuarios", id,
        detalle="Estado cambiado: inactivo → activo", ip=get_ip(request)
    )
    return {"status": "Usuario activado"}


# GET — listar abogados
@router.get("/abogados")
def get_abogados(
    db=Depends(get_db),
    usuario: dict = Depends(requiere_rol("administrador", "admin", "secretaria"))
):
    resultado = db.execute(
        text("SELECT id_usuarios, nombre, email, estado FROM usuarios WHERE rol = 'abogado' ORDER BY nombre")
    ).fetchall()
    return [dict(fila._mapping) for fila in resultado]
