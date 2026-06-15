from sqlalchemy import text


def registrar_auditoria(db, usuario: dict, accion: str, tabla: str, id_registro,
                        detalle: str = None, ip: str = None, resultado: str = "exitoso"):
    """Registra una accion en la tabla auditoria conforme a Ley 1581 de 2012.

    Campos:
        ip        — dirección IP del cliente (trazabilidad de acceso)
        resultado — 'exitoso' | 'fallido'
        detalle   — descripción del cambio realizado
    """
    db.execute(
        text("""
            INSERT INTO auditoria
                (id_usuario, nombre_usuario, rol, accion, tabla_afectada,
                 id_registro, detalle, ip_address, resultado)
            VALUES
                (:id_usuario, :nombre, :rol, :accion, :tabla,
                 :id_registro, :detalle, :ip, :resultado)
        """),
        {
            "id_usuario": int(usuario.get("sub", 0)),
            "nombre":     usuario.get("nombre", usuario.get("email", "sistema")),
            "rol":        usuario.get("rol", "desconocido"),
            "accion":     accion.upper(),
            "tabla":      tabla,
            "id_registro": str(id_registro),
            "detalle":    detalle,
            "ip":         ip,
            "resultado":  resultado,
        }
    )
    db.commit()
