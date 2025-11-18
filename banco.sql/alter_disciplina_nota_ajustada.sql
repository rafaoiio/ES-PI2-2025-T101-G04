-- VITOR
-- Adiciona campo para habilitar Notas Finais Ajustadas por disciplina

ALTER TABLE DISCIPLINA ADD (
  NOTA_FINAL_AJUSTADA_HABILITADA NUMBER(1) DEFAULT 0 CHECK (NOTA_FINAL_AJUSTADA_HABILITADA IN (0, 1))
);

COMMENT ON COLUMN DISCIPLINA.NOTA_FINAL_AJUSTADA_HABILITADA IS 'Indica se Notas Finais Ajustadas estão habilitadas para esta disciplina';

