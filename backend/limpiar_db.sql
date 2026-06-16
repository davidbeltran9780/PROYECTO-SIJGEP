-- ============================================================
--  LIMPIAR BASE DE DATOS — SIGJEP
--  Borra todos los datos pero conserva la estructura
--  Ejecutar en MySQL Workbench sobre sigjep_db
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE `auditoria`;
TRUNCATE TABLE `alertas`;
TRUNCATE TABLE `documentos`;
TRUNCATE TABLE `ia_resumenes`;
TRUNCATE TABLE `borradores_respuesta`;
TRUNCATE TABLE `expedientes`;
TRUNCATE TABLE `casos`;
TRUNCATE TABLE `pqrs`;
TRUNCATE TABLE `backups_log`;
TRUNCATE TABLE `password_reset_tokens`;
TRUNCATE TABLE `log_auditoria`;
TRUNCATE TABLE `usuarios`;

SET FOREIGN_KEY_CHECKS = 1;

-- Verificar que quedó vacío
SELECT 'usuarios'    AS tabla, COUNT(*) AS registros FROM usuarios    UNION ALL
SELECT 'casos',               COUNT(*)               FROM casos       UNION ALL
SELECT 'expedientes',         COUNT(*)               FROM expedientes UNION ALL
SELECT 'documentos',          COUNT(*)               FROM documentos  UNION ALL
SELECT 'pqrs',                COUNT(*)               FROM pqrs        UNION ALL
SELECT 'auditoria',           COUNT(*)               FROM auditoria   UNION ALL
SELECT 'backups_log',         COUNT(*)               FROM backups_log;
