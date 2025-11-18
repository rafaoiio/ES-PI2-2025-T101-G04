// VITOR
import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreateMatriculaDto {
  @IsNumber()
  @IsNotEmpty()
  ra: number;

  @IsNumber()
  @IsNotEmpty()
  idTurma: number;
}
