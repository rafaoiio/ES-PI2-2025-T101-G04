-- PEDRO
-- Trigger de Auditoria para NOTA
-- Autor: Sistema NotaDez
-- Descrição: Grava em AUDITORIA_NOTA todas as alterações em NOTA

CREATE OR REPLACE TRIGGER trg_auditoria_nota
AFTER INSERT OR UPDATE ON NOTA
FOR EACH ROW
DECLARE
  v_ra NUMBER;
  v_nome VARCHAR2(120);
  v_sigla VARCHAR2(20);
  v_mensagem VARCHAR2(1000);
BEGIN
  -- Buscar RA e Nome do aluno
  SELECT a.RA, a.NOME
  INTO v_ra, v_nome
  FROM ALUNO a
  JOIN MATRICULA m ON a.RA = m.RA
  WHERE m.ID_MATRICULA = :NEW.ID_MATRICULA;

  -- Buscar sigla do componente
  SELECT SIGLA
  INTO v_sigla
  FROM COMPONENTE_NOTA
  WHERE ID_COMPONENTE = :NEW.ID_COMPONENTE;

  -- Formatar mensagem
  IF INSERTING THEN
    v_mensagem := TO_CHAR(SYSDATE, 'DD/MM/YYYY HH24:MI:SS') || 
                  ' - (Aluno ' || v_ra || ' - ' || v_nome || ') - ' || 
                  v_sigla || ': -- -> ' || TO_CHAR(:NEW.VALOR, 'FM999.00');
  ELSIF UPDATING THEN
    v_mensagem := TO_CHAR(SYSDATE, 'DD/MM/YYYY HH24:MI:SS') || 
                  ' - (Aluno ' || v_ra || ' - ' || v_nome || ') - ' || 
                  v_sigla || ': ' || TO_CHAR(:OLD.VALOR, 'FM999.00') || 
                  ' -> ' || TO_CHAR(:NEW.VALOR, 'FM999.00');
  END IF;

  -- Inserir na auditoria
  INSERT INTO AUDITORIA_NOTA (ID_NOTA, MENSAGEM, DATA_HORA)
  VALUES (:NEW.ID_NOTA, v_mensagem, SYSTIMESTAMP);
END;
/

