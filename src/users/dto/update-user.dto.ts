// LAURA
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProfessorDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nome?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  senha?: string;

  @IsOptional()
  @IsString()
  telefone?: string;
}
