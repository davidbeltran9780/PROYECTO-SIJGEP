from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from database import get_db
from auth_utils import requiere_rol
from auditoria_utils import registrar_auditoria
import bcrypt

router = APIRouter()


def solo_admin():
    return requiere_rol("administrador", "admin")


# GET — listar todos
@router.get("/usuarios")
def get_usuarios(db=Depends(get_db), usuario: dict = Depends(solo_admin())):
    resultado = db.execute(
        text("SELECT id_usuarios, nombre, email, rol, estado FROM usuarios")
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


# POST — crear usuario (con bcrypt)
@router.post("/usuarios")
def crear_usuario(datos: dict, db=Depends(get_db), usuario: dict = Depends(solo_admin())):
    password_hash = bcrypt.hashpw(datos["password"].encode(), bcrypt.gensalt()).decode()
    db.execute(
        text("""
            INSERT INTO usuarios (nombre, email, password, rol, estado)
            VALUES (:nombre, :email, :password, :rol, 'activo')
        """),
        {
            "nombre": datos["nombre"],
            "email": datos["email"],
            "password": password_hash,
            "rol": datos["rol"]
        }
    )
    db.commit()
    registrar_auditoria(db, usuario, "CREAR", "usuarios", datos["email"], f"Nuevo usuario: {datos['nombre']}")
    return {"status": "Usuario creado"}
# En crear_usuario, después del db.commit():



# PUT — editar
@router.put("/usuarios/{id}")
def editar_usuario(id: int, datos: dict, db=Depends(get_db), usuario: dict = Depends(solo_admin())):
    db.execute(
        text("UPDATE usuarios SET nombre = :nombre, rol = :rol WHERE id_usuarios = :id"),
        {"nombre": datos["nombre"], "rol": datos["rol"], "id": id}
    )
    db.commit()
    registrar_auditoria(db, usuario, "EDITAR", "usuarios", id)
    return {"status": "Usuario actualizado"}




# DELETE — eliminar
@router.delete("/usuarios/{id}")
def eliminar_usuario(id: int, db=Depends(get_db), usuario: dict = Depends(solo_admin())):
    db.execute(
        text("DELETE FROM usuarios WHERE id_usuarios = :id"),
        {"id": id}
    )
    db.commit()
    registrar_auditoria(db, usuario, "BORRAR", "usuarios", id)
    return {"status": "Usuario eliminado"}


# PATCH — desactivar
@router.patch("/usuarios/{id}/desactivar")
def desactivar_usuario(id: int, db=Depends(get_db), usuario: dict = Depends(solo_admin())):
    db.execute(
        text("UPDATE usuarios SET estado = 'inactivo' WHERE id_usuarios = :id"),
        {"id": id}
    )
    db.commit()
    return {"status": "Usuario desactivado"}


# PATCH — activar
@router.patch("/usuarios/{id}/activar")
def activar_usuario(id: int, db=Depends(get_db), usuario: dict = Depends(solo_admin())):
    db.execute(
        text("UPDATE usuarios SET estado = 'activo' WHERE id_usuarios = :id"),
        {"id": id}
    )
    db.commit()
    return {"status": "Usuario activado"}


# GET — listar abogados (para selects de asignación)
@router.get("/abogados")
def get_abogados(
    db=Depends(get_db),
    usuario: dict = Depends(requiere_rol("administrador", "admin", "secretaria"))
):
    resultado = db.execute(
        text("SELECT id_usuarios, nombre, email, estado FROM usuarios WHERE rol = 'abogado' ORDER BY nombre")
    ).fetchall()
    return [dict(fila._mapping) for fila in resultado]
