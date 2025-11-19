// LUCAS
import {
  IsNumber,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  ValidateIf,
} from 'class-validator';

export class CreateDisciplinaDto {

  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  nome: string;


  @IsString()
  @IsOptional()
  sigla?: string;

  @IsString()
  @IsOptional()
  codigo?: string;

  @IsString()
  @IsOptional()
  periodo?: string;

  @IsString()
  @IsIn(['SIMPLES', 'PONDERADA'], {
    message: 'Regra deve ser SIMPLES ou PONDERADA',
  })
  regra: 'SIMPLES' | 'PONDERADA';

  @ValidateIf((o) => o.regra === 'PONDERADA')
  @IsString()
  @IsNotEmpty({ message: 'Pesos são obrigatórios quando a regra é PONDERADA' })
  pesosJson?: string;
}
