-- Migración: cumplimiento Ley 1581 de 2012 — columnas de trazabilidad
-- Ejecutar una sola vez en la base de datos

ALTER TABLE auditoria
  ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45) DEFAULT NULL COMMENT 'IP del cliente — trazabilidad Ley 1581',
  ADD COLUMN IF NOT EXISTS resultado VARCHAR(20) DEFAULT 'exitoso' COMMENT 'exitoso | fallido';
