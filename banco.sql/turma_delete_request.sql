-- RAFAEL
-- Tabela para solicitações de exclusão de turmas
-- Sistema de exclusão de turmas com confirmação por email

CREATE TABLE turma_delete_request (
  id_request          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_turma           NUMBER NOT NULL,
  id_professor       NUMBER NOT NULL,
  token              VARCHAR2(255) NOT NULL,
  has_notas          NUMBER(1) DEFAULT 0 CHECK (has_notas IN (0, 1)),
  confirmed          NUMBER(1) DEFAULT 0 CHECK (confirmed IN (0, 1)),
  deleted            NUMBER(1) DEFAULT 0 CHECK (deleted IN (0, 1)),
  expires_at         TIMESTAMP NOT NULL,
  created_at         TIMESTAMP DEFAULT SYSTIMESTAMP,
  confirmed_at       TIMESTAMP NULL,
  
  CONSTRAINT fk_delete_request_turma
    FOREIGN KEY (id_turma) REFERENCES turma(id_turma),
  CONSTRAINT fk_delete_request_professor
    FOREIGN KEY (id_professor) REFERENCES professor(id_professor)
);

CREATE INDEX ix_delete_request_token ON turma_delete_request(token);
CREATE INDEX ix_delete_request_turma ON turma_delete_request(id_turma);

