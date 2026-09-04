import { Injectable, computed, inject, signal } from '@angular/core';
import { BacklogService } from '../services/backlog.service';
import { BacklogItem } from '../models/backlog';
import { CreateBacklogItemRequest } from '../models/create-backlog-item-request.model';
import { UpdateBacklogItemRequest } from '../models/update-backlog-item-request.model';
import { BacklogStatus } from '../enums/backlog-status';


@Injectable({ providedIn: 'root' })
export class BacklogStore {
  private api = inject(BacklogService);
  private readonly _items = signal<BacklogItem[]>([]);

  readonly notStarted = computed(() => this._items().filter(i => i.status === BacklogStatus.NotStarted));
  readonly inProgress = computed(() => this._items().filter(i => i.status === BacklogStatus.InProgress));
  readonly finished = computed(() => this._items().filter(i => i.status === BacklogStatus.Finished
  ));

  load() { this.api.getItems().subscribe(items => this._items.set(items)); }
  add(req: CreateBacklogItemRequest) { this.api.addItem(req).subscribe(c => this._items.update(l => [c, ...l])); }
  update(id: string, req: UpdateBacklogItemRequest) {
    this.api.updateItem(id, req).subscribe(u => this._items.update(l => l.map(i => i.id === id ? u : i)));
  }
}