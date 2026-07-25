import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import type { Item } from './item.interface';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  // GET /items — obtener todos los items
  @Get()
  findAll(): Item[] {
    return this.itemsService.findAll();
  }

  // GET /items/:id — obtener un item por id
  @Get(':id')
  findOne(@Param('id') id: string): Item {
    return this.itemsService.findOne(id);
  }

  // POST /items — agregar un nuevo item
  @Post()
  create(@Body() body: Partial<Item>): Item {
    return this.itemsService.create(body);
  }

  // PUT /items/:id — reemplazar completamente un item
  @Put(':id')
  replace(@Param('id') id: string, @Body() body: Partial<Item>): Item {
    return this.itemsService.replace(id, body);
  }

  // PATCH /items/:id — editar solo una propiedad (ej: active)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Partial<Item>): Item {
    return this.itemsService.update(id, body);
  }

  // DELETE /items/:id — eliminar un item
  @Delete(':id')
  remove(@Param('id') id: string): { message: string } {
    return this.itemsService.remove(id);
  }
}
