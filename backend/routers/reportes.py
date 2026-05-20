from fastapi import APIRouter, Depends
from sqlalchemy import text
from database import get_db
from auth_utils import requiere_rol

router = APIRouter(
    prefix="/reportes",
    tags=["Reportes"]
)


# Solo admin ve reportes
def solo_admin():
    return requiere_rol("administrador", "admin")


@router.get("/estadisticas")
def estadisticas_generales(db=Depends(get_db), usuario: dict = Depends(solo_admin())):
    """Dashboard principal: totales generales."""
    total_casos = db.execute(text("SELECT COUNT(*) AS total FROM casos")).scalar()
    total_expedientes = db.execute(text("SELECT COUNT(*) AS total FROM expedientes")).scalar()
    total_documentos = db.execute(text("SELECT COUNT(*) AS total FROM documentos")).scalar()
    total_pqrs = db.execute(text("SELECT COUNT(*) AS total FROM pqrs")).scalar()
    total_usuarios = db.execute(text("SELECT COUNT(*) AS total FROM usuarios WHERE estado = 'activo'")).scalar()

    return {
        "total_casos": total_casos,
        "total_expedientes": total_expedientes,
        "total_documentos": total_documentos,
        "total_pqrs": total_pqrs,
        "total_usuarios": total_usuarios,
    }


@router.get("/casos-por-tipo")
def casos_por_tipo(db=Depends(get_db), usuario: dict = Depends(solo_admin())):
    """Para grafica de torta/barras: cantidad de casos por tipo."""
    resultado = db.execute(text("""
        SELECT tipo, COUNT(*) AS cantidad
        FROM casos
        GROUP BY tipo
        ORDER BY cantidad DESC
    """)).fetchall()
    return [dict(fila._mapping) for fila in resultado]


@router.get("/casos-por-estado")
def casos_por_estado(db=Depends(get_db), usuario: dict = Depends(solo_admin())):
    """Para grafica de barras: cantidad de casos por estado."""
    resultado = db.execute(text("""
        SELECT estado, COUNT(*) AS cantidad
        FROM casos
        GROUP BY estado
        ORDER BY cantidad DESC
    """)).fetchall()
    return [dict(fila._mapping) for fila in resultado]


@router.get("/casos-por-mes")
def casos_por_mes(db=Depends(get_db), usuario: dict = Depends(solo_admin())):
    """Para grafica de linea: casos creados por mes (ultimos 12 meses)."""
    resultado = db.execute(text("""
        SELECT DATE_FORMAT(fecha_radicacion, '%Y-%m') AS mes, COUNT(*) AS cantidad
        FROM casos
        WHERE fecha_radicacion >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        GROUP BY mes
        ORDER BY mes ASC
    """)).fetchall()
    return [dict(fila._mapping) for fila in resultado]


@router.get("/pqrs-por-estado")
def pqrs_por_estado(db=Depends(get_db), usuario: dict = Depends(solo_admin())):
    """Estado de las PQRS para seguimiento."""
    resultado = db.execute(text("""
        SELECT estado, COUNT(*) AS cantidad
        FROM pqrs
        GROUP BY estado
        ORDER BY cantidad DESC
    """)).fetchall()
    return [dict(fila._mapping) for fila in resultado]


@router.get("/carga-por-abogado")
def carga_por_abogado(db=Depends(get_db), usuario: dict = Depends(solo_admin())):
    """Casos asignados a cada abogado (para medir carga de trabajo)."""
    resultado = db.execute(text("""
        SELECT u.nombre, COUNT(c.id_caso) AS casos_asignados
        FROM usuarios u
        LEFT JOIN casos c ON u.id_usuarios = c.id_abogado_asignado
        WHERE u.rol IN ('abogado')
        GROUP BY u.id_usuarios, u.nombre
        ORDER BY casos_asignados DESC
    """)).fetchall()
    return [dict(fila._mapping) for fila in resultado]


@router.get("/vencimientos")
def casos_proximos_vencer(db=Depends(get_db), usuario: dict = Depends(solo_admin())):
    """Casos que vencen en los proximos 7 dias."""
    resultado = db.execute(text("""
        SELECT id_caso, titulo, tipo, estado, fecha_vencimiento,
               DATEDIFF(fecha_vencimiento, CURDATE()) AS dias_restantes
        FROM casos
        WHERE fecha_vencimiento IS NOT NULL
          AND estado NOT IN ('cerrado', 'archivado')
          AND fecha_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
        ORDER BY fecha_vencimiento ASC
    """)).fetchall()
    return [dict(fila._mapping) for fila in resultado]
