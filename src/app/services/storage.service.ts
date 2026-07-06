import { Injectable } from '@angular/core';

interface CacheData<T> {
  timestamp: number;
  data: T[];
}

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  get<T>(key: string): T | null {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch (error) {
      console.error(`Error parsing storage key "${key}"`, error);
      localStorage.removeItem(key);
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }

  getData<T>(cacheKey: string, cacheDurationMs = 5 * 60 * 1000): T[] | null {
    const cachedString = localStorage.getItem(cacheKey);

    if (!cachedString) {
      return null;
    }

    try {
      const cacheData: CacheData<T> = JSON.parse(cachedString);

      if (Date.now() - cacheData.timestamp < cacheDurationMs) {
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
