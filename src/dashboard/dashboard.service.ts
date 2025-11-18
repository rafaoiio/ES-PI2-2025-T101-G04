// VITOR
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Disciplina } from '../entities/disciplina.entity';
import { Turma } from '../entities/turma.entity';
import { ComponenteNota } from '../entities/componente-nota.entity';
import { Aluno } from '../entities/aluno.entity';
import { Matricula } from '../entities/matricula.entity';
import { Instituicao } from '../entities/instituicao.entity';
import { Curso } from '../entities/curso.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Disciplina)
    private disciplinaRepo: Repository<Disciplina>,
    @InjectRepository(Turma)
    private turmaRepo: Repository<Turma>,
    @InjectRepository(ComponenteNota)
    private componenteRepo: Repository<ComponenteNota>,
    @InjectRepository(Aluno)
    private alunoRepo: Repository<Aluno>,
    @InjectRepository(Matricula)
    private matriculaRepo: Repository<Matricula>,
    @InjectRepository(Instituicao)
    private instituicaoRepo: Repository<Instituicao>,
    @InjectRepository(Curso)
    private cursoRepo: Repository<Curso>,
  ) {}

  async getMetrics(idProfessor: number) {
    console.log('[Dashboard Service] getMetrics chamado com idProfessor:', idProfessor);
    console.log('[Dashboard Service] Tipo de idProfessor:', typeof idProfessor);
    
    // MÉTRICAS DO SISTEMA:
    // - Disciplinas: TODAS as disciplinas cadastradas no sistema (global)
    // - Turmas: Apenas as turmas do professor (filtrado)
    // - Componentes: TODOS os componentes cadastrados no sistema (global)
    // - Alunos: Apenas alunos matriculados em turmas do professor (filtrado)
    
    // Busca todas as turmas do professor
    const turmasDoProfessor = await this.turmaRepo.find({
      where: { idProfessor },
      select: ['idTurma', 'idDisciplina', 'idProfessor'],
    });

    console.log('[Dashboard Service] Turmas do professor encontradas:', turmasDoProfessor.length);
    console.log('[Dashboard Service] Turmas do professor:', turmasDoProfessor);

    const turmasIds = turmasDoProfessor.map(t => t.idTurma);

    // Conta TODAS as disciplinas cadastradas no sistema (não filtrado)
    const disciplinas = await this.disciplinaRepo.count();
    console.log('[Dashboard Service] Total de disciplinas no sistema:', disciplinas);

    // Conta apenas turmas do professor
    const turmas = turmasIds.length;
    console.log('[Dashboard Service] Turmas do professor:', turmas);

    // Conta TODOS os componentes cadastrados no sistema (não filtrado)
    const componentes = await this.componenteRepo.count();
    console.log('[Dashboard Service] Total de componentes no sistema:', componentes);

    // Conta apenas alunos únicos matriculados em turmas do professor
    let alunos = 0;
    if (turmasIds.length > 0) {
      // Busca todas as matrículas das turmas do professor
      // Usa DISTINCT na query para garantir que não há duplicatas
      const matriculas = await this.matriculaRepo
        .createQueryBuilder('matricula')
        .select('DISTINCT matricula.ra', 'ra')
        .where('matricula.idTurma IN (:...turmasIds)', { turmasIds: turmasIds })
        .getRawMany();
      
      console.log('[Dashboard Service] Matrículas encontradas:', matriculas.length);
      console.log('[Dashboard Service] Matrículas:', matriculas);
      
      // Conta RAs únicos retornados da query
      // getRawMany retorna array de objetos { ra: number }
      alunos = matriculas.length;
    }
    console.log('[Dashboard Service] Alunos únicos nas turmas do professor:', alunos);

    const result = {
      disciplinas,
      turmas,
      componentes,
      alunos,
    };
    
    console.log('[Dashboard Service] Métricas finais:', result);
    return result;
  }

  /**
   * Verifica se é o primeiro acesso do docente.
   * Retorna true se não houver instituição ou curso cadastrados.
   * 
   * IMPORTANTE: Instituições e cursos são globais no sistema,
   * então verifica se existe pelo menos uma instituição E um curso cadastrados.
   */
  async checkFirstAccess() {
    const [instituicoes, cursos] = await Promise.all([
      this.instituicaoRepo.count(),
      this.cursoRepo.count(),
    ]);

    const hasInstituicao = instituicoes > 0;
    const hasCurso = cursos > 0;
    const isFirstAccess = !hasInstituicao || !hasCurso;

    return {
      isFirstAccess,
      hasInstituicao,
      hasCurso,
      // Informações adicionais para debug
      totalInstituicoes: instituicoes,
      totalCursos: cursos,
    };
  }
}
