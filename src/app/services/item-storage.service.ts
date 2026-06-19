import { Injectable } from '@angular/core';
import { Item, CacheData } from '../models/item.model';

@Injectable({
  providedIn: 'root',
})
export class ItemStorageService {
  private cacheKey = 'healthsitesCacheV3';
  private cacheDurationMs = 5 * 60 * 1000;

  getItems(): Item[] | null {
    const cachedString = localStorage.getItem(this.cacheKey);

    if (!cachedString) {
      return null;
    }

    try {
      const cacheData: CacheData = JSON.parse(cachedString);

      const now = Date.now();

      if (now - cacheData.timestamp < this.cacheDurationMs) {
        console.log('Returning data from cache');
        return cacheData.data;
      }

      localStorage.removeItem(this.cacheKey);

      return null;
    } catch (error) {
      console.error('Error parsing cache', error);

      localStorage.removeItem(this.cacheKey);

      return null;
    }
  }

  saveItems(items: Item[]): void {
    const cacheData: CacheData = {
      timestamp: Date.now(),
      data: items,
    };

    localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
  }
}
