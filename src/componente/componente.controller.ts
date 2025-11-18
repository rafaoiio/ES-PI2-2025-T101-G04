// LUCAS
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ComponenteService } from './componente.service';
import { CreateComponenteDto } from './dto/create-componente.dto';
import { UpdateComponenteDto } from './dto/update-componente.dto';

@Controller('componentes')
@UseGuards(AuthGuard('jwt'))
export class ComponenteController {
  constructor(private readonly componenteService: ComponenteService) {}

  @Get('disciplinas/:discId')
  findByDisciplina(@Param('discId', ParseIntPipe) discId: number) {
    return this.componenteService.findByDisciplina(discId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.componenteService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateComponenteDto) {
    return this.componenteService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateComponenteDto,
  ) {
    return this.componenteService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.componenteService.remove(id);
    return { message: 'Componente excluído com sucesso' };
  }
}
