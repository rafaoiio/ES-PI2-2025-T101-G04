-- LAURA
-- Tabela para tokens de recuperação de senha
-- Sistema de recuperação de senha
CREATE TABLE password_reset_token (
  id_token NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_professor NUMBER NOT NULL,
  token VARCHAR2(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used NUMBER(1) DEFAULT 0 CHECK (used IN (0, 1)),
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP,
  CONSTRAINT fk_reset_token_professor FOREIGN KEY (id_professor) REFERENCES professor(id_professor)
);
CREATE INDEX ix_reset_token_token ON password_reset_token(token);
CREATE INDEX ix_reset_token_professor ON password_reset_token(id_professor);