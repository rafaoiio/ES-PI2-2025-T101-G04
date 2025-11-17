// LUCAS
import { PartialType } from '@nestjs/mapped-types';
import { CreateComponenteDto } from './create-componente.dto';

export class UpdateComponenteDto extends PartialType(CreateComponenteDto) {}