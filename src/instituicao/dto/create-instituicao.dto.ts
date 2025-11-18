// LUCAS
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateInstituicaoDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsOptional()
  endereco?: string;

  @IsString()
  @IsOptional()
  descricao?: string;
}
