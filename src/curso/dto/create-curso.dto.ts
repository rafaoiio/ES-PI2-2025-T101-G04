// LUCAS
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateCursoDto {
  @IsNumber()
  @IsNotEmpty()
  idInstituicao: number;

  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsOptional()
  sigla?: string;

  @IsNumber()
  @IsOptional()
  creditos?: number;

  @IsNumber()
  @IsOptional()
  semestre?: number;

  @IsNumber()
  @IsOptional()
  ano?: number;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;
}