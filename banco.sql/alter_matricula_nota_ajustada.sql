-- VITOR
-- Adiciona campo para Nota Final Ajustada na matrícula

ALTER TABLE matricula ADD (
  nota_final_ajustada NUMBER(5,2) CHECK (nota_final_ajustada IS NULL OR (nota_final_ajustada >= 0 AND nota_final_ajustada <= 10))
);

COMMENT ON COLUMN matricula.nota_final_ajustada IS 'Nota Final Ajustada editada manualmente (apenas múltiplos de 0,5)';

