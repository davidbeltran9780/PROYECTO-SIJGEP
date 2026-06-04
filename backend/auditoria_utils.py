from sqlalchemy import text


def registrar_auditoria(db, usuario: dict, accion: str, tabla: str, id_registro, detalle: str = None):
    """Registra una accion en la tabla auditoria.
    Llamar desde cualquier router despues de un CRUD exitoso.

    Ejemplo:
        registrar_auditoria(db, usuario, "CREAR", "casos", nuevo_id, "Caso tipo tutela")
    """
    db.execute(
        text("""
            INSERT INTO auditoria (id_usuario, nombre_usuario, rol, accion, tabla_afectada, id_registro, detalle)
            VALUES (:id_usuario, :nombre, :rol, :accion, :tabla, :id_registro, :detalle)
        """),
        {
            "id_usuario": int(usuario.get("sub", 0)),
            "nombre": usuario.get("nombre", usuario.get("email", "sistema")),
            "rol": usuario.get("rol", "desconocido"),
            "accion": accion.upper(),
            "tabla": tabla,
            "id_registro": str(id_registro),
            "detalle": detalle,
        }
    )
    db.commit()
