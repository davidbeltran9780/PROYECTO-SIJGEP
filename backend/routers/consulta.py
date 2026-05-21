from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from database import get_db
from fastapi import Depends

router = APIRouter(
    prefix="/consulta",
    tags=["Consulta Pública"]
)


# GET — buscar por número de radicado (busca en pqrs Y en casos)
@router.get("/radicado/{numero}")
def consultar_por_radicado(numero: str, db=Depends(get_db)):
    # Buscar en pqrs
    pqrs = db.execute(
        text("""
            SELECT numero_radicado, tipo, estado, fecha_creacion AS fecha
            FROM pqrs
            WHERE numero_radicado = :numero
        """),
        {"numero": numero}
    ).fetchone()

    if pqrs:
        return {"origen": "pqrs", **dict(pqrs._mapping)}

    # Buscar en casos
    caso = db.execute(
        text("""
            SELECT id_caso AS numero_radicado, tipo, estado, fecha_radicacion AS fecha
            FROM casos
            WHERE id_caso = :numero
        """),
        {"numero": numero}
    ).fetchone()

    if caso:
        return {"origen": "caso", **dict(caso._mapping)}

    raise HTTPException(status_code=404, detail="No se encontró ningún proceso con ese radicado")


# GET — buscar por nombre del ciudadano (busca en pqrs)
@router.get("/nombre/{nombre}")
def consultar_por_nombre(nombre: str, db=Depends(get_db)):
    resultado = db.execute(
        text("""
            SELECT numero_radicado, tipo, estado, fecha_creacion AS fecha
            FROM pqrs
            WHERE nombre_ciudadano LIKE :nombre
            ORDER BY fecha_creacion DESC
            LIMIT 20
        """),
        {"nombre": f"%{nombre}%"}
    ).fetchall()

    if not resultado:
        raise HTTPException(status_code=404, detail="No se encontraron procesos con ese nombre")

    return [dict(fila._mapping) for fila in resultado]


# GET — buscar por tipo de proceso
@router.get("/tipo/{tipo}")
def consultar_por_tipo(tipo: str, db=Depends(get_db)):
    tipos_validos = ["tutela", "demanda", "pqrs", "derecho_peticion", "peticion", "queja", "reclamo", "sugerencia", "otro"]
    if tipo.lower() not in tipos_validos:
        raise HTTPException(status_code=400, detail=f"Tipo inválido. Válidos: {tipos_validos}")

    # Buscar en casos
    casos = db.execute(
        text("""
            SELECT id_caso AS numero_radicado, tipo, estado, fecha_radicacion AS fecha
            FROM casos
            WHERE tipo = :tipo
            ORDER BY fecha_radicacion DESC
            LIMIT 20
        """),
        {"tipo": tipo.lower()}
    ).fetchall()

    # Buscar en pqrs
    pqrs = db.execute(
        text("""
            SELECT numero_radicado, tipo, estado, fecha_creacion AS fecha
            FROM pqrs
            WHERE tipo = :tipo
            ORDER BY fecha_creacion DESC
            LIMIT 20
        """),
        {"tipo": tipo.lower()}
    ).fetchall()

    resultados = [{"origen": "caso", **dict(f._mapping)} for f in casos] + \
                 [{"origen": "pqrs", **dict(f._mapping)} for f in pqrs]

    if not resultados:
        raise HTTPException(status_code=404, detail="No se encontraron procesos de ese tipo")

    return resultados
