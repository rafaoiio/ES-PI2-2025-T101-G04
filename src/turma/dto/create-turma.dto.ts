// RAFAEL
import { IsNumber, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTurmaDto {
  @IsNumber()
  @IsNotEmpty()
  idDisciplina: number;

  @IsString()
  @IsNotEmpty()
  nomeTurma: string;

  @IsString()
  @IsOptional()
  horario?: string;

  @IsString()
  @IsOptional()
  sala?: string;

  @IsNumber()
  @IsOptional()
  capacidade?: number;
}
