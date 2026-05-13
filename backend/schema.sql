-- ════════════════════════════════════════════════════════
-- SIGJEP — Base de datos sigjep_db
-- Schema oficial. Ejecutar después de DROP DATABASE.
-- ════════════════════════════════════════════════════════

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- ════════════════════════════════════════════════════════
-- 1. usuarios
-- ════════════════════════════════════════════════════════
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id_usuarios` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `rol` enum('abogado','secretaria','admin', 'administrador','ciudadano') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` enum('activo','inactivo') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'activo',
  PRIMARY KEY (`id_usuarios`),
  UNIQUE KEY `uk_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ════════════════════════════════════════════════════════
-- 2. casos
-- Cambio: tipo ahora es ENUM. Conservada fecha_vencimiento.
-- Nuevo: fecha_modificacion automática.
-- ════════════════════════════════════════════════════════
DROP TABLE IF EXISTS `casos`;
CREATE TABLE `casos` (
  `id_caso` int NOT NULL AUTO_INCREMENT,
  `tipo` enum('tutela','demanda','pqrs','derecho_peticion','otro') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` enum('activo','en_proceso','cerrado','archivado') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'activo',
  `fecha_radicacion` date NOT NULL,
  `id_usuario_creador` int NOT NULL,
  `titulo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Sin titulo',
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `prioridad` enum('baja','media','alta','urgente') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'media',
  `fecha_vencimiento` date DEFAULT NULL,
  `id_abogado_asignado` int DEFAULT NULL,
  `fecha_modificacion` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_caso`),
  KEY `id_usuario_creador` (`id_usuario_creador`),
  KEY `fk_casos_abogado` (`id_abogado_asignado`),
  KEY `idx_casos_fecha` (`fecha_radicacion`),
  KEY `idx_casos_estado` (`estado`),
  CONSTRAINT `fk_casos_abogado` FOREIGN KEY (`id_abogado_asignado`) REFERENCES `usuarios` (`id_usuarios`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_casos_usuario` FOREIGN KEY (`id_usuario_creador`) REFERENCES `usuarios` (`id_usuarios`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ════════════════════════════════════════════════════════
-- 3. expedientes
-- Nuevo: fecha_modificacion automática.
-- ════════════════════════════════════════════════════════
DROP TABLE IF EXISTS `expedientes`;
CREATE TABLE `expedientes` (
  `id_expediente` int NOT NULL AUTO_INCREMENT,
  `id_caso` int NOT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_expediente`),
  KEY `id_caso` (`id_caso`),
  CONSTRAINT `fk_expedientes_caso` FOREIGN KEY (`id_caso`) REFERENCES `casos` (`id_caso`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ════════════════════════════════════════════════════════
-- 4. documentos
-- Nuevo: fecha_modificacion automática.
-- ════════════════════════════════════════════════════════
DROP TABLE IF EXISTS `documentos`;
CREATE TABLE `documentos` (
  `id_documento` int NOT NULL AUTO_INCREMENT,
  `id_expediente` int NOT NULL,
  `nombre_archivo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_formato` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ruta` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_subida` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `subido_por` int NOT NULL,
  `fecha_modificacion` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_documento`),
  KEY `id_expediente` (`id_expediente`),
  KEY `subido_por` (`subido_por`),
  CONSTRAINT `fk_documentos_expediente` FOREIGN KEY (`id_expediente`) REFERENCES `expedientes` (`id_expediente`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_documentos_usuario` FOREIGN KEY (`subido_por`) REFERENCES `usuarios` (`id_usuarios`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ════════════════════════════════════════════════════════
-- 5. ia_resumenes
-- ════════════════════════════════════════════════════════
DROP TABLE IF EXISTS `ia_resumenes`;
CREATE TABLE `ia_resumenes` (
  `id_resumen` int NOT NULL AUTO_INCREMENT,
  `id_documento` int NOT NULL,
  `contenido_resumen` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_generacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_resumen`),
  KEY `id_documento` (`id_documento`),
  CONSTRAINT `fk_resumenes_documento` FOREIGN KEY (`id_documento`) REFERENCES `documentos` (`id_documento`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ════════════════════════════════════════════════════════
-- 6. borradores_respuesta
-- ════════════════════════════════════════════════════════
DROP TABLE IF EXISTS `borradores_respuesta`;
CREATE TABLE `borradores_respuesta` (
  `id_borrador` int NOT NULL AUTO_INCREMENT,
  `id_caso` int NOT NULL,
  `contenido` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` enum('pendiente','aprobado','modificado') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendiente',
  PRIMARY KEY (`id_borrador`),
  KEY `id_caso` (`id_caso`),
  CONSTRAINT `fk_borradores_caso` FOREIGN KEY (`id_caso`) REFERENCES `casos` (`id_caso`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ════════════════════════════════════════════════════════
-- 7. alertas
-- ════════════════════════════════════════════════════════
DROP TABLE IF EXISTS `alertas`;
CREATE TABLE `alertas` (
  `id_alerta` int NOT NULL AUTO_INCREMENT,
  `id_caso` int NOT NULL,
  `tipo` enum('urgente','proximo','a_tiempo') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `leida` tinyint(1) DEFAULT '0',
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_alerta`),
  KEY `id_caso` (`id_caso`),
  CONSTRAINT `alertas_ibfk_1` FOREIGN KEY (`id_caso`) REFERENCES `casos` (`id_caso`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ════════════════════════════════════════════════════════
-- 8. pqrs
-- Nuevo: fecha_vencimiento (Ley 1437 - plazos legales).
-- ════════════════════════════════════════════════════════
DROP TABLE IF EXISTS `pqrs`;
CREATE TABLE `pqrs` (
  `id_pqrs` int NOT NULL AUTO_INCREMENT,
  `numero_radicado` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_ciudadano` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `correo` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('peticion','queja','reclamo','sugerencia','derecho_peticion') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` enum('recibido','en_proceso','respondido','cerrado') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'recibido',
  `id_caso` int DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_vencimiento` date DEFAULT NULL,
  PRIMARY KEY (`id_pqrs`),
  UNIQUE KEY `uk_numero_radicado` (`numero_radicado`),
  KEY `id_caso` (`id_caso`),
  CONSTRAINT `pqrs_ibfk_1` FOREIGN KEY (`id_caso`) REFERENCES `casos` (`id_caso`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ════════════════════════════════════════════════════════
-- 9. log_auditoria
-- ════════════════════════════════════════════════════════
DROP TABLE IF EXISTS `log_auditoria`;
CREATE TABLE `log_auditoria` (
  `id_log` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  `accion` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tabla_afectada` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_registro` int DEFAULT NULL,
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_log`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `log_auditoria_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuarios`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ════════════════════════════════════════════════════════
-- 10. backups_log
-- ════════════════════════════════════════════════════════
DROP TABLE IF EXISTS `backups_log`;
CREATE TABLE `backups_log` (
  `id_backup` int NOT NULL AUTO_INCREMENT,
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  `archivo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `link_drive` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_por` int NOT NULL,
  `estado` enum('exitoso','fallido') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_backup`),
  KEY `fk_backups_usuario` (`creado_por`),
  CONSTRAINT `fk_backups_usuario` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuarios`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ════════════════════════════════════════════════════════
-- 11. password_reset_tokens
-- Collation unificada con el resto.
-- ════════════════════════════════════════════════════════
DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE `password_reset_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `usado` tinyint(1) NOT NULL DEFAULT '0',
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_expiracion` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `password_reset_tokens_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuarios`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;