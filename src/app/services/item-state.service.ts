import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Item } from '../models/item.model';
import { ItemApiService } from './item-api.service';
import { ItemStorageService } from './item-storage.service';

@Injectable({
  providedIn: 'root',
})
export class ItemStateService {
  constructor(
    private apiService: ItemApiService,
    private storageService: ItemStorageService,
  ) {}

  getItems(): Observable<Item[]> {
    const cachedItems = this.storageService.getItems();

    if (cachedItems) {
      return of(cachedItems);
    }

    return this.apiService.getItems().pipe(
      tap((items) => {
        this.storageService.saveItems(items);
      }),
    );
  }
  needsGeocode(item: Item): boolean {
    return (!item.city || !item.address) && item.latitude !== null && item.longitude !== null;
  }

  reverseGeocode(lat: number, lon: number): Observable<{ city: string; address: string }> {
    return this.apiService.reverseGeocode(lat, lon);
  }
}
