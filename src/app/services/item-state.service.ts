import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Item } from '../models/item.model';
import { ItemApiService } from './item-api.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class ItemStateService {
  constructor(
    private apiService: ItemApiService,
    private storageService: StorageService,
  ) {}

  #getCachedData<T>(cacheKey: string, fetchData: () => Observable<T[]>): Observable<T[]> {
    const cachedData = this.storageService.getData<T>(cacheKey);

    if (cachedData) {
      console.log(`[Cache] HIT — key: "${cacheKey}" (${cachedData.length} items)`);
      return of(cachedData);
    }

    console.log(`[Cache] MISS — key: "${cacheKey}", fetching from API...`);

    return fetchData().pipe(
      tap((data) => {
        this.storageService.saveData<T>(cacheKey, data);
        console.log(`[Cache] SAVED — key: "${cacheKey}" (${data.length} items)`);
      }),
    );
  }
  getItems(): Observable<Item[]> {
    return this.#getCachedData<Item>('healthsitesCacheV3', () => this.apiService.getItems());
  }
  needsGeocode(item: Item): boolean {
    return (!item.city || !item.address) && item.latitude !== null && item.longitude !== null;
  }

  reverseGeocode(lat: number, lon: number): Observable<{ city: string; address: string }> {
    return this.apiService.reverseGeocode(lat, lon);
  }
}
