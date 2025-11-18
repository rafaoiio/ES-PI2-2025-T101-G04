// PEDRO
import { IsNumber, Min, Max, IsOptional, ValidateIf } from 'class-validator';

/**
 * DTO para atualização de nota.
 * Aceita valores de 0,00 a 10,00 ou null (não lançado).
 */
export class UpdateLancamentoDto {
  @ValidateIf((o) => o.valor !== null && o.valor !== undefined)
  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  valor?: number | null;
}
