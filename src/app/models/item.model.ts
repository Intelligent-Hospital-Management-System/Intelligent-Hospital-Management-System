export interface Item {
  id: string | number;
  name: string;
  city: string;
  address: string;
  type: string;
  latitude: number | null;
  longitude: number | null;
  isGeocoding?: boolean;
  [key: string]: any;
}

export interface CacheData {
  timestamp: number;
  data: Item[];
}

export interface GeocodeCacheEntry {
  city: string;
  address: string;
  timestamp: number;
}

export interface GeocodeCache {
  [key: string]: GeocodeCacheEntry;
}
