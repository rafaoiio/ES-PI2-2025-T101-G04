--Autor: Rafael Gaudencio Dias
--Descrição: Todo o SQL usado para o projeto

-- 1) INSTITUIÇÃO
CREATE TABLE instituicao (
  id_instituicao   NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome             VARCHAR2(120)  NOT NULL,
  endereco         VARCHAR2(200),
  descricao        VARCHAR2(4000)
);

-- 2) CURSO  (Instituição oferece Curso: 1:N)
CREATE TABLE curso (
  id_curso         NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_instituicao   NUMBER NOT NULL,
  nome             VARCHAR2(120) NOT NULL,
  sigla            VARCHAR2(20),
  creditos         NUMBER(5),
  semestre         NUMBER(2),
  ano              NUMBER(4),
  descricao        VARCHAR2(1000),
  logo_url         VARCHAR2(300),

  CONSTRAINT fk_curso_instituicao
    FOREIGN KEY (id_instituicao) REFERENCES instituicao(id_instituicao)
);

CREATE INDEX ix_curso_instituicao ON curso(id_instituicao);

-- 3) DISCIPLINA  (Curso contém Disciplina: 1:N)
CREATE TABLE disciplina (
  id_disciplina    NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_curso         NUMBER NOT NULL,
  nome             VARCHAR2(120) NOT NULL,
  sigla            VARCHAR2(20),
  periodo          VARCHAR2(20),
  formula_media    CLOB,  -- “Fórmula p/ calcular média”

  CONSTRAINT fk_disciplina_curso
    FOREIGN KEY (id_curso) REFERENCES curso(id_curso)
);

CREATE INDEX ix_disciplina_curso ON disciplina(id_curso);

-- 4) PROFESSOR  (Professor leciona Turmas: 0:N)
CREATE TABLE professor (
  id_professor     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome             VARCHAR2(120) NOT NULL,
  email            VARCHAR2(150) UNIQUE NOT NULL,
  telefone_celular VARCHAR2(30),
  senha            VARCHAR2(200) -- hash
);

-- 5) TURMAS  (Disciplina 1:N Turmas) e (Professor 1:1 por Turma)
CREATE TABLE turma (
  id_turma         NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_disciplina    NUMBER NOT NULL,
  id_professor     NUMBER NOT NULL,
  nome_turma       VARCHAR2(120) NOT NULL,
  horario          VARCHAR2(120),
  sala             VARCHAR2(60),
  capacidade       NUMBER(4),
  data_inicio      DATE,
  data_fim         DATE,

  CONSTRAINT fk_turma_disciplina
    FOREIGN KEY (id_disciplina) REFERENCES disciplina(id_disciplina),

  CONSTRAINT fk_turma_professor
    FOREIGN KEY (id_professor) REFERENCES professor(id_professor)
);

CREATE INDEX ix_turma_disciplina ON turma(id_disciplina);
CREATE INDEX ix_turma_professor  ON turma(id_professor);

-- 6) ALUNO
CREATE TABLE aluno (
  ra               NUMBER PRIMARY KEY, -- RA como PK
  nome             VARCHAR2(120) NOT NULL,
  email            VARCHAR2(150) UNIQUE
);

-- 7) MATRÍCULA  (associativa: Aluno 0:N —(Matricula)— 1:1 Turma)
CREATE TABLE matricula (
  id_matricula     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ra               NUMBER NOT NULL,
  id_turma         NUMBER NOT NULL,
  data_matricula   DATE DEFAULT SYSDATE,

  CONSTRAINT uq_matricula_aluno_turma UNIQUE (ra, id_turma),

  CONSTRAINT fk_matricula_aluno
    FOREIGN KEY (ra) REFERENCES aluno(ra),

  CONSTRAINT fk_matricula_turma
    FOREIGN KEY (id_turma) REFERENCES turma(id_turma)
);

CREATE INDEX ix_matricula_ra     ON matricula(ra);
CREATE INDEX ix_matricula_turma  ON matricula(id_turma);

-- 8) COMPONENTE_NOTA  (Disciplina possui Componentes: 1:N)
CREATE TABLE componente_nota (
  id_componente    NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_disciplina    NUMBER NOT NULL,
  nome             VARCHAR2(120) NOT NULL,
  sigla            VARCHAR2(20),

  CONSTRAINT fk_comp_disciplina
    FOREIGN KEY (id_disciplina) REFERENCES disciplina(id_disciplina)
);

CREATE INDEX ix_comp_disciplina ON componente_nota(id_disciplina);

-- 9) NOTA  (Componente atribui Notas; Nota pertence a uma Matrícula)
CREATE TABLE nota (
  id_nota          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_componente    NUMBER NOT NULL,
  id_matricula     NUMBER NOT NULL,
  valor            NUMBER(5,2)  CHECK (valor BETWEEN 0 AND 100),
  data_lancamento  DATE DEFAULT SYSDATE,
  id_professor     NUMBER, -- quem lançou (opcional)

  CONSTRAINT fk_nota_componente
    FOREIGN KEY (id_componente) REFERENCES componente_nota(id_componente),

  CONSTRAINT fk_nota_matricula
    FOREIGN KEY (id_matricula) REFERENCES matricula(id_matricula),

  CONSTRAINT fk_nota_professor
    FOREIGN KEY (id_professor) REFERENCES professor(id_professor)
);

CREATE INDEX ix_nota_matricula  ON nota(id_matricula);
CREATE INDEX ix_nota_componente ON nota(id_componente);

-- 10) AUDITORIA_NOTA  (Nota “gera” Auditoria: 1:N)
CREATE TABLE auditoria_nota (
  id_auditoria     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_nota          NUMBER NOT NULL,
  mensagem         VARCHAR2(1000),
  data_hora        TIMESTAMP DEFAULT SYSTIMESTAMP,

  CONSTRAINT fk_auditoria_nota
    FOREIGN KEY (id_nota) REFERENCES nota(id_nota)
);

CREATE INDEX ix_auditoria_nota ON auditoria_nota(id_nota);

-- 11) BOLETIM  (um por Matrícula; Professor “gera”; Matricula “recebe”)
CREATE TABLE boletim (
  id_boletim       NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_matricula     NUMBER NOT NULL,
  media_calculada  NUMBER(5,2),
  media_ajustada   NUMBER(5,2),
  situacao         VARCHAR2(30),   -- Aprovado/Reprovado/Em Andamento
  data_fechamento  DATE,
  id_professor     NUMBER,         -- responsável pelo fechamento

  CONSTRAINT uq_boletim_matricula UNIQUE (id_matricula),

  CONSTRAINT fk_boletim_matricula
    FOREIGN KEY (id_matricula) REFERENCES matricula(id_matricula),

  CONSTRAINT fk_boletim_professor
    FOREIGN KEY (id_professor) REFERENCES professor(id_professor)
);

CREATE INDEX ix_boletim_matricula ON boletim(id_matricula);