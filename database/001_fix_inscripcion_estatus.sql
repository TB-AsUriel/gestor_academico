USE gestor_academico;

ALTER TABLE inscripcion
  DROP CONSTRAINT ck_insc_estatus,
  ADD CONSTRAINT ck_insc_estatus CHECK (estatus IN ('ACTIVO','INSCRITO','BAJA'));

ALTER TABLE inscripcion
  MODIFY estatus varchar(15) NOT NULL DEFAULT 'ACTIVO';
