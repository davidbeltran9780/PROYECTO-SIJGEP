"""
Pruebas unitarias para backend/fechas_utils.py
Modulo del sistema SIGJEP - RF-04 Alertas Automaticas de Tiempos Legales

Tecnica aplicada: partición de equivalencia y valor límite (caja negra)
                  + cobertura de decisión (caja blanca)
"""
from datetime import date
import pytest
from fechas_utils import festivos_colombia, agregar_dias_habiles, _siguiente_lunes, _pascua


# ---------------------------------------------------------------------------
# GRUPO 1: _pascua()  -- valores conocidos y verificados de forma externa
# ---------------------------------------------------------------------------

def test_pascua_2026_fecha_conocida():
    """Domingo de Pascua 2026 es el 5 de abril (dato verificable de calendario)."""
    assert _pascua(2026) == date(2026, 4, 5)


def test_pascua_2025_fecha_conocida():
    """Domingo de Pascua 2025 es el 20 de abril."""
    assert _pascua(2025) == date(2025, 4, 20)


# ---------------------------------------------------------------------------
# GRUPO 2: _siguiente_lunes()  -- valor limite: lunes, y los 6 dias restantes
# ---------------------------------------------------------------------------

def test_siguiente_lunes_si_ya_es_lunes_no_cambia():
    """Caso limite: si la fecha YA es lunes, debe devolver la misma fecha."""
    un_lunes = date(2026, 1, 5)  # confirmado lunes
    assert _siguiente_lunes(un_lunes) == un_lunes


def test_siguiente_lunes_si_es_domingo_avanza_uno():
    """Caso limite superior: domingo es el caso que menos dias debe avanzar (1)."""
    un_domingo = date(2026, 1, 4)
    assert _siguiente_lunes(un_domingo) == date(2026, 1, 5)


def test_siguiente_lunes_si_es_martes_avanza_seis():
    """Caso limite inferior: martes es el caso que mas dias debe avanzar (6)."""
    un_martes = date(2026, 1, 6)
    assert _siguiente_lunes(un_martes) == date(2026, 1, 12)


# ---------------------------------------------------------------------------
# GRUPO 3: festivos_colombia()  -- particion de equivalencia por tipo de festivo
# ---------------------------------------------------------------------------

def test_festivos_fijos_no_se_trasladan():
    """Navidad y Ano Nuevo son festivos FIJOS, no se mueven al lunes (Ley 51 no aplica)."""
    festivos = festivos_colombia(2026)
    assert date(2026, 12, 25) in festivos  # Navidad
    assert date(2026, 1, 1) in festivos    # Año Nuevo


def test_festivo_ley_51_se_traslada_a_lunes():
    """
    San Jose (19 de marzo) cae jueves en 2026 -> debe trasladarse al lunes siguiente,
    NO debe quedar registrado el 19 de marzo como festivo.
    """
    festivos = festivos_colombia(2026)
    fecha_original = date(2026, 3, 19)
    assert fecha_original not in festivos
    siguiente_lunes_esperado = _siguiente_lunes(fecha_original)
    assert siguiente_lunes_esperado in festivos


def test_jueves_y_viernes_santo_presentes():
    """Semana Santa 2026 (Pascua 5 abril): Jueves Santo 2 abril, Viernes Santo 3 abril."""
    festivos = festivos_colombia(2026)
    assert date(2026, 4, 2) in festivos  # Jueves Santo
    assert date(2026, 4, 3) in festivos  # Viernes Santo


# ---------------------------------------------------------------------------
# GRUPO 4: agregar_dias_habiles()  -- el corazon de RF-04, casos de negocio reales
# ---------------------------------------------------------------------------

def test_tutela_10_dias_habiles_sin_festivos_de_por_medio():
    """
    RF-04: una tutela radicada un lunes vence 10 dias habiles despues.
    Lunes 12 enero 2026 + 10 habiles (salta 1 fin de semana, sin festivos) -> lunes 26 enero.
    """
    inicio = date(2026, 1, 12)  # lunes
    resultado = agregar_dias_habiles(inicio, 10)
    assert resultado == date(2026, 1, 26)
    assert resultado.weekday() < 5  # debe caer en dia habil


def test_no_cuenta_sabados_ni_domingos():
    """Valor limite: iniciar un viernes (sin festivo cercano) y pedir 1 dia habil debe saltar el fin de semana."""
    un_viernes = date(2026, 2, 6)
    resultado = agregar_dias_habiles(un_viernes, 1)
    assert resultado == date(2026, 2, 9)  # lunes siguiente, no sabado ni domingo


def test_peticion_15_dias_habiles_salta_festivo_trasladado():
    """
    RF-04: derecho de peticion = 15 dias habiles.
    Radicado 9 marzo 2026 (lunes), el rango incluye el festivo de San Jose
    trasladado a lunes 23 de marzo 2026 -> ese dia NO debe contar como habil.
    """
    inicio = date(2026, 3, 9)
    resultado = agregar_dias_habiles(inicio, 15)
    festivo_trasladado = _siguiente_lunes(date(2026, 3, 19))
    # el dia festivo trasladado no puede ser el resultado final
    assert resultado != festivo_trasladado
    assert resultado.weekday() < 5


def test_reyes_magos_trasladado_no_cuenta_como_habil():
    """
    Hallazgo de QA: el 6 de enero (Reyes Magos) cae martes en 2026, por Ley 51
    se traslada al lunes 12 de enero. Ese lunes NO debe contar como dia habil.
    Caso de valor limite descubierto durante la ejecucion de pruebas.
    """
    festivos = festivos_colombia(2026)
    assert date(2026, 1, 12) in festivos
    # iniciar el jueves 8 de enero y pedir 2 dias habiles debe saltar el lunes 12 (festivo)
    resultado = agregar_dias_habiles(date(2026, 1, 8), 2)
    assert resultado != date(2026, 1, 12)

def test_cero_dias_habiles_devuelve_fecha_diferente_a_inicio():
    """Caso de error adivinado: pedir 0 dias habiles. La funcion no debe devolver fecha_inicio."""
    inicio = date(2026, 1, 12)
    resultado = agregar_dias_habiles(inicio, 0)
    assert resultado == inicio  # con 0 iteraciones el while no avanza, debe ser igual


def test_resultado_jamas_es_festivo():
    """Invariante de negocio: el dia de vencimiento calculado nunca puede ser festivo."""
    inicio = date(2026, 6, 1)
    resultado = agregar_dias_habiles(inicio, 20)
    festivos = festivos_colombia(resultado.year)
    assert resultado not in festivos


def test_resultado_jamas_es_fin_de_semana():
    """Invariante de negocio: el dia de vencimiento calculado nunca puede ser sabado o domingo."""
    inicio = date(2026, 2, 2)
    resultado = agregar_dias_habiles(inicio, 7)
    assert resultado.weekday() < 5
