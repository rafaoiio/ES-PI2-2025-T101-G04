// LUCAS
import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class CreateComponenteDto {
  @IsNumber()
  @IsNotEmpty()
  idDisciplina: number;

  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  sigla: string;
}
