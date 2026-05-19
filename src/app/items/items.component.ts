import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ItemService, Item } from '../services/item.service';
import { from, mergeMap } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.css']
})
export class ItemsComponent implements OnInit {
  items = signal<Item[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  geocodingIds = signal<Set<string | number>>(new Set());

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

    const filter = this.filterText().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (filter) {
      result = result.filter(item => {
        const name = (item.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const city = (item.city || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const address = (item.address || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const type = (item.type || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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
      if (typeof valA === 'string' && typeof valB === 'string') return valA.localeCompare(valB) * asc;
      if (valA < valB) return -1 * asc;
      if (valA > valB) return 1 * asc;
      return 0;
    });

    return result;
  });

  displayedItems = computed(() => this.processedItems().slice(0, this.displayLimit()));

  // Refleja cambios de geocoding en el modal abierto
  liveSelectedItem = computed(() => {
    const sel = this.selectedItem();
    if (!sel) return null;
    return this.items().find(i => i.id === sel.id) ?? sel;
  });

  constructor(
    private itemService: ItemService,
    private sanitizer: DomSanitizer
  ) { }

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
        this.triggerGeocoding(data);
      },
      error: (err) => {
        this.errorMessage.set(err.message);
        this.isLoading.set(false);
      }
    });
  }

  private triggerGeocoding(items: Item[]) {
    const toGeocode = items.filter(item => this.itemService.needsGeocode(item));
    if (toGeocode.length === 0) return;

    this.geocodingIds.set(new Set(toGeocode.map(i => i.id)));

    from(toGeocode).pipe(
      mergeMap(item =>
        this.itemService.reverseGeocode(item.latitude!, item.longitude!).pipe(
          map(result => ({ item, result }))
        ),
        5 // máx 5 requests simultáneos
      )
    ).subscribe({
      next: ({ item, result }) => {
        if (result.city || result.address) {
          this.items.update(all =>
            all.map(i => i.id === item.id
              ? { ...i, city: result.city || i.city, address: result.address || i.address }
              : i
            )
          );
        }
        this.geocodingIds.update(ids => {
          const next = new Set(ids);
          next.delete(item.id);
          return next;
        });
      }
    });
  }

  isGeocoding(id: string | number): boolean {
    return this.geocodingIds().has(id);
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
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    }
  }
}
