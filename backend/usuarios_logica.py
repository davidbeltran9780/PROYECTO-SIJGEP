"""
Extracto aislado de la logica de negocio real de backend/routers/usuarios.py
(funciones crear_usuario y editar_usuario), reescrito sin las dependencias de
FastAPI (Depends, Request) para poder probarlo de forma unitaria inyectando
un objeto de base de datos simulado (mock), en lugar de una conexion MySQL real.

La logica de negocio (hash de contraseña, deteccion de cambios, llamada a
auditoria) es exactamente la misma que existe en el archivo original del
repositorio sdionisio4T/PROYECTO-SIJGEPia.
"""
import bcrypt


def crear_usuario_logica(datos: dict, db, registrar_auditoria_fn, usuario_actual: dict, ip: str = "127.0.0.1"):
    password_hash = bcrypt.hashpw(datos["password"].encode(), bcrypt.gensalt()).decode()
    db.execute(
        "INSERT INTO usuarios (nombre, email, password, rol, estado) VALUES (?, ?, ?, ?, 'activo')",
        {"nombre": datos["nombre"], "email": datos["email"], "password": password_hash, "rol": datos["rol"]}
    )
    nuevo_id = db.execute("SELECT LAST_INSERT_ID()").scalar()
    db.commit()
    registrar_auditoria_fn(
        db, usuario_actual, "CREAR", "usuarios", nuevo_id,
        detalle=f"Nuevo usuario: {datos['nombre']} | email: {datos['email']} | rol: {datos['rol']}",
        ip=ip
    )
    return {"status": "Usuario creado"}


def editar_usuario_logica(id: int, datos: dict, db, registrar_auditoria_fn, usuario_actual: dict, ip: str = "127.0.0.1"):
    anterior = db.execute("SELECT nombre, rol FROM usuarios WHERE id_usuarios = ?", {"id": id}).fetchone()
    db.execute(
        "UPDATE usuarios SET nombre = ?, rol = ? WHERE id_usuarios = ?",
        {"nombre": datos["nombre"], "rol": datos["rol"], "id": id}
    )
    db.commit()
    detalle = ""
    if anterior:
        cambios = []
        if anterior.nombre != datos["nombre"]:
            cambios.append(f"nombre: '{anterior.nombre}' -> '{datos['nombre']}'")
        if anterior.rol != datos["rol"]:
            cambios.append(f"rol: '{anterior.rol}' -> '{datos['rol']}'")
        detalle = " | ".join(cambios) if cambios else "Sin cambios detectados"
    registrar_auditoria_fn(
        db, usuario_actual, "EDITAR", "usuarios", id,
        detalle=detalle, ip=ip
    )
    return {"status": "Usuario actualizado"}
