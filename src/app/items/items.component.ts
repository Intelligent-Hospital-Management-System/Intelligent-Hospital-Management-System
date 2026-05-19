import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ItemService, Item } from '../services/item.service';

export enum ItemType {
    HOSPITAL = 'Hospital',
    CLINIC = 'Clínica'
  }

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.css']
})
export class ItemsComponent implements OnInit {
  readonly ITEM_TYPE = ItemType;
  items = signal<Item[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  filterText = signal<string>('');
  sortBy = signal<string>('name');
  sortAsc = signal<boolean>(true);
  
  selectedTypeFilter = signal<string>('');
  showTypeDropdown = signal<boolean>(false);

  displayLimit = signal<number>(100);

  selectedItem = signal<Item | null>(null);
  mapUrl = signal<SafeResourceUrl | null>(null);

  processedItems = computed(() => {
    let result = [...this.items()];
    
    const filter = this.normalizeText(this.filterText());
    if (filter) {
      result = result.filter(item => {
        const name = this.normalizeText(item.name || '');
        const city = this.normalizeText(item.city || '');
        const address = this.normalizeText(item.address || '');
        const type = this.normalizeText(item.type || '');
        
        return name.includes(filter) || city.includes(filter) || address.includes(filter) || type.includes(filter);
      });
    }

    const typeFilter = this.selectedTypeFilter();
    if (typeFilter) {
      result = result.filter(item => item.type === typeFilter);
    }

    const sortField = this.sortBy();
    const asc = this.sortAsc() ? 1 : -1;
    
    result.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      
      if (typeof valA === 'string' && typeof valB === 'string') {
        return valA.localeCompare(valB) * asc;
      }
      if (valA < valB) return -1 * asc;
      if (valA > valB) return 1 * asc;
      return 0;
    });

    return result;
  });

  displayedItems = computed(() => {
    return this.processedItems().slice(0, this.displayLimit());
  });

  constructor(
    private itemService: ItemService,
    private sanitizer: DomSanitizer
  ) {}
  normalizeText(text: string): string{
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }
  ngOnInit() {
    this.fetchItems();
  }

  fetchItems() {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    
    this.itemService.getItems().subscribe({
      next: (data) => {
        this.items.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.message);
        this.isLoading.set(false);
      }
    });
  }

  onFilterChange(text: string) {
    this.filterText.set(text);
    this.displayLimit.set(100);
  }

  toggleSort(field: string) {
    if (this.sortBy() === field) {
      this.sortAsc.set(!this.sortAsc());
    } else {
      this.sortBy.set(field);
      this.sortAsc.set(true);
    }
    this.displayLimit.set(100);
  }

  selectType(type: string) {
    this.selectedTypeFilter.set(type);
    this.showTypeDropdown.set(false);
    this.displayLimit.set(100);
  }

  loadMore() {
    this.displayLimit.update(c => c + 100);
  }

  clearCacheAndReload() {
    localStorage.removeItem('healthsitesCacheV3');
    this.fetchItems();
  }

  openModal(item: Item) {
    this.selectedItem.set(item);
    if (item.latitude && item.longitude) {
      const lat = item.latitude;
      const lng = item.longitude;
      const bbox = `${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}`;
      const url = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
      this.mapUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
    } else {
      this.mapUrl.set(null);
    }
  }

  closeModal() {
    this.selectedItem.set(null);
    this.mapUrl.set(null);
  }

  openGoogleMaps(lat: number | null, lng: number | null) {
    if (lat !== null && lng !== null) {
      const url = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(url, '_blank');
    }
  }
}
