-- ============================================================
--  DATOS DE PRUEBA — SIGJEP
--  Contraseña de TODOS los usuarios: Sena2026
--  Ejecutar DESPUÉS de schema.sql
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. USUARIOS
-- ============================================================
INSERT INTO `usuarios` (`nombre`, `email`, `password`, `rol`, `estado`) VALUES
('Manuel Rodríguez',  'admin@sigjep.co',      '$2b$12$/53fbDoy6H2O/cV9l8ssPeOX2WdFBRtHan48hbqZw8TDYfF/Y/t3i', 'administrador', 'activo'),
('Laura Jiménez',     'abogado@sigjep.co',    '$2b$12$LD/YK3g1WUVEMfrm6ApBOuDNaf8n3U6KavkdIxJd4xtSE4ZDuy2tW', 'abogado',        'activo'),
('Sofía Morales',     'secretaria@sigjep.co', '$2b$12$U5q61dM7c1M1.2Q2jCgkX.cxOQhGYqwv0h99SSU8SiQRrOMAK.N9e', 'secretaria',     'activo'),
('Carlos Pérez',      'ciudadano@sigjep.co',  '$2b$12$w5jqHavamidy6Tjb4k8g/.FlpaNLGkbz2bQEprcNRNFxwbhPwHxg.', 'ciudadano',      'activo');

-- ============================================================
-- 2. CASOS (distintos tipos y estados de vencimiento)
-- ============================================================
INSERT INTO `casos`
  (`tipo`, `titulo`, `descripcion`, `estado`, `fecha_vencimiento`, `id_abogado_asignado`)
VALUES
-- Urgentes (vencen en 1-2 días)
('tutela',
 'Tutela derecho a la salud — García vs EPS',
 'El accionante solicita amparo del derecho fundamental a la salud por negativa de la EPS a suministrar medicamentos de alto costo.',
 'activo',
 DATE_ADD(CURDATE(), INTERVAL 1 DAY),
 2),

('tutela',
 'Tutela derecho a la vivienda — Familia López',
 'Familia en situación de desplazamiento solicita amparo del derecho a la vivienda digna ante omisión de la alcaldía.',
 'activo',
 DATE_ADD(CURDATE(), INTERVAL 2 DAY),
 2),

-- Próximos (vencen en 3-5 días)
('demanda',
 'Demanda contencioso-administrativa — Contrato 045',
 'Demanda por incumplimiento de contrato de obra pública número 045 del año 2025 por parte del contratista.',
 'activo',
 DATE_ADD(CURDATE(), INTERVAL 4 DAY),
 2),

('derecho_peticion',
 'Derecho de petición — Certificado laboral Martínez',
 'Ciudadano solicita certificado de tiempo de servicio ante la negativa reiterada de la entidad de expedir el documento.',
 'activo',
 DATE_ADD(CURDATE(), INTERVAL 5 DAY),
 2),

-- A tiempo (vencen en más de 5 días)
('demanda',
 'Demanda ordinaria laboral — Sindicato Municipal',
 'Sindicato de trabajadores municipales interpone demanda por presunto incumplimiento de convención colectiva.',
 'activo',
 DATE_ADD(CURDATE(), INTERVAL 15 DAY),
 2),

('tutela',
 'Tutela derecho a la educación — Menor Rodríguez',
 'Acción de tutela para garantizar acceso a cupo escolar en institución pública del municipio.',
 'activo',
 DATE_ADD(CURDATE(), INTERVAL 20 DAY),
 2),

('derecho_peticion',
 'Derecho de petición — Licencia de construcción',
 'Ciudadano solicita información sobre estado de trámite de licencia de construcción radicada hace 45 días.',
 'activo',
 DATE_ADD(CURDATE(), INTERVAL 10 DAY),
 NULL),

-- Cerrados y archivados
('tutela',
 'Tutela derecho al agua — Vereda La Esperanza',
 'Comunidad rural solicita amparo del derecho al agua potable. CASO RESUELTO por juez de primera instancia.',
 'cerrado',
 DATE_ADD(CURDATE(), INTERVAL -10 DAY),
 2),

('demanda',
 'Demanda reparación directa — Accidente vía terciaria',
 'Demanda por daños y perjuicios ocasionados en accidente de tránsito en vía a cargo del municipio. ARCHIVADO.',
 'archivado',
 DATE_ADD(CURDATE(), INTERVAL -30 DAY),
 2);

-- ============================================================
-- 3. EXPEDIENTES (uno por caso)
-- ============================================================
INSERT INTO `expedientes` (`id_caso`) VALUES
(1),(2),(3),(4),(5),(6),(7),(8),(9);

-- ============================================================
-- 4. PQRS
-- ============================================================
INSERT INTO `pqrs`
  (`numero_radicado`, `tipo`, `nombre_solicitante`, `tipo_documento`,
   `numero_documento`, `correo`, `municipio`, `descripcion`, `estado`)
VALUES
('PQRS-20260601-001', 'peticion',   'Carlos Pérez',      'cedula', '10234567',
 'ciudadano@sigjep.co', 'Medellín',
 'Solicito información sobre el estado de mi pensión de jubilación radicada el pasado mes de febrero.',
 'recibido'),

('PQRS-20260603-002', 'queja',      'Ana Gómez',         'cedula', '20345678',
 'ana.gomez@gmail.com', 'Bello',
 'Presento queja formal por mal estado de la vía principal del barrio Las Flores. Lleva 3 meses sin reparación.',
 'en_proceso'),

('PQRS-20260605-003', 'reclamo',    'Pedro Ramírez',     'cedula', '30456789',
 'pedro.ramirez@outlook.com', 'Itagüí',
 'Reclamo por cobro indebido en el recibo del impuesto predial del primer trimestre del año 2026.',
 'respondido'),

('PQRS-20260608-004', 'sugerencia', 'María Torres',      'cedula', '40567890',
 'maria.torres@yahoo.com', 'Envigado',
 'Sugiero implementar un sistema de turnos en línea para la atención en la secretaría de hacienda.',
 'recibido'),

('PQRS-20260610-005', 'peticion',   'Luis Herrera',      'cedula', '50678901',
 'luis.herrera@gmail.com', 'Sabaneta',
 'Solicito copia del acta de la última sesión del concejo municipal.',
 'cerrado');

-- ============================================================
-- 5. DOCUMENTOS (vinculados a expedientes)
-- ============================================================
INSERT INTO `documentos`
  (`nombre_archivo`, `ruta_archivo`, `tipo_archivo`, `id_expediente`, `enviado`)
VALUES
('tutela_garcia_eps.pdf',          'uploads/tutela_garcia_eps.pdf',          'application/pdf', 1, 0),
('poder_notarial_garcia.pdf',      'uploads/poder_notarial_garcia.pdf',      'application/pdf', 1, 0),
('tutela_familia_lopez.pdf',       'uploads/tutela_familia_lopez.pdf',       'application/pdf', 2, 1),
('demanda_contrato_045.pdf',       'uploads/demanda_contrato_045.pdf',       'application/pdf', 3, 0),
('contrato_045_original.pdf',      'uploads/contrato_045_original.pdf',      'application/pdf', 3, 0),
('derecho_peticion_martinez.docx', 'uploads/derecho_peticion_martinez.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 4, 0),
('demanda_sindicato.pdf',          'uploads/demanda_sindicato.pdf',          'application/pdf', 5, 1),
('tutela_educacion_rodriguez.pdf', 'uploads/tutela_educacion_rodriguez.pdf', 'application/pdf', 6, 0);

-- ============================================================
-- 6. AUDITORÍA
-- ============================================================
INSERT INTO `auditoria`
  (`nombre_usuario`, `rol`, `accion`, `tabla_afectada`, `id_registro`, `detalle`, `ip_address`, `resultado`)
VALUES
('Manuel Rodríguez', 'administrador', 'CREAR',  'usuarios',    '2', 'Nuevo usuario: Laura Jiménez | email: abogado@sigjep.co | rol: abogado',             '192.168.1.10', 'exitoso'),
('Manuel Rodríguez', 'administrador', 'CREAR',  'usuarios',    '3', 'Nuevo usuario: Sofía Morales | email: secretaria@sigjep.co | rol: secretaria',        '192.168.1.10', 'exitoso'),
('Manuel Rodríguez', 'administrador', 'CREAR',  'usuarios',    '4', 'Nuevo usuario: Carlos Pérez | email: ciudadano@sigjep.co | rol: ciudadano',           '192.168.1.10', 'exitoso'),
('Sofía Morales',    'secretaria',    'CREAR',  'expedientes', '1', 'Expediente EXP-001 creado para caso: Tutela derecho a la salud — García vs EPS',      '192.168.1.15', 'exitoso'),
('Sofía Morales',    'secretaria',    'CREAR',  'expedientes', '2', 'Expediente EXP-002 creado para caso: Tutela derecho a la vivienda — Familia López',   '192.168.1.15', 'exitoso'),
('Laura Jiménez',    'abogado',       'EDITAR', 'casos',       '3', 'estado: activo → en_proceso',                                                         '192.168.1.20', 'exitoso'),
('Manuel Rodríguez', 'administrador', 'BORRAR', 'usuarios',    '5', 'Usuario eliminado: prueba@test.com | rol: ciudadano',                                  '192.168.1.10', 'exitoso'),
('Laura Jiménez',    'abogado',       'EDITAR', 'casos',       '8', 'estado: activo → cerrado',                                                             '192.168.1.20', 'exitoso');

-- ============================================================
-- 7. BACKUPS LOG
-- ============================================================
INSERT INTO `backups_log`
  (`nombre_archivo`, `link_drive`, `fecha_creacion`)
VALUES
('backup_sigjep_20260601.sql', 'https://drive.google.com/file/d/ejemplo1', '2026-06-01 08:00:00'),
('backup_sigjep_20260608.sql', 'https://drive.google.com/file/d/ejemplo2', '2026-06-08 08:00:00'),
('backup_sigjep_20260615.sql', 'https://drive.google.com/file/d/ejemplo3', '2026-06-15 08:00:00');

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- RESUMEN DE ACCESO
-- ============================================================
-- | Usuario           | Email                    | Contraseña | Rol           |
-- |-------------------|--------------------------|------------|---------------|
-- | Manuel Rodríguez  | admin@sigjep.co          | Sena2026   | administrador |
-- | Laura Jiménez     | abogado@sigjep.co        | Sena2026   | abogado       |
-- | Sofía Morales     | secretaria@sigjep.co     | Sena2026   | secretaria    |
-- | Carlos Pérez      | ciudadano@sigjep.co      | Sena2026   | ciudadano     |
-- ============================================================
