from datetime import date, timedelta


def _siguiente_lunes(d: date) -> date:
    """Si d es lunes lo devuelve igual, si no devuelve el lunes siguiente."""
    dias = (7 - d.weekday()) % 7
    return d if dias == 0 else d + timedelta(days=dias)


def _pascua(año: int) -> date:
    """Algoritmo de Butcher para calcular el domingo de Pascua."""
    a = año % 19
    b = año // 100
    c = año % 100
    d = b // 4
    e = b % 4
    f = (b + 8) // 25
    g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30
    i = c // 4
    k = c % 4
    l = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * l) // 451
    mes = (h + l - 7 * m + 114) // 31
    dia = ((h + l - 7 * m + 114) % 31) + 1
    return date(año, mes, dia)


def festivos_colombia(año: int) -> set:
    """
    Devuelve un set con todas las fechas festivas de Colombia para el año dado.
    Aplica Ley 51 de 1983 (festivos de puente se trasladan al lunes siguiente).
    """
    pascua = _pascua(año)
    f = set()

    # Festivos fijos (no se trasladan)
    f.add(date(año, 1, 1))    # Año Nuevo
    f.add(date(año, 5, 1))    # Día del Trabajo
    f.add(date(año, 7, 20))   # Independencia de Colombia
    f.add(date(año, 8, 7))    # Batalla de Boyacá
    f.add(date(año, 12, 8))   # Inmaculada Concepción
    f.add(date(año, 12, 25))  # Navidad

    # Semana Santa (fijos relativos a Pascua)
    f.add(pascua - timedelta(days=3))  # Jueves Santo
    f.add(pascua - timedelta(days=2))  # Viernes Santo

    # Festivos Ley 51 (se trasladan al lunes siguiente si no caen en lunes)
    f.add(_siguiente_lunes(date(año, 1, 6)))    # Reyes Magos
    f.add(_siguiente_lunes(date(año, 3, 19)))   # San José
    f.add(_siguiente_lunes(date(año, 6, 29)))   # San Pedro y San Pablo
    f.add(_siguiente_lunes(date(año, 8, 15)))   # Asunción de la Virgen
    f.add(_siguiente_lunes(date(año, 10, 12)))  # Día de la Raza
    f.add(_siguiente_lunes(date(año, 11, 1)))   # Todos los Santos
    f.add(_siguiente_lunes(date(año, 11, 11)))  # Independencia de Cartagena

    # Festivos móviles relativos a Pascua (Ley 51)
    f.add(_siguiente_lunes(pascua + timedelta(days=39)))  # Ascensión del Señor
    f.add(_siguiente_lunes(pascua + timedelta(days=60)))  # Corpus Christi
    f.add(_siguiente_lunes(pascua + timedelta(days=68)))  # Sagrado Corazón de Jesús

    return f


def agregar_dias_habiles(fecha_inicio: date, dias_habiles: int) -> date:
    """
    Suma N días hábiles a fecha_inicio excluyendo fines de semana
    y festivos colombianos (cubre el año de inicio y el siguiente).
    """
    festivos = festivos_colombia(fecha_inicio.year) | festivos_colombia(fecha_inicio.year + 1)
    fecha = fecha_inicio
    contados = 0
    while contados < dias_habiles:
        fecha += timedelta(days=1)
        if fecha.weekday() < 5 and fecha not in festivos:
            contados += 1
    return fecha
