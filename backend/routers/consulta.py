from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import text
from database import get_db
from fastapi import Depends

router = APIRouter(
    prefix="/consulta",
    tags=["Consulta Pública"]
)


@router.get("/buscar")
def buscar_proceso(
    q: str = Query(..., min_length=1),
    modo: str = Query("radicado"),  # radicado | nombre | tipo
    db=Depends(get_db)
):
    """
    Búsqueda pública unificada — busca en casos/expedientes Y en PQRS.
    modo=radicado → por número de radicado PQRS o ID de expediente
    modo=nombre   → por nombre del demandante o ciudadano
    modo=tipo     → por tipo de proceso
    """
    resultados = []

    if modo == "radicado":
        # Buscar en PQRS por número de radicado
        pqrs = db.execute(text("""
            SELECT
                numero_radicado,
                nombre_ciudadano AS demandante,
                tipo,
                estado,
                fecha_creacion AS fecha,
                'PQRS' AS origen
            FROM pqrs
            WHERE numero_radicado = :q
        """), {"q": q.strip()}).fetchall()
        resultados += [dict(f._mapping) for f in pqrs]

        # Buscar en expedientes por ID (EXP-001 o solo el número)
        numero = q.strip().upper().replace("EXP-", "").lstrip("0") or "0"
        if numero.isdigit():
            exp = db.execute(text("""
                SELECT
                    CONCAT('EXP-', LPAD(e.id_expediente, 3, '0')) AS numero_radicado,
                    c.titulo AS demandante,
                    c.tipo,
                    c.estado,
                    e.fecha_creacion AS fecha,
                    'Expediente' AS origen
                FROM expedientes e
                JOIN casos c ON e.id_caso = c.id_caso
                WHERE e.id_expediente = :id
            """), {"id": int(numero)}).fetchall()
            resultados += [dict(f._mapping) for f in exp]

    elif modo == "nombre":
        # Buscar en PQRS por nombre del ciudadano
        pqrs = db.execute(text("""
            SELECT
                numero_radicado,
                nombre_ciudadano AS demandante,
                tipo,
                estado,
                fecha_creacion AS fecha,
                'PQRS' AS origen
            FROM pqrs
            WHERE nombre_ciudadano LIKE :q
            ORDER BY fecha_creacion DESC
            LIMIT 20
        """), {"q": f"%{q}%"}).fetchall()
        resultados += [dict(f._mapping) for f in pqrs]

        # Buscar en expedientes por titulo (demandante)
        exp = db.execute(text("""
            SELECT
                CONCAT('EXP-', LPAD(e.id_expediente, 3, '0')) AS numero_radicado,
                c.titulo AS demandante,
                c.tipo,
                c.estado,
                e.fecha_creacion AS fecha,
                'Expediente' AS origen
            FROM expedientes e
            JOIN casos c ON e.id_caso = c.id_caso
            WHERE c.titulo LIKE :q
            ORDER BY e.fecha_creacion DESC
            LIMIT 20
        """), {"q": f"%{q}%"}).fetchall()
        resultados += [dict(f._mapping) for f in exp]

    elif modo == "tipo":
        # q tiene formato "tipo|filtro" o solo "tipo"
        partes = q.strip().split("|", 1)
        tipo = partes[0].strip().lower()
        filtro = partes[1].strip() if len(partes) > 1 else ""

        tipos_validos = ["tutela", "demanda", "pqrs", "derecho_peticion",
                         "peticion", "queja", "reclamo", "sugerencia", "otro"]
        if tipo not in tipos_validos:
            raise HTTPException(status_code=400,
                detail=f"Tipo inválido. Válidos: {tipos_validos}")

        if not filtro:
            raise HTTPException(status_code=400,
                detail="Ingresa un radicado o nombre para buscar dentro del tipo seleccionado")

        pqrs = db.execute(text("""
            SELECT
                numero_radicado,
                nombre_ciudadano AS demandante,
                tipo,
                estado,
                fecha_creacion AS fecha,
                'PQRS' AS origen
            FROM pqrs
            WHERE tipo = :tipo
              AND (numero_radicado LIKE :f OR nombre_ciudadano LIKE :f)
            ORDER BY fecha_creacion DESC
            LIMIT 20
        """), {"tipo": tipo, "f": f"%{filtro}%"}).fetchall()
        resultados += [dict(f._mapping) for f in pqrs]

        exp = db.execute(text("""
            SELECT
                CONCAT('EXP-', LPAD(e.id_expediente, 3, '0')) AS numero_radicado,
                c.titulo AS demandante,
                c.tipo,
                c.estado,
                e.fecha_creacion AS fecha,
                'Expediente' AS origen
            FROM expedientes e
            JOIN casos c ON e.id_caso = c.id_caso
            WHERE c.tipo = :tipo
              AND (c.titulo LIKE :f OR CONCAT('EXP-', LPAD(e.id_expediente, 3, '0')) LIKE :f)
            ORDER BY e.fecha_creacion DESC
            LIMIT 20
        """), {"tipo": tipo, "f": f"%{filtro}%"}).fetchall()
        resultados += [dict(f._mapping) for f in exp]

    if not resultados:
        raise HTTPException(status_code=404,
            detail="No se encontraron procesos con los datos ingresados")

    return resultados


# Mantener compatibilidad con endpoints anteriores
@router.get("/radicado/{numero}")
def consultar_por_radicado(numero: str, db=Depends(get_db)):
    from fastapi.responses import JSONResponse
    res = buscar_proceso(q=numero, modo="radicado", db=db)
    if res:
        return res[0]
    raise HTTPException(status_code=404, detail="No se encontró el radicado")

@router.get("/nombre/{nombre}")
def consultar_por_nombre(nombre: str, db=Depends(get_db)):
    return buscar_proceso(q=nombre, modo="nombre", db=db)

@router.get("/tipo/{tipo}")
def consultar_por_tipo(tipo: str, db=Depends(get_db)):
    return buscar_proceso(q=tipo, modo="tipo", db=db)
