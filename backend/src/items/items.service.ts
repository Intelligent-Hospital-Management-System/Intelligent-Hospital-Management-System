import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Item } from './item.interface';

const HEALTHSITES_URL =
  'https://healthsites.io/api/v3/facilities/?country=Argentina&api-key=3cf67919f59931bd81146de940ffb6c418d238b3&limit=5000';

@Injectable()
export class ItemsService implements OnModuleInit {
  private items: Item[] = [];

  constructor(private readonly httpService: HttpService) {}

  async onModuleInit() {
    console.log('[ItemsService] Cargando items desde healthsites.io...');
    try {
      const response = await firstValueFrom(
        this.httpService.get<any>(HEALTHSITES_URL),
      );

      let facilities = response.data;
      if (!Array.isArray(facilities)) {
        facilities = facilities?.features || [];
      }

      this.items = (facilities as any[])
        .map((facility: any, index: number) => {
          const props = facility.attributes || facility.properties || {};
          const coords =
            facility.centroid?.coordinates || facility.geometry?.coordinates;

          let name: string = props.name;
          const lowerName = (name || '').toLowerCase();

          let isHospital =
            props.healthcare === 'hospital' || props.amenity === 'hospital';
          let isClinic =
            props.healthcare === 'clinic' || props.amenity === 'clinic';

          if (
            lowerName.includes('clínica') ||
            lowerName.includes('clinica') ||
            lowerName.includes('centro médico')
          ) {
            isClinic = true;
            isHospital = false;
          } else if (lowerName.includes('hospital')) {
            isHospital = true;
            isClinic = false;
          }

          if (!isHospital && !isClinic) return null;

          const type = isHospital ? 'Hospital' : 'Clínica';
          if (!name) name = `${type} ${index + 1}`;

          const city =
            props['addr_city'] || props['addr:city'] || '';
          const address =
            props['addr_full'] ||
            props['addr:street'] ||
            props['addr_street'] ||
            '';

          return {
            id: props.uuid || index,
            name,
            city,
            address,
            type,
            latitude: coords ? coords[1] : null,
            longitude: coords ? coords[0] : null,
            active: true,
          } as Item;
        })
        .filter((item): item is Item => item !== null);

      console.log(`[ItemsService] ${this.items.length} items cargados en memoria.`);
    } catch (error) {
      console.error('[ItemsService] Error al cargar items:', error.message);
      this.items = [];
    }
  }

  // GET /items
  findAll(): Item[] {
    return this.items;
  }

  // GET /items/:id
  findOne(id: string): Item {
    const item = this.items.find((i) => String(i.id) === id);
    if (!item) throw new NotFoundException(`Item con id "${id}" no encontrado`);
    return item;
  }

  // POST /items
  create(item: Partial<Item>): Item {
    const newItem: Item = {
      id: Date.now().toString(),
      name: item.name || 'Sin nombre',
      city: item.city || '',
      address: item.address || '',
      type: item.type || 'Hospital',
      latitude: item.latitude ?? null,
      longitude: item.longitude ?? null,
      active: item.active ?? true,
    };
    this.items.push(newItem);
    return newItem;
  }

  // PUT /items/:id — reemplaza completamente el item
  replace(id: string, item: Partial<Item>): Item {
    const index = this.items.findIndex((i) => String(i.id) === id);
    if (index === -1) throw new NotFoundException(`Item con id "${id}" no encontrado`);

    const replaced: Item = {
      id,
      name: item.name || 'Sin nombre',
      city: item.city || '',
      address: item.address || '',
      type: item.type || 'Hospital',
      latitude: item.latitude ?? null,
      longitude: item.longitude ?? null,
      active: item.active ?? true,
    };
    this.items[index] = replaced;
    return replaced;
  }

  // PATCH /items/:id — edita solo las propiedades enviadas
  update(id: string, partial: Partial<Item>): Item {
    const index = this.items.findIndex((i) => String(i.id) === id);
    if (index === -1) throw new NotFoundException(`Item con id "${id}" no encontrado`);

    this.items[index] = { ...this.items[index], ...partial, id };
    return this.items[index];
  }

  // DELETE /items/:id
  remove(id: string): { message: string } {
    const index = this.items.findIndex((i) => String(i.id) === id);
    if (index === -1) throw new NotFoundException(`Item con id "${id}" no encontrado`);

    this.items.splice(index, 1);
    return { message: `Item "${id}" eliminado correctamente` };
  }
}
