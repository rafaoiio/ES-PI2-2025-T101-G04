// LUCAS
import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Disciplina } from '../entities/disciplina.entity';
import { Curso } from '../entities/curso.entity';
import { Turma } from '../entities/turma.entity';
import { ComponenteNota } from '../entities/componente-nota.entity';
import { CreateDisciplinaDto } from './dto/create-disciplina.dto';
import { UpdateDisciplinaDto } from './dto/update-disciplina.dto';

/**
 * Serviço responsável pelas operações CRUD de Disciplinas.
 *
 * Gerencia disciplinas e suas fórmulas de cálculo de média:
 * - SIMPLES: média aritmética simples
 * - PONDERADA: média ponderada com pesos em JSON
 *
 * A fórmula é armazenada no campo formula_media:
 * - "SIMPLES" para média aritmética
 * - "PONDERADA:{json}" para média ponderada
 */
@Injectable()
export class DisciplinaService {
  constructor(
    @InjectRepository(Disciplina)
    private disciplinaRepo: Repository<Disciplina>,
    @InjectRepository(Turma)
    private turmaRepo: Repository<Turma>,
    @InjectRepository(ComponenteNota)
    private componenteRepo: Repository<ComponenteNota>,
  ) {}

  /**
   * Cria uma nova disciplina.
   * Valida a fórmula de média e os pesos quando necessário.
   * Verifica que todos os componentes constam na fórmula antes de salvar.
   */
  async create(dto: CreateDisciplinaDto) {
    // Busca curso (usa ID 1 por padrão)
    const cursoRepo = this.disciplinaRepo.manager.getRepository(Curso);
    const curso = await cursoRepo.findOne({ where: { idCurso: 1 } as any });
    if (!curso) {
      throw new Error('Nenhum curso cadastrado. Cadastre um curso primeiro.');
    }

    // Valida e prepara a fórmula de média
    let formulaMedia: string = dto.regra;
    if (dto.regra === 'PONDERADA') {
      if (!dto.pesosJson) {
        throw new Error('Pesos são obrigatórios quando a regra é PONDERADA');
      }
      this.validarPesos(dto.pesosJson);
      formulaMedia = `PONDERADA:${dto.pesosJson}`;
      // Validação de componentes será feita no update quando componentes forem cadastrados
      // No create, a disciplina ainda não tem componentes, então não há o que validar
    }

    const disciplina = this.disciplinaRepo.create({
      nome: dto.nome.trim(),
      sigla: dto.sigla?.trim() || undefined,
      periodo: dto.periodo?.trim() || undefined,
      formulaMedia,
      idCurso: curso.idCurso,
    });

    // Só adiciona codigo se for fornecido (coluna pode não existir no banco)
    if (dto.codigo?.trim()) {
      (disciplina as any).codigo = dto.codigo.trim();
    }

    const disciplinaSalva = await this.disciplinaRepo.save(disciplina);

    // Se há componentes já cadastrados e fórmula é PONDERADA, valida
    if (dto.regra === 'PONDERADA' && dto.pesosJson) {
      const componentes = await this.componenteRepo.find({
        where: { idDisciplina: disciplinaSalva.idDisciplina },
      });
      if (componentes.length > 0) {
        await this.validarComponentesNaFormula(
          disciplinaSalva.idDisciplina,
          dto.pesosJson,
        );
      }
    }

    return disciplinaSalva;
  }

  /**
   * Lista todas as disciplinas disponíveis.
   * Disciplinas são globais e não pertencem a professores específicos.
   * Todos os professores podem ver todas as disciplinas.
   */
  async findAll(idProfessor?: number) {
    try {
      console.log(
        '[Disciplina Service] findAll chamado com idProfessor:',
        idProfessor,
      );

      // Disciplinas são globais - retorna todas independente do professor
      // O filtro por professor só é usado para o dashboard (contagem de disciplinas com turmas)
      const disciplinas = await this.disciplinaRepo.find({
        order: { nome: 'ASC' },
      });

      console.log(
        '[Disciplina Service] Total de disciplinas encontradas:',
        disciplinas.length,
      );

      return disciplinas.map((d) => {
        try {
          return {
            idDisciplina: d.idDisciplina,
            nome: d.nome,
            sigla: d.sigla || null,
            codigo: null, // Campo pode não existir no banco
            periodo: d.periodo || null,
            regra: this.parseRegra(d.formulaMedia).tipo,
          };
        } catch (mapError) {
          console.error('Erro ao mapear disciplina:', mapError, d);
          return {
            idDisciplina: d.idDisciplina,
            nome: d.nome || 'Sem nome',
            sigla: null,
            codigo: null,
            periodo: null,
            regra: 'SIMPLES',
          };
        }
      });
    } catch (error) {
      console.error('Erro ao buscar disciplinas:', error);
      throw error;
    }
  }

  /**
   * Busca uma disciplina por ID.
   */
  async findOne(id: number) {
    try {
      const disciplina = await this.disciplinaRepo
        .createQueryBuilder('disciplina')
        .select([
          'disciplina.idDisciplina',
          'disciplina.nome',
          'disciplina.sigla',
          'disciplina.periodo',
          'disciplina.formulaMedia',
        ])
        .where('disciplina.idDisciplina = :id', { id })
        .getOne();

      if (!disciplina) {
        return null;
      }

      const regra = this.parseRegra(disciplina.formulaMedia);
      return {
        ...disciplina,
        codigo: null, // Campo pode não existir no banco
        regra: regra.tipo,
        pesosJson: regra.tipo === 'PONDERADA' ? regra.pesos : undefined,
      };
    } catch (error) {
      console.error('Erro ao buscar disciplina:', error);
      throw error;
    }
  }

  /**
   * Atualiza uma disciplina existente.
   */
  async update(id: number, dto: UpdateDisciplinaDto) {
    const disciplina = await this.disciplinaRepo.findOne({
      where: { idDisciplina: id },
    });

    if (!disciplina) {
      throw new Error('Disciplina não encontrada');
    }

    // Atualiza fórmula de média se fornecida
    if (dto.regra) {
      if (dto.regra === 'PONDERADA') {
        if (!dto.pesosJson) {
          throw new Error('Pesos são obrigatórios quando a regra é PONDERADA');
        }
        this.validarPesos(dto.pesosJson);

        // Valida que todos os componentes cadastrados constam na fórmula
        await this.validarComponentesNaFormula(
          disciplina.idDisciplina,
          dto.pesosJson,
        );

        disciplina.formulaMedia = `PONDERADA:${dto.pesosJson}`;
      } else {
        disciplina.formulaMedia = 'SIMPLES';
      }
    }

    // Atualiza outros campos
    if (dto.nome) disciplina.nome = dto.nome.trim();
    if (dto.sigla !== undefined)
      disciplina.sigla = dto.sigla?.trim() || undefined;
    // Só atualiza codigo se for fornecido (coluna pode não existir no banco)
    if (dto.codigo !== undefined && dto.codigo?.trim()) {
      (disciplina as any).codigo = dto.codigo.trim();
    }
    if (dto.periodo !== undefined)
      disciplina.periodo = dto.periodo?.trim() || undefined;

    return await this.disciplinaRepo.save(disciplina);
  }

  /**
   * Remove uma disciplina.
   * Impede exclusão se houver turmas vinculadas.
   */
  async remove(id: number) {
    const disciplina = await this.disciplinaRepo.findOne({
      where: { idDisciplina: id },
    });

    if (!disciplina) {
      throw new Error('Disciplina não encontrada');
    }

    // Verifica se há turmas vinculadas
    const turmas = await this.turmaRepo.count({
      where: { idDisciplina: id },
    });

    if (turmas > 0) {
      throw new ConflictException(
        'Não é possível excluir esta disciplina pois ela possui turmas vinculadas.',
      );
    }

    await this.disciplinaRepo.remove(disciplina);
    return { message: 'Disciplina removida com sucesso' };
  }

  /**
   * Valida o JSON de pesos para média ponderada.
   */
  private validarPesos(pesosJson: string): void {
    const pesos = JSON.parse(pesosJson);

    if (typeof pesos !== 'object' || Array.isArray(pesos) || pesos === null) {
      throw new Error('Pesos devem ser um objeto JSON válido');
    }

    let soma = 0;
    for (const val of Object.values(pesos)) {
      const num = parseFloat(String(val));
      if (isNaN(num)) {
        throw new Error('Todos os pesos devem ser números válidos');
      }
      soma += num;
    }

    if (Math.abs(soma - 1.0) > 0.01) {
      throw new Error(
        `A soma dos pesos deve ser 1.0 (atual: ${soma.toFixed(2)})`,
      );
    }
  }

  /**
   * Valida que todos os componentes cadastrados constam na fórmula.
   */
  private async validarComponentesNaFormula(
    idDisciplina: number,
    pesosJson: string,
  ): Promise<void> {
    // Busca todos os componentes da disciplina
    const componentes = await this.componenteRepo.find({
      where: { idDisciplina },
    });

    if (componentes.length === 0) {
      // Se não há componentes, não precisa validar
      return;
    }

    // Parseia os pesos do JSON
    const pesos = JSON.parse(pesosJson);
    const siglasNaFormula = Object.keys(pesos);

    // Verifica se todos os componentes estão na fórmula
    const componentesFaltando: string[] = [];
    componentes.forEach((comp) => {
      const sigla = comp.sigla || comp.nome;
      if (!siglasNaFormula.includes(sigla)) {
        componentesFaltando.push(sigla);
      }
    });

    if (componentesFaltando.length > 0) {
      throw new BadRequestException(
        `Todos os componentes cadastrados devem constar na fórmula. Componentes faltando: ${componentesFaltando.join(', ')}`,
      );
    }
  }

  /**
   * Parseia a fórmula de média armazenada.
   */
  private parseRegra(formulaMedia?: string | null): {
    tipo: 'SIMPLES' | 'PONDERADA';
    pesos?: string;
  } {
    if (!formulaMedia || formulaMedia === 'SIMPLES') {
      return { tipo: 'SIMPLES' };
    }

    const trimmed = formulaMedia.trim();
    if (trimmed === '' || trimmed === 'SIMPLES') {
      return { tipo: 'SIMPLES' };
    }

    if (trimmed.startsWith('PONDERADA:')) {
      return { tipo: 'PONDERADA', pesos: trimmed.substring(10) };
    }

    return { tipo: 'SIMPLES' };
  }
}
