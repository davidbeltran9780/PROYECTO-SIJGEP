import csv
import io
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy import text
from database import get_db
from auth_utils import requiere_rol

router = APIRouter(
    prefix="/auditoria",
    tags=["Auditoria"]
)

QUERY_BASE = """
    SELECT id_auditoria, fecha, nombre_usuario, rol, accion,
           tabla_afectada, id_registro, detalle, ip_address, resultado
    FROM auditoria
    ORDER BY fecha DESC
    LIMIT 500
"""


@router.get("/")
def listar_auditoria(
    db=Depends(get_db),
    usuario: dict = Depends(requiere_rol("administrador", "admin"))
):
    resultado = db.execute(text(QUERY_BASE)).fetchall()
    return [dict(fila._mapping) for fila in resultado]


@router.get("/exportar")
def exportar_auditoria_csv(
    db=Depends(get_db),
    usuario: dict = Depends(requiere_rol("administrador", "admin"))
):
    """Exporta el log de auditoría como archivo CSV (Ley 1581 — evidencia auditable)."""
    filas = db.execute(text(QUERY_BASE)).fetchall()

    output = io.StringIO()
    writer = csv.writer(output, delimiter=';')
    writer.writerow(["ID", "Fecha y Hora", "Usuario", "Rol", "Accion",
                     "Tabla afectada", "ID Registro", "Detalle", "IP", "Resultado"])
    for f in filas:
        r = dict(f._mapping)
        writer.writerow([
            r["id_auditoria"],
            str(r["fecha"]),
            r["nombre_usuario"],
            r["rol"],
            r["accion"],
            r["tabla_afectada"],
            r["id_registro"],
            r["detalle"] or "",
            r["ip_address"] or "",
            r["resultado"] or "exitoso",
        ])

    # BOM UTF-8 para que Excel abra tildes correctamente
    contenido = "﻿" + output.getvalue()

    return StreamingResponse(
        iter([contenido.encode("utf-8")]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=auditoria_sijgep.csv"}
    )
