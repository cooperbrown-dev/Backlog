import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BacklogItem } from '../models/backlog';
import { CreateBacklogItemRequest } from '../models/create-backlog-item-request.model';
import { UpdateBacklogItemRequest } from '../models/update-backlog-item-request.model';

@Injectable({ providedIn: 'root' })
export class BacklogService {
  private http = inject(HttpClient);
  private url = `${environment.apiBaseUrl}/api/backlogitems`;

  getItems(): Observable<BacklogItem[]> { return this.http.get<BacklogItem[]>(this.url); }
  addItem(req: CreateBacklogItemRequest): Observable<BacklogItem> { return this.http.post<BacklogItem>(this.url, req); }
  updateItem(id: string, req: UpdateBacklogItemRequest): Observable<BacklogItem> { return this.http.put<BacklogItem>(`${this.url}/${id}`, req); }
}