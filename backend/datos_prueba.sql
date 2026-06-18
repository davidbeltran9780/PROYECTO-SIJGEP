-- ============================================================
--  DATOS DE PRUEBA — SIGJEP  (versión ampliada)
--  Contraseña de TODOS los usuarios: Sena2026
--  Ejecutar DESPUÉS de schema.sql
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. USUARIOS
-- 7 internos + 3 ciudadanos
-- ============================================================
INSERT INTO `usuarios` (`nombre`, `email`, `password`, `rol`, `estado`, `fecha_creacion`) VALUES
-- Administrador
('Manuel Rodríguez',   'admin@sigjep.co',          '$2b$12$BhRuvz7xtHGfDTxV3wfSnem630ZIKAiA6y4LH1sSWfDAEGJU3OsPK', 'administrador', 'activo',   '2025-08-10 08:00:00'),
-- Abogados
('Laura Jiménez',      'abogado@sigjep.co',         '$2b$12$BhRuvz7xtHGfDTxV3wfSnem630ZIKAiA6y4LH1sSWfDAEGJU3OsPK', 'abogado',       'activo',   '2025-09-03 09:15:00'),
('Andrés Castellanos', 'acastellanos@sigjep.co',    '$2b$12$BhRuvz7xtHGfDTxV3wfSnem630ZIKAiA6y4LH1sSWfDAEGJU3OsPK', 'abogado',       'activo',   '2025-09-03 09:30:00'),
('Patricia Vargas',    'pvargas@sigjep.co',          '$2b$12$BhRuvz7xtHGfDTxV3wfSnem630ZIKAiA6y4LH1sSWfDAEGJU3OsPK', 'abogado',       'activo',   '2025-10-15 11:00:00'),
-- Secretarias
('Sofía Morales',      'secretaria@sigjep.co',      '$2b$12$BhRuvz7xtHGfDTxV3wfSnem630ZIKAiA6y4LH1sSWfDAEGJU3OsPK', 'secretaria',    'activo',   '2025-09-05 08:45:00'),
('Jorge Quintero',     'jquintero@sigjep.co',       '$2b$12$BhRuvz7xtHGfDTxV3wfSnem630ZIKAiA6y4LH1sSWfDAEGJU3OsPK', 'secretaria',    'activo',   '2026-01-20 10:00:00'),
-- Usuarios inactivos
('Roberto Salcedo',    'rsalcedo@sigjep.co',         '$2b$12$BhRuvz7xtHGfDTxV3wfSnem630ZIKAiA6y4LH1sSWfDAEGJU3OsPK', 'abogado',       'inactivo', '2025-11-08 14:20:00'),
('Claudia Restrepo',   'crestrepo@sigjep.co',        '$2b$12$BhRuvz7xtHGfDTxV3wfSnem630ZIKAiA6y4LH1sSWfDAEGJU3OsPK', 'secretaria',    'inactivo', '2026-02-14 09:00:00'),
-- Ciudadanos
('Carlos Pérez',       'ciudadano@sigjep.co',       '$2b$12$BhRuvz7xtHGfDTxV3wfSnem630ZIKAiA6y4LH1sSWfDAEGJU3OsPK', 'ciudadano',     'activo',   '2026-03-01 16:30:00'),
('Ana Gómez',          'ana.gomez@correo.co',       '$2b$12$BhRuvz7xtHGfDTxV3wfSnem630ZIKAiA6y4LH1sSWfDAEGJU3OsPK', 'ciudadano',     'activo',   '2026-04-10 11:45:00'),
('Pedro Ramírez',      'pedro.ramirez@correo.co',   '$2b$12$BhRuvz7xtHGfDTxV3wfSnem630ZIKAiA6y4LH1sSWfDAEGJU3OsPK', 'ciudadano',     'activo',   '2026-05-22 08:20:00'),
('María Torres',       'maria.torres@correo.co',    '$2b$12$BhRuvz7xtHGfDTxV3wfSnem630ZIKAiA6y4LH1sSWfDAEGJU3OsPK', 'ciudadano',     'activo',   '2026-06-05 13:10:00'),
('Luis Herrera',       'luis.herrera@correo.co',    '$2b$12$BhRuvz7xtHGfDTxV3wfSnem630ZIKAiA6y4LH1sSWfDAEGJU3OsPK', 'ciudadano',     'activo',   '2026-06-10 07:50:00');

-- ============================================================
-- 2. CASOS
-- 18 casos: urgentes, próximos, a tiempo, cerrados, archivados
-- Distribuidos entre los 3 abogados activos (id 2, 3, 4)
-- ============================================================
INSERT INTO `casos`
  (`tipo`, `titulo`, `descripcion`, `estado`, `prioridad`, `fecha_radicacion`, `fecha_vencimiento`, `id_abogado_asignado`, `id_usuario_creador`)
VALUES

-- ── URGENTES (vencen en 1-2 días) ──────────────────────────
('tutela',
 'Tutela derecho a la salud — García vs EPS Salud Total',
 'El accionante solicita amparo del derecho fundamental a la salud por negativa de la EPS a suministrar medicamentos de alto costo para tratamiento oncológico.',
 'activo', 'urgente', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 DAY), 2, 1),

('tutela',
 'Tutela derecho a la vivienda — Familia López Mosquera',
 'Familia en situación de desplazamiento forzado solicita amparo del derecho a la vivienda digna ante omisión reiterada de la alcaldía en asignación de subsidio.',
 'activo', 'urgente', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 2 DAY), 3, 1),

('derecho_peticion',
 'Derecho de petición — Respuesta certificado catastral',
 'Ciudadano interpone derecho de petición por silencio administrativo ante solicitud de certificado catastral radicada hace 25 días sin respuesta.',
 'activo', 'urgente', DATE_ADD(CURDATE(), INTERVAL -25 DAY), DATE_ADD(CURDATE(), INTERVAL 1 DAY), 4, 5),

-- ── PRÓXIMOS (vencen en 3-5 días) ──────────────────────────
('demanda',
 'Demanda contencioso-administrativa — Contrato de obra 045/2025',
 'Demanda por incumplimiento de contrato de obra pública número 045 del año 2025. El contratista no entregó el 40% de la obra en el plazo acordado.',
 'activo', 'alta', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 3 DAY), 2, 1),

('tutela',
 'Tutela derecho a la educación — Menor Sofía Rodríguez',
 'Acción de tutela para garantizar acceso a cupo escolar en institución pública. La menor lleva dos semanas sin poder iniciar clases por negativa administrativa.',
 'activo', 'alta', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 4 DAY), 3, 5),

('demanda',
 'Demanda reparación directa — Accidente vía terciaria km 12',
 'Demanda por daños y perjuicios ocasionados en accidente de tránsito en vía a cargo del municipio por falta de señalización y mantenimiento.',
 'activo', 'alta', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 5 DAY), 4, 1),

('pqrs',
 'PQRS vinculada — Queja servicio acueducto barrio El Porvenir',
 'Queja formal por suspensión injustificada del servicio de acueducto durante 10 días en el barrio El Porvenir. Afecta a 45 familias.',
 'activo', 'alta', DATE_ADD(CURDATE(), INTERVAL -10 DAY), DATE_ADD(CURDATE(), INTERVAL 5 DAY), 2, 5),

-- ── A TIEMPO (vencen en más de 5 días) ─────────────────────
('demanda',
 'Demanda ordinaria laboral — Sindicato Municipal de Trabajadores',
 'Sindicato de trabajadores municipales interpone demanda por presunto incumplimiento de convención colectiva en materia de primas extralegales.',
 'activo', 'media', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 10 DAY), 2, 1),

('tutela',
 'Tutela derecho al agua — Vereda La Esperanza sector 2',
 'Comunidad rural de 120 familias solicita amparo del derecho fundamental al agua potable por deficiencias estructurales en el sistema de abastecimiento.',
 'activo', 'media', DATE_ADD(CURDATE(), INTERVAL -5 DAY), DATE_ADD(CURDATE(), INTERVAL 12 DAY), 3, 1),

('derecho_peticion',
 'Derecho de petición — Licencia de construcción predio 045-22',
 'Ciudadano solicita información sobre estado de trámite de licencia de construcción radicada hace 45 días. Curaduría no ha dado respuesta.',
 'activo', 'baja', DATE_ADD(CURDATE(), INTERVAL -45 DAY), DATE_ADD(CURDATE(), INTERVAL 15 DAY), 4, 5),

('tutela',
 'Tutela derecho pensional — Adulto mayor Hernando Cárdenas',
 'Adulto mayor de 74 años interpone tutela contra Colpensiones por mora en el reconocimiento de su pensión de vejez. Lleva 18 meses en trámite.',
 'activo', 'alta', DATE_ADD(CURDATE(), INTERVAL -3 DAY), DATE_ADD(CURDATE(), INTERVAL 7 DAY), 2, 1),

('demanda',
 'Demanda nulidad electoral — Concejo Municipal acta 018',
 'Demanda de nulidad electoral contra acta de sesión del concejo municipal por presunta violación del quórum decisorio en aprobación de acuerdo.',
 'en_proceso', 'media', DATE_ADD(CURDATE(), INTERVAL -15 DAY), DATE_ADD(CURDATE(), INTERVAL 20 DAY), 3, 1),

('pqrs',
 'PQRS vinculada — Petición información licitación pública 003',
 'Empresa participante solicita acceso a documentos del proceso licitatorio número 003 para ejercer derecho de contradicción ante adjudicación cuestionada.',
 'en_proceso', 'media', DATE_ADD(CURDATE(), INTERVAL -8 DAY), DATE_ADD(CURDATE(), INTERVAL 25 DAY), 4, 5),

('otro',
 'Concepto jurídico — Viabilidad convenio interadministrativo SENA',
 'Solicitud de concepto jurídico sobre viabilidad legal de celebrar convenio interadministrativo con el SENA para formación de funcionarios municipales.',
 'activo', 'baja', DATE_ADD(CURDATE(), INTERVAL -2 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 2, 1),

('tutela',
 'Tutela derecho a la información — Periodista Ramón Díaz',
 'Periodista independiente solicita amparo del derecho de acceso a la información pública ante negativa de la alcaldía de entregar contratos de publicidad oficial.',
 'activo', 'media', DATE_ADD(CURDATE(), INTERVAL -4 DAY), DATE_ADD(CURDATE(), INTERVAL 18 DAY), 3, 1),

('demanda',
 'Demanda responsabilidad extracontractual — Inundación barrio El Jardín',
 'Comunidad de 30 familias demanda al municipio por daños materiales causados por desbordamiento de canal de aguas lluvias sin mantenimiento. Daños estimados en $180 millones.',
 'en_proceso', 'alta', DATE_ADD(CURDATE(), INTERVAL -10 DAY), DATE_ADD(CURDATE(), INTERVAL 22 DAY), 4, 1),

('otro',
 'Concepto jurídico — Modificación estatutos Empresa de Servicios',
 'Solicitud de concepto sobre la viabilidad jurídica de modificar los estatutos de la empresa de servicios públicos municipal para incluir nuevos servicios de internet.',
 'activo', 'baja', DATE_ADD(CURDATE(), INTERVAL -1 DAY), DATE_ADD(CURDATE(), INTERVAL 28 DAY), 2, 1),

-- ── SIN ABOGADO ASIGNADO ───────────────────────────────────
('tutela',
 'Tutela derecho al trabajo — Jhon Fredy Ospina',
 'Trabajador informal solicita amparo de su derecho al trabajo tras operativos de espacio público que impidieron el ejercicio de su actividad comercial.',
 'activo', 'media', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 9 DAY), NULL, 5),

('pqrs',
 'PQRS sin abogado — Solicitud alumbrado navideño sector norte',
 'Junta de acción comunal solicita información sobre cronograma de instalación de alumbrado navideño en el sector norte del municipio para año 2026.',
 'activo', 'baja', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 14 DAY), NULL, 6),

-- ── CERRADOS Y ARCHIVADOS ──────────────────────────────────
('tutela',
 'Tutela conexidad derecho a la salud — Caso Martínez (resuelto)',
 'Tutela resuelta favorablemente por juzgado de primera instancia. La EPS suministró el medicamento dentro del término legal.',
 'cerrado', 'alta', DATE_ADD(CURDATE(), INTERVAL -30 DAY), DATE_ADD(CURDATE(), INTERVAL -20 DAY), 3, 1),

('demanda',
 'Demanda ejecutiva contractual — Proveedor Papelería Central (archivado)',
 'Demanda ejecutiva por incumplimiento en suministro de elementos de oficina. Proceso terminó por acuerdo de pago y fue archivado.',
 'archivado', 'baja', DATE_ADD(CURDATE(), INTERVAL -60 DAY), DATE_ADD(CURDATE(), INTERVAL -45 DAY), 4, 1),

('derecho_peticion',
 'Derecho de petición respondido — Subsidio vivienda Lote 22',
 'Derecho de petición respondido dentro del término legal. Ciudadano fue informado del estado de su postulación al subsidio de vivienda de interés social.',
 'cerrado', 'baja', DATE_ADD(CURDATE(), INTERVAL -20 DAY), DATE_ADD(CURDATE(), INTERVAL -12 DAY), 2, 5);

-- ============================================================
-- 3. EXPEDIENTES (uno por caso)
-- ============================================================
INSERT INTO `expedientes` (`id_caso`) VALUES
(1),(2),(3),(4),(5),(6),(7),(8),(9),(10),
(11),(12),(13),(14),(15),(16),(17),(18),
(19),(20),(21),(22),(23);

-- ============================================================
-- 4. PQRS
-- 16 registros con fecha_vencimiento para probar alertas
-- Escenarios: vencidas, urgentes, próximas, a tiempo, cerradas
-- fecha_vencimiento = ~15 días hábiles desde fecha_creacion
-- ============================================================
INSERT INTO `pqrs`
  (`numero_radicado`, `tipo`, `nombre_ciudadano`, `correo`, `descripcion`, `estado`, `respuesta`, `fecha_creacion`, `fecha_vencimiento`)
VALUES

-- ── VENCIDAS (fecha_creacion lo suficientemente antigua para que 15 días hábiles ya pasaron)
-- 15 días hábiles desde ~2026-05-15 = ~2026-06-05 (vencida hace ~13 días)
-- 15 días hábiles desde ~2026-05-20 = ~2026-06-09 (vencida hace ~9 días)
('PQRS-20260515-001', 'peticion',
 'Carlos Pérez', 'ciudadano@sigjep.co',
 '━━━ DATOS DEL SOLICITANTE ━━━\nMunicipio: Medellín\nTeléfono: 3001234567\nDocumento: Cédula de Ciudadanía 1023456789\n\nAsunto: Información pensión jubilación\n\n━━━ DESCRIPCIÓN ━━━\nSolicito información sobre el estado de mi pensión de jubilación radicada el pasado mes de febrero ante la Secretaría de Hacienda Municipal.',
 'recibido', NULL,
 '2026-05-15 09:00:00', NULL),

('PQRS-20260520-002', 'queja',
 'Ana Gómez', 'ana.gomez@correo.co',
 '━━━ DATOS DEL SOLICITANTE ━━━\nMunicipio: Medellín\nTeléfono: 3119876543\n\n━━━ DESCRIPCIÓN ━━━\nPresento queja formal por mal estado de la vía principal del barrio Las Flores. La vía lleva 3 meses sin reparación y representa un peligro para los peatones y vehículos.',
 'en_proceso', NULL,
 '2026-05-20 10:15:00', NULL),

-- ── URGENTES: 15 días hábiles desde ~2026-05-29 = ~2026-06-19 (mañana)
--              15 días hábiles desde ~2026-05-28 = ~2026-06-18 (hoy = 0 días)
('PQRS-20260529-006', 'queja',
 'Anónimo', 'anonimo1@correo.co',
 '━━━ DATOS DEL SOLICITANTE ━━━\nMunicipio: Itagüí\n\n━━━ DESCRIPCIÓN ━━━\nQueja anónima por conducta irregular de un funcionario de la secretaría de planeación que estaría cobrando dinero a cambio de agilizar trámites de licencias de construcción.',
 'en_proceso', NULL,
 '2026-05-29 08:30:00', NULL),

('PQRS-20260530-007', 'derecho_peticion',
 'Empresa Constructora Omega SAS', 'omega.sas@empresa.co',
 '━━━ DATOS DEL SOLICITANTE ━━━\nMunicipio: Medellín\nTeléfono: 6042345678\nDocumento: NIT 900123456-1\n\n━━━ DESCRIPCIÓN ━━━\nSolicitamos en calidad de proponentes en la licitación pública 003-2026 copia de los documentos de evaluación de ofertas para ejercer nuestro derecho de contradicción dentro del término legal.',
 'en_proceso', NULL,
 '2026-05-30 14:00:00', NULL),

-- ── PRÓXIMAS: 15 días hábiles desde ~2026-06-02 = ~2026-06-23 (+5d)
--              15 días hábiles desde ~2026-06-03 = ~2026-06-24 (+6d → borde próximo/a tiempo)
('PQRS-20260602-008', 'reclamo',
 'Asociación de Vecinos Barrio La Paz', 'asvecinos.lapaz@gmail.com',
 '━━━ DATOS DEL SOLICITANTE ━━━\nMunicipio: Medellín\nTeléfono: 3004567890\n\n━━━ DESCRIPCIÓN ━━━\nReclamamos ante la Empresa de Servicios Públicos Municipal por la suspensión injustificada del servicio de alumbrado público en la Calle 45 entre Carreras 12 y 18, desde hace 3 semanas.',
 'recibido', NULL,
 '2026-06-02 09:45:00', NULL),

('PQRS-20260601-009', 'sugerencia',
 'Anónimo', 'anonimo2@correo.co',
 '━━━ DATOS DEL SOLICITANTE ━━━\nMunicipio: Envigado\n\n━━━ DESCRIPCIÓN ━━━\nSugerencia anónima: sería muy útil que la alcaldía habilite un canal de WhatsApp para seguimiento de PQRS, dado que muchos ciudadanos no tienen acceso fácil al portal web.',
 'recibido', NULL,
 '2026-06-01 11:20:00', NULL),

-- ── A TIEMPO (vencen en más de 5 días) ──────────────────────
('PQRS-20260615-010', 'peticion',
 'Carlos Pérez', 'ciudadano@sigjep.co',
 '━━━ DATOS DEL SOLICITANTE ━━━\nMunicipio: Medellín\nTeléfono: 3001234567\nDocumento: Cédula de Ciudadanía 1023456789\n\n━━━ DESCRIPCIÓN ━━━\nSolicito información detallada sobre los requisitos y el proceso para acceder al programa de vivienda de interés social convocatoria 2026-2.',
 'en_proceso', NULL,
 '2026-06-05 08:00:00', DATE_ADD(CURDATE(), INTERVAL 8 DAY)),

('PQRS-20260615-011', 'queja',
 'Hernando Cárdenas', 'hcardenas@correo.co',
 '━━━ DATOS DEL SOLICITANTE ━━━\nMunicipio: Medellín\nTeléfono: 3167890123\nDocumento: Cédula de Ciudadanía 8765432\n\n━━━ DESCRIPCIÓN ━━━\nPresento queja por el mal trato recibido por parte de una servidora pública en la ventanilla de atención al ciudadano de la Secretaría de Hacienda el día 14 de junio de 2026.',
 'recibido', NULL,
 '2026-06-05 10:30:00', DATE_ADD(CURDATE(), INTERVAL 10 DAY)),

('PQRS-20260616-012', 'derecho_peticion',
 'Pedro Ramírez', 'pedro.ramirez@correo.co',
 '━━━ DATOS DEL SOLICITANTE ━━━\nMunicipio: Medellín\nDocumento: Cédula de Ciudadanía 98765432\n\n━━━ DESCRIPCIÓN ━━━\nEjerciendo mi derecho de petición consagrado en el artículo 23 de la Constitución Política y la Ley 1755 de 2015, solicito información sobre el estado del proceso de actualización catastral del municipio y si mi predio está incluido.',
 'recibido', NULL,
 '2026-06-06 09:00:00', DATE_ADD(CURDATE(), INTERVAL 12 DAY)),

('PQRS-20260617-013', 'queja',
 'María Torres', 'maria.torres@correo.co',
 '━━━ DATOS DEL SOLICITANTE ━━━\nMunicipio: Medellín\nTeléfono: 3205554433\n\n━━━ DESCRIPCIÓN ━━━\nQueja por demora excesiva en la atención del área de Tesorería. Fui citada para las 8 AM y fui atendida a las 11:30 AM sin ninguna justificación. Esto afecta directamente mi jornada laboral.',
 'recibido', NULL,
 '2026-06-07 08:00:00', DATE_ADD(CURDATE(), INTERVAL 15 DAY)),

('PQRS-20260617-014', 'peticion',
 'Luis Herrera', 'luis.herrera@correo.co',
 '━━━ DATOS DEL SOLICITANTE ━━━\nMunicipio: Medellín\nTeléfono: 3104449988\nDocumento: Cédula de Ciudadanía 71234567\n\nAsunto: Certificado de residencia\n\n━━━ DESCRIPCIÓN ━━━\nSolicito la expedición de un certificado de residencia para tramitar una beca universitaria. Llevo 8 años viviendo en el municipio y nunca he podido obtener dicho documento.',
 'en_proceso', NULL,
 '2026-06-07 11:00:00', DATE_ADD(CURDATE(), INTERVAL 18 DAY)),

('PQRS-20260617-015', 'sugerencia',
 'Ana Gómez', 'ana.gomez@correo.co',
 '━━━ DATOS DEL SOLICITANTE ━━━\nMunicipio: Medellín\nTeléfono: 3119876543\n\n━━━ DESCRIPCIÓN ━━━\nSugerencia: sería muy valioso que la alcaldía habilitara jornadas nocturnas de atención al ciudadano los martes y jueves, ya que muchas personas trabajamos en horario diurno y no podemos acceder a los servicios presenciales.',
 'recibido', NULL,
 '2026-06-08 09:30:00', DATE_ADD(CURDATE(), INTERVAL 20 DAY)),

('PQRS-20260617-016', 'reclamo',
 'Anónimo', 'anonimo3@correo.co',
 '━━━ DATOS DEL SOLICITANTE ━━━\nMunicipio: Bello\n\n━━━ DESCRIPCIÓN ━━━\nReclamo anónimo: en el parque principal del municipio se está permitiendo el consumo de sustancias psicoactivas a plena luz del día sin ninguna intervención de las autoridades locales. Esto afecta a los niños y familias que usan el espacio.',
 'en_proceso', NULL,
 '2026-06-08 14:00:00', DATE_ADD(CURDATE(), INTERVAL 22 DAY)),

-- ── RESPONDIDAS / CERRADAS (no deben aparecer en alertas) ───
('PQRS-20260603-003', 'reclamo',
 'Pedro Ramírez', 'pedro.ramirez@correo.co',
 '━━━ DATOS DEL SOLICITANTE ━━━\nMunicipio: Medellín\nDocumento: Cédula de Ciudadanía 98765432\n\n━━━ DESCRIPCIÓN ━━━\nReclamo por cobro indebido en el recibo del impuesto predial del primer trimestre del año 2026. Se facturó el doble del valor correspondiente al predio con matrícula inmobiliaria 004-32145.',
 'respondido',
 'Estimado señor Ramírez, luego de verificar en el sistema catastral se confirmó el error de facturación. Se emitió nota crédito por valor de $450.000 que será descontada del próximo período. Disculpe los inconvenientes causados.',
 '2026-06-05 09:00:00', '2026-06-24'),

('PQRS-20260608-004', 'sugerencia',
 'María Torres', 'maria.torres@correo.co',
 '━━━ DATOS DEL SOLICITANTE ━━━\nMunicipio: Medellín\nTeléfono: 3205554433\n\n━━━ DESCRIPCIÓN ━━━\nSugiero implementar un sistema de turnos en línea para la atención en la secretaría de hacienda, con el fin de evitar largas filas y optimizar el tiempo de los ciudadanos.',
 'recibido', NULL,
 '2026-06-08 10:00:00', DATE_ADD(CURDATE(), INTERVAL 25 DAY)),

('PQRS-20260610-005', 'peticion',
 'Luis Herrera', 'luis.herrera@correo.co',
 '━━━ DATOS DEL SOLICITANTE ━━━\nMunicipio: Medellín\nDocumento: Cédula de Ciudadanía 71234567\n\n━━━ DESCRIPCIÓN ━━━\nSolicito copia del acta de la última sesión ordinaria del concejo municipal correspondiente al mes de mayo de 2026, en ejercicio del derecho de acceso a documentos públicos.',
 'cerrado',
 'En atención a su petición se adjunta digitalmente el acta de la sesión ordinaria del Concejo Municipal del 28 de mayo de 2026. Puede descargarla en el portal de transparencia de la alcaldía.',
 '2026-06-10 08:30:00', '2026-06-27');

-- ============================================================
-- 5. DOCUMENTOS (vinculados a expedientes)
-- ============================================================
INSERT INTO `documentos`
  (`nombre_archivo`, `ruta`, `tipo_formato`, `id_expediente`, `subido_por`, `estado`)
VALUES
-- EXP-001 (Tutela García vs EPS)
('tutela_garcia_eps.pdf',             'uploads/tutela_garcia_eps.pdf',             'pdf',  1, 1, 'borrador'),
('poder_notarial_garcia.pdf',         'uploads/poder_notarial_garcia.pdf',         'pdf',  1, 5, 'enviado'),
('historia_clinica_garcia.pdf',       'uploads/historia_clinica_garcia.pdf',       'pdf',  1, 2, 'borrador'),

-- EXP-002 (Tutela familia López)
('tutela_familia_lopez.pdf',          'uploads/tutela_familia_lopez.pdf',          'pdf',  2, 5, 'enviado'),
('registro_desplazamiento_lopez.pdf', 'uploads/registro_desplazamiento_lopez.pdf', 'pdf',  2, 3, 'borrador'),

-- EXP-003 (Derecho petición catastral)
('derecho_peticion_catastral.docx',   'uploads/derecho_peticion_catastral.docx',   'docx', 3, 5, 'borrador'),

-- EXP-004 (Demanda contrato 045)
('demanda_contrato_045.pdf',          'uploads/demanda_contrato_045.pdf',          'pdf',  4, 5, 'enviado'),
('contrato_045_original.pdf',         'uploads/contrato_045_original.pdf',         'pdf',  4, 5, 'enviado'),
('acta_incumplimiento_045.pdf',       'uploads/acta_incumplimiento_045.pdf',       'pdf',  4, 2, 'borrador'),

-- EXP-005 (Tutela educación)
('tutela_educacion_rodriguez.pdf',    'uploads/tutela_educacion_rodriguez.pdf',    'pdf',  5, 3, 'borrador'),
('registro_civil_sofia.pdf',          'uploads/registro_civil_sofia.pdf',          'pdf',  5, 5, 'borrador'),

-- EXP-007 (PQRS acueducto)
('queja_acueducto_porvenir.pdf',      'uploads/queja_acueducto_porvenir.pdf',      'pdf',  7, 5, 'enviado'),

-- EXP-008 (Demanda sindicato)
('demanda_sindicato.pdf',             'uploads/demanda_sindicato.pdf',             'pdf',  8, 2, 'enviado'),
('convencion_colectiva_2024.pdf',     'uploads/convencion_colectiva_2024.pdf',     'pdf',  8, 2, 'borrador'),

-- EXP-011 (Tutela pensional)
('tutela_pension_cardenas.pdf',       'uploads/tutela_pension_cardenas.pdf',       'pdf',  11, 2, 'borrador'),
('historia_laboral_cardenas.pdf',     'uploads/historia_laboral_cardenas.pdf',     'pdf',  11, 5, 'borrador'),

-- EXP-009 (Tutela agua vereda)
('tutela_agua_esperanza.pdf',         'uploads/tutela_agua_esperanza.pdf',         'pdf',  9,  3, 'enviado'),
('informe_tecnico_acueducto.pdf',     'uploads/informe_tecnico_acueducto.pdf',     'pdf',  9,  3, 'borrador'),

-- EXP-012 (Demanda nulidad electoral)
('demanda_nulidad_electoral.pdf',     'uploads/demanda_nulidad_electoral.pdf',     'pdf',  12, 3, 'enviado'),
('acta_concejo_018.pdf',              'uploads/acta_concejo_018.pdf',              'pdf',  12, 5, 'enviado'),

-- EXP-014 (Concepto jurídico convenio)
('concepto_convenio_sena.docx',       'uploads/concepto_convenio_sena.docx',       'docx', 14, 2, 'borrador'),

-- EXP-016 (Tutela cerrada)
('sentencia_tutela_martinez.pdf',     'uploads/sentencia_tutela_martinez.pdf',     'pdf',  16, 3, 'enviado'),
('auto_cumplimiento_eps.pdf',         'uploads/auto_cumplimiento_eps.pdf',         'pdf',  16, 3, 'enviado'),

-- EXP-019 (Tutela periodista)
('tutela_acceso_informacion.pdf',     'uploads/tutela_acceso_informacion.pdf',     'pdf',  19, 3, 'borrador'),

-- EXP-020 (Demanda inundación)
('demanda_responsabilidad_jardin.pdf','uploads/demanda_responsabilidad_jardin.pdf','pdf',  20, 4, 'borrador'),
('peritaje_danos_jardin.pdf',         'uploads/peritaje_danos_jardin.pdf',         'pdf',  20, 5, 'borrador'),
('registro_fotografico_inundacion.pdf','uploads/registro_fotografico_inundacion.pdf','pdf',20, 6, 'borrador');

-- ============================================================
-- 6. AUDITORÍA
-- ============================================================
INSERT INTO `auditoria`
  (`nombre_usuario`, `rol`, `accion`, `tabla_afectada`, `id_registro`, `detalle`, `ip_address`, `resultado`)
VALUES
('Manuel Rodríguez', 'administrador', 'CREAR',  'usuarios',    '2',  'Nuevo usuario: Laura Jiménez | email: abogado@sigjep.co | rol: abogado',                     '192.168.1.10', 'exitoso'),
('Manuel Rodríguez', 'administrador', 'CREAR',  'usuarios',    '3',  'Nuevo usuario: Andrés Castellanos | email: acastellanos@sigjep.co | rol: abogado',            '192.168.1.10', 'exitoso'),
('Manuel Rodríguez', 'administrador', 'CREAR',  'usuarios',    '4',  'Nuevo usuario: Patricia Vargas | email: pvargas@sigjep.co | rol: abogado',                    '192.168.1.10', 'exitoso'),
('Manuel Rodríguez', 'administrador', 'CREAR',  'usuarios',    '5',  'Nuevo usuario: Sofía Morales | email: secretaria@sigjep.co | rol: secretaria',                '192.168.1.10', 'exitoso'),
('Manuel Rodríguez', 'administrador', 'CREAR',  'usuarios',    '6',  'Nuevo usuario: Jorge Quintero | email: jquintero@sigjep.co | rol: secretaria',                '192.168.1.10', 'exitoso'),
('Manuel Rodríguez', 'administrador', 'EDITAR', 'usuarios',    '7',  'Estado cambiado: Roberto Salcedo | activo → inactivo',                                        '192.168.1.10', 'exitoso'),
('Sofía Morales',    'secretaria',    'CREAR',  'casos',       '1',  'Caso creado: Tutela derecho a la salud — García vs EPS | tipo: tutela | prioridad: urgente',  '192.168.1.15', 'exitoso'),
('Sofía Morales',    'secretaria',    'CREAR',  'casos',       '2',  'Caso creado: Tutela derecho a la vivienda — Familia López | tipo: tutela',                    '192.168.1.15', 'exitoso'),
('Sofía Morales',    'secretaria',    'CREAR',  'expedientes', '1',  'Expediente EXP-001 creado para caso id: 1',                                                   '192.168.1.15', 'exitoso'),
('Sofía Morales',    'secretaria',    'CREAR',  'expedientes', '2',  'Expediente EXP-002 creado para caso id: 2',                                                   '192.168.1.15', 'exitoso'),
('Laura Jiménez',    'abogado',       'EDITAR', 'casos',       '8',  'estado: activo → en_proceso',                                                                 '192.168.1.20', 'exitoso'),
('Andrés Castellanos','abogado',      'EDITAR', 'casos',       '12', 'estado: activo → en_proceso',                                                                 '192.168.1.21', 'exitoso'),
('Laura Jiménez',    'abogado',       'EDITAR', 'casos',       '16', 'estado: en_proceso → cerrado | resolución favorable',                                         '192.168.1.20', 'exitoso'),
('Patricia Vargas',  'abogado',       'EDITAR', 'casos',       '17', 'estado: activo → archivado | acuerdo de pago alcanzado',                                      '192.168.1.22', 'exitoso'),
('Sofía Morales',    'secretaria',    'CREAR',  'pqrs',        '3',  'PQRS respondida: PQRS-20260605-003 | ciudadano: Pedro Ramírez',                               '192.168.1.15', 'exitoso'),
('Manuel Rodríguez', 'administrador', 'CREAR',  'backups_log', '1',  'Backup generado exitosamente y subido a Google Drive',                                        '192.168.1.10', 'exitoso');

-- ============================================================
-- 7. BACKUPS LOG
-- ============================================================
INSERT INTO `backups_log`
  (`archivo`, `link_drive`, `creado_por`, `estado`, `fecha`)
VALUES
('backup_sigjep_20260601.sql', 'https://drive.google.com/file/d/ejemplo1', 1, 'exitoso', '2026-06-01 08:00:00'),
('backup_sigjep_20260608.sql', 'https://drive.google.com/file/d/ejemplo2', 1, 'exitoso', '2026-06-08 08:00:00'),
('backup_sigjep_20260615.sql', 'https://drive.google.com/file/d/ejemplo3', 1, 'exitoso', '2026-06-15 08:00:00');

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- RESUMEN DE ACCESO
-- ============================================================
-- | Usuario              | Email                      | Contraseña | Rol           |
-- |----------------------|----------------------------|------------|---------------|
-- | Manuel Rodríguez     | admin@sigjep.co            | Sena2026   | administrador |
-- | Laura Jiménez        | abogado@sigjep.co          | Sena2026   | abogado       |
-- | Andrés Castellanos   | acastellanos@sigjep.co     | Sena2026   | abogado       |
-- | Patricia Vargas      | pvargas@sigjep.co          | Sena2026   | abogado       |
-- | Sofía Morales        | secretaria@sigjep.co       | Sena2026   | secretaria    |
-- | Jorge Quintero       | jquintero@sigjep.co        | Sena2026   | secretaria    |
-- | Roberto Salcedo      | rsalcedo@sigjep.co         | Sena2026   | abogado (inactivo)    |
-- | Claudia Restrepo     | crestrepo@sigjep.co        | Sena2026   | secretaria (inactiva) |
-- | Carlos Pérez         | ciudadano@sigjep.co        | Sena2026   | ciudadano     |
-- | Ana Gómez            | ana.gomez@correo.co        | Sena2026   | ciudadano     |
-- | Pedro Ramírez        | pedro.ramirez@correo.co    | Sena2026   | ciudadano     |
-- | María Torres         | maria.torres@correo.co     | Sena2026   | ciudadano     |
-- | Luis Herrera         | luis.herrera@correo.co     | Sena2026   | ciudadano     |
-- ============================================================
-- RESUMEN DE DATOS
-- ============================================================
-- Usuarios: 13 (1 admin, 3 abogados, 2 secretarias, 2 inactivos, 5 ciudadanos)
-- Casos: 23 (3 urgentes, 4 próximos, 13 a tiempo/en proceso, 3 cerrados/archivados)
-- Expedientes: 23 (uno por caso)
-- Documentos: 30 (distribuidos en varios expedientes)
-- PQRS: 16 (con fecha_vencimiento: 2 vencidas, 2 urgentes, 2 próximas, 7 a tiempo, 1 respondida, 1 cerrada, 1 sin alerta)
-- Auditoría: 16 registros
-- Backups: 3 registros
-- ============================================================
