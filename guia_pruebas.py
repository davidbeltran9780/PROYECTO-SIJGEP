from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, Preformatted
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from datetime import datetime

OUTPUT = r"C:\Users\ACER\Desktop\GUIA_PRUEBAS_SIGJEP.pdf"

doc = SimpleDocTemplate(OUTPUT, pagesize=letter,
    rightMargin=0.75*inch, leftMargin=0.75*inch,
    topMargin=0.75*inch, bottomMargin=0.75*inch)

styles = getSampleStyleSheet()
AZUL       = colors.HexColor('#1E3A8A')
AZUL_CLARO = colors.HexColor('#EFF6FF')
VERDE      = colors.HexColor('#16A34A')
GRIS       = colors.HexColor('#6B7280')
AMARILLO   = colors.HexColor('#F59E0B')
ROJO       = colors.HexColor('#DC2626')

seccion  = ParagraphStyle('Sec', fontSize=13, textColor=AZUL,
    fontName='Helvetica-Bold', spaceBefore=14, spaceAfter=6)
sub      = ParagraphStyle('Sub', fontSize=11, textColor=AZUL,
    fontName='Helvetica-Bold', spaceBefore=10, spaceAfter=4)
normal   = ParagraphStyle('Nor', fontSize=10, leading=15, spaceAfter=4,
    textColor=colors.HexColor('#374151'), alignment=TA_JUSTIFY)
codigo   = ParagraphStyle('Cod', fontSize=8.5, fontName='Courier',
    backColor=colors.HexColor('#F3F4F6'), leading=13,
    leftIndent=10, rightIndent=10, spaceAfter=6, spaceBefore=4,
    textColor=colors.HexColor('#1F2937'))
nota     = ParagraphStyle('Nota', fontSize=9, textColor=GRIS,
    leftIndent=12, spaceAfter=4, leading=13)
item     = ParagraphStyle('Item', fontSize=10, leftIndent=16,
    leading=14, spaceAfter=3, textColor=colors.HexColor('#374151'))

def hr():
    return HRFlowable(width="100%", thickness=0.5,
        color=colors.HexColor('#E5E7EB'), spaceAfter=6, spaceBefore=2)

def tabla(data, widths, header=True):
    t = Table(data, colWidths=widths)
    s = [
        ('FONTNAME',   (0,0),(-1,-1),'Helvetica'),
        ('FONTSIZE',   (0,0),(-1,-1), 9),
        ('GRID',       (0,0),(-1,-1), 0.4, colors.HexColor('#E5E7EB')),
        ('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white, colors.HexColor('#F9FAFB')]),
        ('VALIGN',     (0,0),(-1,-1),'MIDDLE'),
        ('TOPPADDING', (0,0),(-1,-1), 5),
        ('BOTTOMPADDING',(0,0),(-1,-1), 5),
        ('LEFTPADDING',(0,0),(-1,-1), 7),
    ]
    if header:
        s += [
            ('BACKGROUND',(0,0),(-1,0), AZUL),
            ('TEXTCOLOR', (0,0),(-1,0), colors.white),
            ('FONTNAME',  (0,0),(-1,0),'Helvetica-Bold'),
        ]
    t.setStyle(TableStyle(s))
    return t

story = []

# ── PORTADA ──────────────────────────────────
portada = Table([[
    Paragraph('SIGJEP', ParagraphStyle('T', fontSize=22,
        textColor=colors.white, alignment=TA_CENTER, fontName='Helvetica-Bold'))],
    [Paragraph('Guía de Pruebas y Configuración', ParagraphStyle('S', fontSize=13,
        textColor=colors.HexColor('#BFDBFE'), alignment=TA_CENTER))],
    [Spacer(1,6)],
    [Paragraph('Base de datos de prueba · Scripts SQL · Documentos recomendados',
        ParagraphStyle('D', fontSize=10, textColor=colors.HexColor('#FCD34D'),
        alignment=TA_CENTER))],
    [Spacer(1,4)],
    [Paragraph(datetime.now().strftime('%d de %B de %Y'),
        ParagraphStyle('F', fontSize=9, textColor=colors.HexColor('#BFDBFE'),
        alignment=TA_CENTER))],
], colWidths=[6.5*inch])
portada.setStyle(TableStyle([
    ('BACKGROUND',(0,0),(-1,-1), AZUL),
    ('TOPPADDING',(0,0),(-1,-1), 10),
    ('BOTTOMPADDING',(0,0),(-1,-1), 10),
]))
story.append(portada)
story.append(Spacer(1, 18))

# ── 1. REQUISITOS PREVIOS ────────────────────
story.append(Paragraph('1. Requisitos Previos', seccion))
story.append(hr())
story.append(Paragraph('Antes de crear la base de datos asegúrate de tener instalado:', normal))
story.append(Spacer(1,4))

req = [
    ['Requisito', 'Versión mínima', 'Verificación en terminal'],
    ['MySQL Server', '8.0 o superior', 'mysql --version'],
    ['Python', '3.10 o superior', 'python --version'],
    ['Node.js', '18 o superior', 'node --version'],
    ['Git', 'Cualquiera', 'git --version'],
]
story.append(tabla(req, [1.8*inch, 1.5*inch, 3.2*inch]))
story.append(Spacer(1, 10))

# ── 2. CREAR BASE DE DATOS ───────────────────
story.append(Paragraph('2. Crear la Base de Datos', seccion))
story.append(hr())
story.append(Paragraph(
    'Abre MySQL Workbench, HeidiSQL o la terminal de MySQL y ejecuta los '
    'siguientes pasos en orden:', normal))
story.append(Spacer(1, 6))

story.append(Paragraph('Paso 1 — Crear la base de datos:', sub))
story.append(Preformatted(
    'CREATE DATABASE sigjep_db\n'
    '  CHARACTER SET utf8mb4\n'
    '  COLLATE utf8mb4_unicode_ci;\n\n'
    'USE sigjep_db;', codigo))

story.append(Paragraph('Paso 2 — Ejecutar el schema:', sub))
story.append(Paragraph(
    'Abre el archivo <b>backend/schema.sql</b> del proyecto y ejecútalo completo. '
    'Esto crea las 11 tablas del sistema.', normal))
story.append(Preformatted(
    '-- Desde terminal MySQL:\n'
    'mysql -u root -p sigjep_db < schema.sql\n\n'
    '-- O desde HeidiSQL/Workbench:\n'
    '-- Archivo > Abrir > schema.sql > Ejecutar todo', codigo))

story.append(Paragraph('Paso 3 — Verificar tablas creadas:', sub))
story.append(Preformatted('SHOW TABLES;', codigo))
story.append(Paragraph('Deberías ver 11 tablas: alertas, backups_log, borradores_respuesta, casos, documentos, expedientes, ia_resumenes, log_auditoria, password_reset_tokens, pqrs, usuarios.', nota))
story.append(Spacer(1, 6))

# ── 3. DATOS DE PRUEBA ───────────────────────
story.append(Paragraph('3. Script de Datos de Prueba', seccion))
story.append(hr())
story.append(Paragraph(
    'Ejecuta este script SQL para insertar datos de prueba con los que puedas '
    'probar todos los módulos del sistema:', normal))
story.append(Spacer(1, 6))

story.append(Paragraph('3.1 Usuarios de prueba (una contraseña por rol):', sub))
story.append(Preformatted(
    '-- IMPORTANTE: Las contraseñas ya están hasheadas con bcrypt.\n'
    '-- Contraseña para TODOS los usuarios de prueba: Admin123*\n\n'
    'INSERT INTO usuarios (nombre, email, password, rol, estado) VALUES\n'
    '("Admin Sistema",   "admin@sigjep.com",\n'
    ' "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGnLCCEfnY4y.V2zOX2MK8u9.Gy",\n'
    ' "administrador", "activo"),\n\n'
    '("Carlos Abogado",  "abogado@sigjep.com",\n'
    ' "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGnLCCEfnY4y.V2zOX2MK8u9.Gy",\n'
    ' "abogado", "activo"),\n\n'
    '("Maria Secretaria","secretaria@sigjep.com",\n'
    ' "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGnLCCEfnY4y.V2zOX2MK8u9.Gy",\n'
    ' "secretaria", "activo"),\n\n'
    '("Juan Ciudadano",  "ciudadano@sigjep.com",\n'
    ' "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGnLCCEfnY4y.V2zOX2MK8u9.Gy",\n'
    ' "ciudadano", "activo");', codigo))

story.append(Paragraph('Nota: Si el hash no funciona, crea los usuarios desde el panel de Administración del sistema ya en funcionamiento.', nota))
story.append(Spacer(1, 6))

story.append(Paragraph('3.2 Casos y expedientes de prueba:', sub))
story.append(Preformatted(
    '-- Casos de prueba (id_usuario_creador = 1 = admin)\n'
    'INSERT INTO casos\n'
    '  (tipo, estado, fecha_radicacion, id_usuario_creador,\n'
    '   titulo, descripcion, prioridad, fecha_vencimiento, id_abogado_asignado)\n'
    'VALUES\n'
    '("tutela",    "activo",    CURDATE(), 1,\n'
    ' "Pedro Ramirez vs Alcaldia",\n'
    ' "Tutela por vulneracion derecho a la salud",\n'
    ' "alta", DATE_ADD(CURDATE(), INTERVAL 3 DAY), 2),\n\n'
    '("demanda",   "en_proceso",CURDATE(), 1,\n'
    ' "Constructora XYZ vs Municipio",\n'
    ' "Demanda por incumplimiento contractual",\n'
    ' "media", DATE_ADD(CURDATE(), INTERVAL 15 DAY), 2),\n\n'
    '("derecho_peticion","activo",CURDATE(), 1,\n'
    ' "Ana Lopez - Derecho Peticion",\n'
    ' "Solicitud informacion predial",\n'
    ' "baja", DATE_ADD(CURDATE(), INTERVAL 10 DAY), NULL),\n\n'
    '("tutela",    "cerrado",   CURDATE(), 1,\n'
    ' "Luis Torres - Tutela educacion",\n'
    ' "Tutela por cupo escolar negado",\n'
    ' "media", DATE_ADD(CURDATE(), INTERVAL -2 DAY), 2);\n\n'
    '-- Expedientes vinculados a los casos\n'
    'INSERT INTO expedientes (id_caso) VALUES (1),(2),(3),(4);', codigo))

story.append(Paragraph('3.3 PQRS de prueba:', sub))
story.append(Preformatted(
    'INSERT INTO pqrs\n'
    '  (numero_radicado, nombre_ciudadano, correo, tipo,\n'
    '   descripcion, estado, fecha_vencimiento)\n'
    'VALUES\n'
    '("PQRS-20260601120000-101", "Carlos Mendez",\n'
    ' "carlos@email.com", "peticion",\n'
    ' "Solicitud certificado de residencia", "recibido",\n'
    '  DATE_ADD(CURDATE(), INTERVAL 15 DAY)),\n\n'
    '("PQRS-20260601130000-202", "Laura Gomez",\n'
    ' "laura@email.com", "queja",\n'
    ' "Queja por mal servicio en ventanilla", "en_proceso",\n'
    '  DATE_ADD(CURDATE(), INTERVAL 10 DAY)),\n\n'
    '("PQRS-20260601140000-303", "Anonimo",\n'
    ' "anonimo@email.com", "reclamo",\n'
    ' "Reclamo por cobro indebido impuesto", "respondido",\n'
    '  DATE_ADD(CURDATE(), INTERVAL 5 DAY));', codigo))

story.append(PageBreak())

# ── 4. CONFIGURAR EL PROYECTO ────────────────
story.append(Paragraph('4. Configurar y Arrancar el Proyecto', seccion))
story.append(hr())

story.append(Paragraph('4.1 Variables de entorno (archivo backend/.env):', sub))
story.append(Preformatted(
    'DB_HOST=localhost\n'
    'DB_PORT=3306\n'
    'DB_USER=root\n'
    'DB_PASSWORD=tu_password_mysql\n'
    'DB_NAME=sigjep_db\n'
    'SECRET_KEY=clave_secreta_larga_minimo_32_caracteres\n'
    'GEMINI_API_KEY=tu_api_key_de_google_gemini\n'
    'EMAIL_USER=sigjep.sena@gmail.com\n'
    'EMAIL_PASSWORD=tu_password_de_aplicacion_gmail', codigo))

story.append(Paragraph('4.2 Arrancar el backend:', sub))
story.append(Preformatted(
    'cd backend\n'
    'venv\\Scripts\\activate          # Windows\n'
    'uvicorn main:app --reload       # Inicia en http://localhost:8000', codigo))

story.append(Paragraph('4.3 Arrancar el frontend:', sub))
story.append(Preformatted(
    'cd frontend-react\n'
    'npm install                     # Solo la primera vez\n'
    'npm run dev                     # Inicia en http://localhost:5173', codigo))

story.append(Paragraph('4.4 Credenciales de prueba:', sub))
cred_data = [
    ['Rol', 'Correo', 'Contraseña', 'Acceso a'],
    ['Administrador', 'admin@sigjep.com',      'Admin123*', 'Todo el sistema'],
    ['Abogado',       'abogado@sigjep.com',    'Admin123*', 'Expedientes, Docs, PQRS, IA, Alertas'],
    ['Secretaria',    'secretaria@sigjep.com', 'Admin123*', 'Expedientes, Docs, PQRS, Alertas'],
    ['Ciudadano',     'ciudadano@sigjep.com',  'Admin123*', 'Dashboard, PQRS propias'],
]
story.append(tabla(cred_data, [1.1*inch, 1.8*inch, 1.0*inch, 2.6*inch]))
story.append(Spacer(1, 10))

# ── 5. DOCUMENTOS RECOMENDADOS ───────────────
story.append(Paragraph('5. Documentos Recomendados para Subir', seccion))
story.append(hr())
story.append(Paragraph(
    'Para probar correctamente el módulo de Documentos y el Módulo IA, '
    'se recomienda tener listos los siguientes tipos de archivos de prueba:', normal))
story.append(Spacer(1, 6))

docs_data = [
    ['Tipo de documento', 'Formato', 'Módulo donde se usa', 'Qué prueba'],
    ['Acción de tutela\n(texto simple)',
     'PDF o .txt', 'Documentos + IA',
     'La IA detecta tipo "Tutela" y genera borrador de respuesta'],
    ['Derecho de petición\nescrito a mano o mecanografiado',
     'PDF escaneado o JPG', 'Documentos + IA',
     'Prueba extracción de texto desde imagen'],
    ['Contrato o acuerdo\nmunicipal',
     '.docx', 'Documentos + IA',
     'La IA clasifica como "Demanda" o "Otro" y resume cláusulas'],
    ['Queja ciudadana\n(carta informal)',
     '.txt o PDF', 'Documentos + IA',
     'Clasifica como "Queja" y redacta respuesta institucional'],
    ['Resolución administrativa\n(documento oficial)',
     'PDF', 'Documentos',
     'Prueba subida de documentos oficiales al expediente'],
    ['Foto de documento\nfísico',
     'JPG o PNG', 'Documentos + IA',
     'Prueba que el sistema acepta imágenes y las procesa'],
]
story.append(tabla(docs_data, [1.5*inch, 0.9*inch, 1.5*inch, 2.6*inch]))
story.append(Spacer(1, 8))

story.append(Paragraph('Restricciones del sistema:', sub))
rest = [
    ['Formatos aceptados', 'PDF, Word (.docx, .doc), JPG, JPEG, PNG, TXT'],
    ['Tamaño máximo', '10 MB por archivo'],
    ['Procesamiento IA', 'Lee los primeros 10.000 caracteres del documento'],
    ['Mejor resultado IA', 'Documentos en español, bien estructurados, en formato texto (no escaneados)'],
]
t = Table(rest, colWidths=[1.8*inch, 4.7*inch])
t.setStyle(TableStyle([
    ('FONTNAME',  (0,0),(-1,-1),'Helvetica'),
    ('FONTSIZE',  (0,0),(-1,-1), 9),
    ('GRID',      (0,0),(-1,-1), 0.4, colors.HexColor('#E5E7EB')),
    ('BACKGROUND',(0,0),(0,-1),  AZUL_CLARO),
    ('FONTNAME',  (0,0),(0,-1),  'Helvetica-Bold'),
    ('TEXTCOLOR', (0,0),(0,-1),  AZUL),
    ('ROWBACKGROUNDS',(0,0),(-1,-1),[AZUL_CLARO, colors.white]),
    ('TOPPADDING',(0,0),(-1,-1), 5),
    ('BOTTOMPADDING',(0,0),(-1,-1), 5),
    ('LEFTPADDING',(0,0),(-1,-1), 7),
    ('VALIGN',   (0,0),(-1,-1), 'MIDDLE'),
]))
story.append(t)
story.append(Spacer(1, 10))

# ── 6. FLUJO DE PRUEBA RECOMENDADO ───────────
story.append(Paragraph('6. Flujo de Prueba Recomendado', seccion))
story.append(hr())
story.append(Paragraph(
    'Sigue este orden para demostrar todas las funcionalidades del sistema:', normal))
story.append(Spacer(1, 6))

flujo = [
    ['Paso', 'Acción', 'Resultado esperado'],
    ['1', 'Ir a / — Radicar PQRS sin cuenta', 'Se genera número de radicado'],
    ['2', 'Ir a /consulta — Buscar por radicado', 'Aparece la PQRS recién creada'],
    ['3', 'Login como ciudadano@sigjep.com', 'Dashboard con mis PQRS'],
    ['4', 'Login como admin@sigjep.com', 'Dashboard completo con gráficas'],
    ['5', 'Admin > Usuarios > Nuevo usuario', 'Se crea usuario y aparece en lista'],
    ['6', 'Expedientes > Nuevo expediente', 'Se crea con abogado asignado'],
    ['7', 'Documentos > Seleccionar expediente > Subir archivo', 'Archivo aparece en la tabla'],
    ['8', 'Módulo IA > Subir archivo > Analizar', 'Resumen y borrador generados por IA'],
    ['9', 'Módulo IA > Descargar PDF / Word', 'Se descarga el documento generado'],
    ['10', 'PQRS > Responder una solicitud', 'Estado cambia a "respondido"'],
    ['11', 'Alertas > Ver casos urgentes', 'Casos a 3 días aparecen en rojo'],
    ['12', 'Reportes > Ver gráficas', 'Gráficas con datos reales del sistema'],
    ['13', 'Admin > Backups > Generar backup', 'Backup subido a Google Drive'],
    ['14', 'Ayuda > Revisar FAQ', 'Acordeón funciona, tabla de créditos visible'],
]
story.append(tabla(flujo, [0.4*inch, 2.5*inch, 3.6*inch]))
story.append(Spacer(1, 20))

# ── FIRMA ─────────────────────────────────────
firma = Table([[
    Paragraph('___________________________\nEquipo de Desarrollo\nSIGJEP 2026',
        ParagraphStyle('f', fontSize=10, alignment=TA_CENTER, leading=16)),
    Paragraph('___________________________\nInstructor\nCentro Minero SENA',
        ParagraphStyle('f', fontSize=10, alignment=TA_CENTER, leading=16)),
]], colWidths=[3.25*inch, 3.25*inch])
firma.setStyle(TableStyle([
    ('ALIGN',   (0,0),(-1,-1),'CENTER'),
    ('VALIGN',  (0,0),(-1,-1),'TOP'),
    ('TOPPADDING',(0,0),(-1,-1), 20),
]))
story.append(firma)

doc.build(story)
print(f"PDF generado: {OUTPUT}")
