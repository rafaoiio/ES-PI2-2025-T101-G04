// RAFAEL
import {
  IsNumber,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
} from 'class-validator';

export class CreateAlunoDto {
  @IsNumber()
  @IsNotEmpty()
  ra: number;

  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsEmail()
  @IsOptional()
  email?: string;
}
