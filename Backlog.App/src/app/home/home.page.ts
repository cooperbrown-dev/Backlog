import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonSelect, IonSelectOption, IonButton, IonListHeader, IonLabel } from '@ionic/angular/standalone';
import { BacklogStore } from '../stores/backlog.store';
import { BacklogItem } from '../models/backlog-item';
import { BacklogStatus } from '../enums/backlog-status';
import { Category } from '../enums/category';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: 'home.page.html',
  imports: [
    FormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonListHeader,
    IonLabel,
  ],
})
export class HomePage implements OnInit {
  private store = inject(BacklogStore);

  notStarted = this.store.notStarted;
  inProgress = this.store.inProgress;
  finished = this.store.finished;

  newTitle = signal('');
  newType = signal(Category.Movie);
  readonly BacklogStatus = BacklogStatus;

  ngOnInit() {
    this.store.load();
  }

  add() {
    if (this.newTitle().trim()) {
      this.store.add({
        title: this.newTitle().trim(),
        category: this.newType(),
      });
      this.newTitle.set('');
    }
  }

  markDone(i: BacklogItem) {
    this.store.update(i.id, {
      status: BacklogStatus.Finished,
      rating: i.rating,
      note: i.note,
    });
  }

  markStarted(i: BacklogItem) {
    this.store.update(i.id, {
      status: BacklogStatus.InProgress,
      rating: i.rating,
      note: i.note,
    });
  }

  deleteItem(i: BacklogItem) {
    this.store.delete(i.id);
  }
}