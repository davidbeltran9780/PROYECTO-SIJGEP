from fastapi import APIRouter, Depends
from sqlalchemy import text
from datetime import date
from database import get_db
from auth_utils import requiere_rol
from fechas_utils import agregar_dias_habiles

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
    resultado = db.execute(text("""
        SELECT estado, COUNT(*) AS cantidad
        FROM pqrs
        GROUP BY estado
        ORDER BY cantidad DESC
    """)).fetchall()
    return [dict(fila._mapping) for fila in resultado]


@router.get("/pqrs-por-tipo")
def pqrs_por_tipo(db=Depends(get_db), usuario: dict = Depends(solo_admin())):
    resultado = db.execute(text("""
        SELECT tipo, COUNT(*) AS cantidad
        FROM pqrs
        GROUP BY tipo
        ORDER BY cantidad DESC
    """)).fetchall()
    return [dict(fila._mapping) for fila in resultado]


@router.get("/pqrs-alertas")
def pqrs_alertas(
    db=Depends(get_db),
    usuario: dict = Depends(requiere_rol("administrador", "admin", "secretaria"))
):
    """PQRS pendientes con plazo legal real: 15 días hábiles excluyendo fines de semana y festivos colombianos."""
    filas = db.execute(text("""
        SELECT id_pqrs, numero_radicado, tipo, nombre_ciudadano, correo, estado, fecha_creacion
        FROM pqrs
        WHERE estado NOT IN ('respondido', 'cerrado')
        ORDER BY fecha_creacion ASC
    """)).fetchall()

    hoy = date.today()
    resultado = []
    for f in filas:
        fila = dict(f._mapping)
        fecha_creacion = fila["fecha_creacion"]
        if hasattr(fecha_creacion, "date"):
            fecha_creacion = fecha_creacion.date()
        elif isinstance(fecha_creacion, str):
            fecha_creacion = date.fromisoformat(fecha_creacion[:10])

        fecha_limite = agregar_dias_habiles(fecha_creacion, 15)
        dias_restantes = (fecha_limite - hoy).days

        fila["fecha_limite"] = fecha_limite.isoformat()
        fila["dias_restantes"] = dias_restantes
        resultado.append(fila)

    resultado.sort(key=lambda x: x["dias_restantes"])
    return resultado


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

    # PQRS próximas a vencer su plazo legal (solo admin y secretaria)
    if rol in ("administrador", "admin", "secretaria"):
        pqrs_pendientes = db.execute(text("""
            SELECT numero_radicado, fecha_creacion
            FROM pqrs
            WHERE estado NOT IN ('respondido', 'cerrado')
            ORDER BY fecha_creacion ASC
        """)).fetchall()
        hoy = date.today()
        for p in pqrs_pendientes:
            fc = p._mapping["fecha_creacion"]
            if hasattr(fc, "date"):
                fc = fc.date()
            elif isinstance(fc, str):
                fc = date.fromisoformat(fc[:10])
            fecha_limite = agregar_dias_habiles(fc, 15)
            dias = (fecha_limite - hoy).days
            if dias > 5:
                continue
            radicado = p._mapping["numero_radicado"]
            if dias < 0:
                notifs.append({"tipo": "urgente", "icono": "🔴",
                               "titulo": "PQRS vencida",
                               "desc": f"{radicado} — venció hace {abs(dias)} día(s)"})
            elif dias == 0:
                notifs.append({"tipo": "urgente", "icono": "🔴",
                               "titulo": "PQRS vence hoy",
                               "desc": f"{radicado} — plazo legal se agota hoy"})
            else:
                notifs.append({"tipo": "aviso", "icono": "💬",
                               "titulo": f"PQRS vence en {dias} día(s)",
                               "desc": f"{radicado} — pendiente de respuesta"})

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
