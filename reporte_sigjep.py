from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from datetime import datetime

OUTPUT = r"C:\Users\ACER\Desktop\REPORTE_SIGJEP.pdf"

doc = SimpleDocTemplate(
    OUTPUT,
    pagesize=letter,
    rightMargin=0.75*inch,
    leftMargin=0.75*inch,
    topMargin=0.75*inch,
    bottomMargin=0.75*inch,
)

styles = getSampleStyleSheet()
AZUL = colors.HexColor('#1E3A8A')
AZUL_CLARO = colors.HexColor('#EFF6FF')
VERDE = colors.HexColor('#16A34A')
ROJO = colors.HexColor('#DC2626')
GRIS = colors.HexColor('#6B7280')
AMARILLO = colors.HexColor('#F59E0B')

# Estilos personalizados
titulo_doc = ParagraphStyle('TituloDoc', parent=styles['Title'],
    fontSize=22, textColor=colors.white, alignment=TA_CENTER, spaceAfter=4)
subtitulo_doc = ParagraphStyle('SubtituloDoc', parent=styles['Normal'],
    fontSize=11, textColor=colors.HexColor('#BFDBFE'), alignment=TA_CENTER, spaceAfter=2)
seccion = ParagraphStyle('Seccion', parent=styles['Heading1'],
    fontSize=13, textColor=AZUL, spaceBefore=16, spaceAfter=8,
    borderPad=4)
subseccion = ParagraphStyle('Subseccion', parent=styles['Heading2'],
    fontSize=11, textColor=AZUL, spaceBefore=10, spaceAfter=4)
normal = ParagraphStyle('Normal2', parent=styles['Normal'],
    fontSize=10, textColor=colors.HexColor('#374151'),
    leading=15, spaceAfter=4, alignment=TA_JUSTIFY)
item = ParagraphStyle('Item', parent=styles['Normal'],
    fontSize=10, textColor=colors.HexColor('#374151'),
    leftIndent=16, leading=14, spaceAfter=2)

def hr():
    return HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#E5E7EB'), spaceAfter=8, spaceBefore=4)

def tabla(data, col_widths, header=True):
    t = Table(data, colWidths=col_widths)
    style = [
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('GRID', (0,0), (-1,-1), 0.4, colors.HexColor('#E5E7EB')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F9FAFB')]),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
    ]
    if header:
        style += [
            ('BACKGROUND', (0,0), (-1,0), AZUL),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 9),
        ]
    t.setStyle(TableStyle(style))
    return t

story = []

# ══════════════════════════════════════════════
# PORTADA
# ══════════════════════════════════════════════
portada = Table(
    [[Paragraph('SIGJEP', titulo_doc)],
     [Paragraph('Sistema Inteligente de Gestión Jurídica para Entidades Públicas', subtitulo_doc)],
     [Spacer(1, 8)],
     [Paragraph('REPORTE DE ESTADO — ENTREGA FINAL', ParagraphStyle('p', fontSize=13,
        textColor=colors.HexColor('#FCD34D'), alignment=TA_CENTER, fontName='Helvetica-Bold'))],
     [Spacer(1, 4)],
     [Paragraph(f'Fecha de generación: {datetime.now().strftime("%d de %B de %Y")}',
        ParagraphStyle('p', fontSize=10, textColor=colors.HexColor('#BFDBFE'), alignment=TA_CENTER))],
     [Paragraph('sigjep.sena@gmail.com', ParagraphStyle('p', fontSize=10,
        textColor=colors.HexColor('#BFDBFE'), alignment=TA_CENTER))],
    ],
    colWidths=[6.5*inch]
)
portada.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), AZUL),
    ('TOPPADDING', (0,0), (-1,-1), 10),
    ('BOTTOMPADDING', (0,0), (-1,-1), 10),
    ('ROUNDEDCORNERS', [8,8,8,8]),
]))
story.append(portada)
story.append(Spacer(1, 20))

# ══════════════════════════════════════════════
# 1. RESUMEN EJECUTIVO
# ══════════════════════════════════════════════
story.append(Paragraph('1. Resumen Ejecutivo', seccion))
story.append(hr())
story.append(Paragraph(
    'SIGJEP es un sistema web de gestión jurídica desarrollado para entidades públicas colombianas. '
    'Permite administrar expedientes, documentos, PQRS, alertas de vencimiento y análisis de documentos '
    'con inteligencia artificial. El sistema cumple con los 20 ítems de la Lista de Chequeo del SENA '
    'Centro Minero — Análisis y Desarrollo de Sistemas de Información.', normal))
story.append(Spacer(1, 8))

resumen_data = [
    ['Módulos implementados', 'Tecnologías', 'Estado'],
    ['8 módulos funcionales', 'React + FastAPI + MySQL', 'Listo para entrega'],
    ['Sistema de roles (5 roles)', 'Google Gemini AI', 'Funcionando'],
    ['PQRS público sin login', 'Google Drive Backups', 'Funcionando'],
    ['20/20 ítems checklist SENA', 'JWT + bcrypt', 'Completo'],
]
story.append(tabla(resumen_data, [2.1*inch, 2.2*inch, 2.2*inch]))
story.append(Spacer(1, 12))

# ══════════════════════════════════════════════
# 2. ARQUITECTURA
# ══════════════════════════════════════════════
story.append(Paragraph('2. Arquitectura Técnica', seccion))
story.append(hr())

arch_data = [
    ['Capa', 'Tecnología', 'Descripción'],
    ['Frontend', 'React 18 + Vite', 'Interfaz de usuario SPA con enrutamiento React Router'],
    ['Backend', 'FastAPI (Python)', 'API REST con autenticación JWT y validación Pydantic'],
    ['Base de Datos', 'MySQL 8.0', '11 tablas relacionales, collation utf8mb4'],
    ['Inteligencia Artificial', 'Google Gemini 2.5 Flash', 'Análisis y resumen de documentos jurídicos'],
    ['Almacenamiento', 'Sistema de archivos local', 'Organizado por expediente: uploads/expediente_{id}/'],
    ['Backups', 'Google Drive API', 'Respaldos automáticos con OAuth2'],
    ['Seguridad', 'JWT + bcrypt', 'Tokens de acceso y contraseñas hasheadas'],
    ['Generación docs', 'jsPDF + docx.js', 'Exportación a PDF y Word desde el navegador'],
]
story.append(tabla(arch_data, [1.3*inch, 1.8*inch, 3.4*inch]))
story.append(Spacer(1, 12))

# ══════════════════════════════════════════════
# 3. MÓDULOS DEL SISTEMA
# ══════════════════════════════════════════════
story.append(Paragraph('3. Módulos del Sistema', seccion))
story.append(hr())

modulos = [
    ('Dashboard', 'Todos los roles', 'Resumen ejecutivo con tarjetas, gráficas y expedientes recientes. Ciudadanos ven sus PQRS.'),
    ('Gestión de Expedientes', 'Admin, Secretaria, Abogado', 'CRUD de expedientes con asignación de abogado, cambio de estado y buscador en tiempo real.'),
    ('Gestión de Documentos', 'Admin, Secretaria, Abogado', 'Carga de archivos por expediente (PDF, Word, imágenes), marcado como enviado y buscador integrado.'),
    ('PQRS', 'Todos los roles', 'Gestión de Peticiones, Quejas, Reclamos y Sugerencias. Los ciudadanos radican sin cuenta desde formulario público.'),
    ('Módulo IA', 'Admin, Abogado', 'Análisis con Google Gemini: clasifica tipo de caso, genera resumen jurídico y borrador de respuesta institucional. Exporta a PDF y Word.'),
    ('Alertas de Vencimiento', 'Admin, Secretaria, Abogado', 'Casos clasificados en: Urgente (<2 días), Próximo (2-5 días), A tiempo (>5 días). Filtrado por rol.'),
    ('Reportes', 'Solo Admin', 'Estadísticas con 5 gráficas: casos por tipo, estado, mes, PQRS por estado y carga por abogado.'),
    ('Administración', 'Solo Admin', 'Gestión de usuarios, generación de backups a Google Drive y auditoría de acciones del sistema.'),
    ('Consulta Pública', 'Sin login', 'Búsqueda de procesos por radicado, nombre del demandante o tipo. Cubre PQRS y expedientes.'),
    ('PQRS Pública', 'Sin login', 'Formulario de radicación conforme a Ley 1755/2015. Soporta anónimo para quejas. Muestra radicado y plazo.'),
    ('Ayuda', 'Todos los roles', 'Guía de módulos, preguntas frecuentes, contacto y tabla de créditos de recursos audiovisuales.'),
]

mod_data = [['Módulo', 'Roles', 'Funcionalidad']]
for m in modulos:
    mod_data.append(list(m))
story.append(tabla(mod_data, [1.5*inch, 1.6*inch, 3.4*inch]))
story.append(Spacer(1, 12))

# ══════════════════════════════════════════════
# 4. SISTEMA DE ROLES
# ══════════════════════════════════════════════
story.append(Paragraph('4. Sistema de Roles y Permisos', seccion))
story.append(hr())

roles_data = [
    ['Rol', 'Módulos accesibles', 'Restricciones'],
    ['Administrador', 'Todos los módulos', 'Sin restricciones'],
    ['Abogado', 'Dashboard, Expedientes, Documentos, PQRS, IA, Alertas', 'Solo ve sus casos asignados en alertas y PQRS'],
    ['Secretaria', 'Dashboard, Expedientes, Documentos, PQRS, Alertas', 'No accede a IA, Reportes ni Admin'],
    ['Ciudadano', 'Dashboard, PQRS propias', 'Solo ve sus propias PQRS'],
    ['Sin cuenta', 'Consulta pública, Formulario PQRS', 'Solo lectura y radicación'],
]
story.append(tabla(roles_data, [1.2*inch, 2.8*inch, 2.5*inch]))
story.append(Spacer(1, 12))

# ══════════════════════════════════════════════
# 5. BASE DE DATOS
# ══════════════════════════════════════════════
story.append(Paragraph('5. Base de Datos', seccion))
story.append(hr())

db_data = [
    ['Tabla', 'Descripción', 'Campos clave'],
    ['usuarios', 'Usuarios del sistema', 'id, nombre, email, password, rol, estado'],
    ['casos', 'Casos jurídicos', 'id, tipo, estado, titulo, fecha_vencimiento, id_abogado'],
    ['expedientes', 'Expedientes vinculados a casos', 'id, id_caso, fecha_creacion'],
    ['documentos', 'Archivos por expediente', 'id, id_expediente, nombre, ruta, estado, subido_por'],
    ['pqrs', 'Peticiones ciudadanas', 'id, numero_radicado, nombre, correo, tipo, estado, respuesta'],
    ['ia_resumenes', 'Resúmenes generados por IA', 'id, id_documento, contenido, fecha'],
    ['borradores_respuesta', 'Borradores de respuesta', 'id, id_caso, contenido, estado'],
    ['alertas', 'Alertas de vencimiento', 'id, id_caso, tipo, leida'],
    ['log_auditoria', 'Historial de acciones', 'id, id_usuario, accion, tabla, fecha'],
    ['backups_log', 'Registro de backups', 'id, fecha, archivo, link_drive, estado'],
    ['password_reset_tokens', 'Tokens recuperación', 'id, id_usuario, token, usado, fecha_exp'],
]
story.append(tabla(db_data, [1.5*inch, 2.0*inch, 3.0*inch]))
story.append(Spacer(1, 12))

# ══════════════════════════════════════════════
# 6. CHECKLIST SENA
# ══════════════════════════════════════════════
story.append(PageBreak())
story.append(Paragraph('6. Lista de Chequeo SENA — Estado Final', seccion))
story.append(hr())
story.append(Paragraph(
    'Centro Minero — Análisis y Desarrollo de Sistemas de Información — Equipo de Sistemas',
    ParagraphStyle('p', fontSize=9, textColor=GRIS, spaceAfter=10)))

check_data = [
    ['#', 'Criterio', 'Estado', 'Implementación'],
    ['1', 'Estructura básica (Header, Footer, Cuerpo)', 'SI', 'Header.jsx, Footer.jsx, layout consistente'],
    ['2', 'Identidad corporativa (colores, tipografía)', 'SI', 'Paleta azul #1E3A8A, fuente Inter, logo institucional'],
    ['3', 'Reglas ortográficas', 'SI', 'Aplicación completamente en español correcto'],
    ['4', 'Características de accesibilidad', 'SI', 'aria-label, title, htmlFor/id en todos los formularios'],
    ['5', 'Formularios para necesidades planteadas', 'SI', 'Login, Registro, Expedientes, PQRS, Usuarios, Docs'],
    ['6', 'Estructura de reportes', 'SI', 'Módulo Reportes con 5 gráficas y tabla de vencimientos'],
    ['7', 'Credenciales de acceso', 'SI', 'JWT con roles, bcrypt, bloqueo de usuarios inactivos'],
    ['8', 'Gestión de usuarios', 'SI', 'Admin: crear, editar, activar/desactivar, eliminar'],
    ['9', 'Módulo de recuperar contraseña', 'SI', 'Recuperar.jsx con envío de correo y token temporal'],
    ['10', 'Módulo de ayuda', 'SI', 'Ayuda.jsx con guía, FAQ, contacto y créditos'],
    ['11', 'Distribución adecuada, un idioma', 'SI', 'Español, sin mezcla de idiomas ni mayúsculas inconsistentes'],
    ['12', 'Disposición consistente en todas las páginas', 'SI', 'Componente Layout reutilizado en todas las rutas'],
    ['13', 'Referencias de recursos audiovisuales', 'SI', 'Tabla de créditos en Ayuda + Footer con referencias'],
    ['14', 'Módulo de búsqueda y filtros', 'SI', 'Buscador en Expedientes, PQRS, Documentos y Consulta pública'],
    ['15', 'Validación de datos en formularios', 'SI', 'Validación inline con mensajes de error por campo'],
    ['16', 'Mensajes de alerta estilizados', 'SI', 'Sistema Toast estilo macOS Sonoma + ConfirmModal propio'],
    ['17', 'Iconos con descripción', 'SI', 'aria-label y title en todos los botones con ícono'],
    ['18', 'Nombre de app y posición actual', 'SI', 'Header muestra: SIGJEP / [Módulo actual]'],
    ['19', 'Aplicativo responsivo', 'SI', 'Menú hamburguesa, sidebar deslizable, tablas adaptables'],
    ['20', 'Módulo de copias de seguridad', 'SI', 'Backup a Google Drive con historial y auditoría'],
]

check_table = Table(check_data, colWidths=[0.3*inch, 2.6*inch, 0.5*inch, 3.1*inch])
check_style = [
    ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
    ('FONTSIZE', (0,0), (-1,-1), 8.5),
    ('GRID', (0,0), (-1,-1), 0.4, colors.HexColor('#E5E7EB')),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('TOPPADDING', (0,0), (-1,-1), 4),
    ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ('LEFTPADDING', (0,0), (-1,-1), 6),
    ('BACKGROUND', (0,0), (-1,0), AZUL),
    ('TEXTCOLOR', (0,0), (-1,0), colors.white),
    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F9FAFB')]),
]
# Colorear columna Estado
for i in range(1, len(check_data)):
    check_style.append(('TEXTCOLOR', (2,i), (2,i), VERDE))
    check_style.append(('FONTNAME', (2,i), (2,i), 'Helvetica-Bold'))

check_table.setStyle(TableStyle(check_style))
story.append(check_table)
story.append(Spacer(1, 8))
story.append(Paragraph('Resultado: 20/20 ítems cumplidos (100%)',
    ParagraphStyle('p', fontSize=11, textColor=VERDE, fontName='Helvetica-Bold', spaceAfter=12)))

# ══════════════════════════════════════════════
# 7. API ENDPOINTS
# ══════════════════════════════════════════════
story.append(Paragraph('7. Endpoints del API REST', seccion))
story.append(hr())

api_data = [
    ['Módulo', 'Endpoints principales'],
    ['Autenticación', 'POST /login, POST /register, POST /recuperar, POST /reset-password'],
    ['Usuarios', 'GET/POST /usuarios, PUT/DELETE /usuarios/{id}, PATCH activar/desactivar'],
    ['Casos', 'GET/POST /casos, PUT /casos/{id}, PATCH /casos/{id}/estado'],
    ['Expedientes', 'GET/POST /expedientes, DELETE /expedientes/{id}'],
    ['Documentos', 'GET /documentos/expediente/{id}, POST /documentos/subir, PATCH enviar, DELETE'],
    ['PQRS', 'GET/POST /pqrs, PATCH estado/respuesta, GET /pqrs/mis-pqrs'],
    ['IA', 'POST /ia/resumir, GET /ia-test'],
    ['Reportes', 'GET estadisticas, casos-por-tipo, casos-por-estado, casos-por-mes, vencimientos, carga-por-abogado, notificaciones'],
    ['Consulta pública', 'GET /consulta/buscar?q=&modo=, /consulta/radicado/{n}, /consulta/nombre/{n}'],
    ['Backups', 'POST /backups/manual, GET /backups/listar'],
    ['Auditoría', 'GET /auditoria/'],
    ['Abogados', 'GET /abogados'],
]
story.append(tabla(api_data, [1.5*inch, 5.0*inch]))
story.append(Spacer(1, 12))

# ══════════════════════════════════════════════
# 8. LEGISLACIÓN
# ══════════════════════════════════════════════
story.append(Paragraph('8. Marco Legal Implementado', seccion))
story.append(hr())

leg_data = [
    ['Norma', 'Descripción', 'Implementación en SIGJEP'],
    ['Ley 1437 de 2011 (CPACA)', 'Código de Procedimiento Administrativo', 'Gestión de PQRS, plazos de respuesta, tipos de solicitud'],
    ['Ley 1755 de 2015', 'Regula el Derecho de Petición', 'Plazos: 15 días petición, 10 días docs, 30 días consultas'],
    ['Ley 1581 de 2012', 'Protección de Datos Personales', 'Checkbox obligatorio en formulario PQRS público'],
    ['Constitución Art. 86', 'Acción de Tutela', 'Tipo de caso "Tutela" con seguimiento en expedientes'],
    ['Ley 594 de 2000', 'Ley General de Archivos', 'Gestión documental con estados borrador/enviado'],
]
story.append(tabla(leg_data, [1.6*inch, 1.9*inch, 3.0*inch]))
story.append(Spacer(1, 12))

# ══════════════════════════════════════════════
# 9. CRÉDITOS
# ══════════════════════════════════════════════
story.append(Paragraph('9. Créditos y Recursos Audiovisuales', seccion))
story.append(hr())

cred_data = [
    ['Recurso', 'Descripción', 'Fuente / Licencia'],
    ['Logo SIGJEP', 'Imagen institucional del sistema', 'Propiedad de la institución · 2026'],
    ['Iconos', 'Emojis usados como íconos de interfaz', 'Unicode Consortium · unicode.org'],
    ['Recharts', 'Librería de gráficas para React', 'MIT License · recharts.org'],
    ['React', 'Framework de interfaz de usuario', 'MIT License · react.dev'],
    ['FastAPI', 'Framework backend en Python', 'MIT License · fastapi.tiangolo.com'],
    ['jsPDF', 'Generación de PDFs en el navegador', 'MIT License · github.com/parallax/jsPDF'],
    ['docx.js', 'Generación de documentos Word', 'MIT License · docx.js.org'],
    ['Google Gemini AI', 'Motor de inteligencia artificial', 'Google LLC · ai.google.dev'],
    ['PrimeReact', 'Componente DataTable en Dashboard', 'MIT License · primereact.org'],
    ['file-saver', 'Descarga de archivos en navegador', 'MIT License · github.com/eligrey/FileSaver.js'],
]
story.append(tabla(cred_data, [1.4*inch, 2.2*inch, 2.9*inch]))
story.append(Spacer(1, 12))

# ══════════════════════════════════════════════
# 10. PENDIENTES
# ══════════════════════════════════════════════
story.append(Paragraph('10. Pendientes y Recomendaciones', seccion))
story.append(hr())
story.append(Paragraph('Los siguientes elementos quedan pendientes para una siguiente versión:', normal))
story.append(Spacer(1, 6))

pendientes = [
    ('Footer completo', 'Agregar datos de la entidad (nombre, dirección, NIT, teléfono) cuando sean suministrados.'),
    ('Notificación por correo', 'Enviar correo automático al ciudadano cuando su PQRS recibe respuesta.'),
    ('Módulo IA en BD', 'Guardar los resúmenes generados por IA en la tabla ia_resumenes para historial.'),
    ('Exportar reportes', 'Agregar botón para exportar los reportes a PDF o Excel.'),
]

pend_data = [['Pendiente', 'Descripción']]
for p in pendientes:
    pend_data.append(list(p))
story.append(tabla(pend_data, [1.8*inch, 4.7*inch]))
story.append(Spacer(1, 20))

# ══════════════════════════════════════════════
# FIRMA
# ══════════════════════════════════════════════
firma = Table([[
    Paragraph('___________________________\nEquipo de Desarrollo\nSIGJEP 2026',
        ParagraphStyle('f', fontSize=10, alignment=TA_CENTER, leading=16)),
    Paragraph('___________________________\nInstructor\nCentro Minero SENA',
        ParagraphStyle('f', fontSize=10, alignment=TA_CENTER, leading=16)),
]], colWidths=[3.25*inch, 3.25*inch])
firma.setStyle(TableStyle([
    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('TOPPADDING', (0,0), (-1,-1), 20),
]))
story.append(firma)

doc.build(story)
print(f"PDF generado: {OUTPUT}")
