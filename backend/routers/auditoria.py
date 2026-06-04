from fastapi import APIRouter, Depends
from sqlalchemy import text
from database import get_db
from auth_utils import requiere_rol

router = APIRouter(
    prefix="/auditoria",
    tags=["Auditoria"]
)


@router.get("/")
def listar_auditoria(
    db=Depends(get_db),
    usuario: dict = Depends(requiere_rol("administrador", "admin"))
):
    """Ultimos 200 registros de auditoria."""
    resultado = db.execute(text("""
        SELECT id_auditoria, fecha, nombre_usuario, rol, accion,
               tabla_afectada, id_registro, detalle
        FROM auditoria
        ORDER BY fecha DESC
        LIMIT 200
    """)).fetchall()
    return [dict(fila._mapping) for fila in resultado]
