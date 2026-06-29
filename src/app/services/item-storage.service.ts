import { Injectable } from '@angular/core';
import { Item } from '../models/item.model';

interface CacheData<T> {
  timestamp: number;
  data: T[];
}

@Injectable({
  providedIn: 'root',
})
export class ItemStorageService {
  private cacheDurationMs = 5 * 60 * 1000;

  getData<T>(cacheKey: string): T[] | null {
    const cachedString = localStorage.getItem(cacheKey);

    if (!cachedString) {
      return null;
    }

    try {
      const cacheData: CacheData<T> = JSON.parse(cachedString);

      const now = Date.now();

      if (now - cacheData.timestamp < this.cacheDurationMs) {
        console.log('Returning data from cache');
        return cacheData.data;
      }

      localStorage.removeItem(cacheKey);

      return null;
    } catch (error) {
      console.error('Error parsing cache', error);

      localStorage.removeItem(cacheKey);

      return null;
    }
  }

  saveData<T>(cacheKey: string, data: T[]): void {
    const cacheData: CacheData<T> = {
      timestamp: Date.now(),
      data,
    };

    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  }
}
