import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { Item } from './item.interface';

const COLLECTION_NAME = 'items';

@Injectable()
export class ItemsService implements OnModuleInit {
  constructor(private readonly firebaseService: FirebaseService) {}

  async onModuleInit() {
    console.log('[ItemsService] Conectado a Firestore (colección: "items").');
  }

  // GET /items
  async findAll(): Promise<Item[]> {
    return this.firebaseService.getCollection<Item>(COLLECTION_NAME);
  }

  // GET /items/:id
  async findOne(id: string): Promise<Item> {
    const item = await this.firebaseService.getDocument<Item>(COLLECTION_NAME, id);
    if (!item) throw new NotFoundException(`Item con id "${id}" no encontrado`);
    return item;
  }

  // POST /items
  async create(item: Partial<Item>): Promise<Item> {
    const newId = Date.now().toString() + Math.random().toString(36).substring(2, 7);
    const newItemData = {
      name: item.name || 'Sin nombre',
      city: item.city || '',
      address: item.address || '',
      type: item.type || 'Hospital',
      latitude: item.latitude ?? null,
      longitude: item.longitude ?? null,
      active: item.active ?? true,
    };
    return this.firebaseService.createDocument<Item>(COLLECTION_NAME, newId, newItemData);
  }

  // PUT /items/:id — reemplaza completamente el item
  async replace(id: string, item: Partial<Item>): Promise<Item> {
    await this.findOne(id);
    const replacedData = {
      name: item.name || 'Sin nombre',
      city: item.city || '',
      address: item.address || '',
      type: item.type || 'Hospital',
      latitude: item.latitude ?? null,
      longitude: item.longitude ?? null,
      active: item.active ?? true,
    };
    return this.firebaseService.setDocument<Item>(COLLECTION_NAME, id, replacedData);
  }

  // PATCH /items/:id — edita solo las propiedades enviadas
  async update(id: string, partial: Partial<Item>): Promise<Item> {
    await this.findOne(id);
    return this.firebaseService.updateDocument<Item>(COLLECTION_NAME, id, partial);
  }

  // DELETE /items/:id
  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.firebaseService.deleteDocument(COLLECTION_NAME, id);
    return { message: `Item "${id}" eliminado correctamente` };
  }
}
