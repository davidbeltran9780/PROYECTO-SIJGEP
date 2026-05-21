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
    casos_cerrados = db.execute(text("SELECT COUNT(*) AS total FROM casos WHERE estado IN ('cerrado', 'archivado')")).scalar()
    total_expedientes = db.execute(text("SELECT COUNT(*) AS total FROM expedientes")).scalar()
    total_documentos = db.execute(text("SELECT COUNT(*) AS total FROM documentos")).scalar()
    total_pqrs = db.execute(text("SELECT COUNT(*) AS total FROM pqrs")).scalar()
    total_usuarios = db.execute(text("SELECT COUNT(*) AS total FROM usuarios WHERE estado = 'activo'")).scalar()

    return {
        "total_casos": total_casos,
        "casos_cerrados": casos_cerrados,
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


@router.get("/notificaciones")
def notificaciones(
    db=Depends(get_db),
    usuario: dict = Depends(requiere_rol("administrador", "admin", "secretaria", "abogado"))
):
    """Notificaciones reales para la campana — filtra por rol."""
    rol = usuario.get("rol")
    mi_id = int(usuario["sub"])
    notifs = []

    # Casos próximos a vencer o ya vencidos (7 días)
    if rol in ("administrador", "admin", "secretaria"):
        casos = db.execute(text("""
            SELECT titulo, DATEDIFF(fecha_vencimiento, CURDATE()) AS dias
            FROM casos
            WHERE fecha_vencimiento IS NOT NULL
              AND estado NOT IN ('cerrado', 'archivado')
              AND fecha_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
            ORDER BY fecha_vencimiento ASC
            LIMIT 10
        """)).fetchall()
    else:
        casos = db.execute(text("""
            SELECT titulo, DATEDIFF(fecha_vencimiento, CURDATE()) AS dias
            FROM casos
            WHERE fecha_vencimiento IS NOT NULL
              AND estado NOT IN ('cerrado', 'archivado')
              AND fecha_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
              AND id_abogado_asignado = :mi_id
            ORDER BY fecha_vencimiento ASC
            LIMIT 10
        """), {"mi_id": mi_id}).fetchall()

    for c in casos:
        dias = c._mapping["dias"]
        titulo = c._mapping["titulo"]
        if dias is not None and dias < 0:
            notifs.append({"tipo": "urgente", "icono": "🔴",
                           "titulo": "Caso vencido",
                           "desc": f'"{titulo}" venció hace {abs(dias)} día(s)'})
        elif dias == 0:
            notifs.append({"tipo": "urgente", "icono": "🔴",
                           "titulo": "Vence hoy",
                           "desc": f'"{titulo}" vence hoy'})
        else:
            notifs.append({"tipo": "aviso", "icono": "⚠️",
                           "titulo": f"Vence en {dias} día(s)",
                           "desc": f'"{titulo}"'})

    # PQRS sin responder (solo admin y secretaria)
    if rol in ("administrador", "admin", "secretaria"):
        pendientes = db.execute(text("""
            SELECT COUNT(*) FROM pqrs
            WHERE respuesta IS NULL OR respuesta = ''
        """)).scalar()
        if pendientes and pendientes > 0:
            notifs.append({"tipo": "info", "icono": "💬",
                           "titulo": "PQRS sin responder",
                           "desc": f"{pendientes} PQRS pendiente(s) de respuesta"})

    return {"total": len(notifs), "items": notifs}


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
