-- LUCAS
-- Adiciona coluna CODIGO na tabela DISCIPLINA
-- Cadastrar disciplinas com Código

ALTER TABLE disciplina ADD codigo VARCHAR2(20);

-- Comentário na coluna
COMMENT ON COLUMN disciplina.codigo IS 'Código único da disciplina (ex: MAT101, FIS201)';

