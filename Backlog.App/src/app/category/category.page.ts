import { Component, computed, inject, input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonItem, IonLabel, IonListHeader, IonButton } from '@ionic/angular/standalone';
import { BacklogStore } from '../stores/backlog.store';
import { BacklogItem } from '../models/backlog-item';
import { BacklogStatus } from '../enums/backlog-status';
import { Category } from '../enums/category';

/** Maps the URL slug (/category/movies) to the enum value + a heading to display. */
export const CATEGORY_SLUGS: Record<string, { category: Category; label: string }> = {
  movies: { category: Category.Movie, label: 'Movies' },
  shows: { category: Category.Show, label: 'Shows' },
  'video-games': { category: Category.VideoGame, label: 'Video Games' },
  books: { category: Category.Book, label: 'Books' },
  vacations: { category: Category.Vacation, label: 'Vacations' },
};

@Component({
  selector: 'app-category',
  standalone: true,
  templateUrl: 'category.page.html',
  imports: [RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonItem, IonLabel, IonListHeader, IonButton],
})
export class CategoryPage implements OnInit {
  private store = inject(BacklogStore);

  /** Bound automatically from the :slug route param by withComponentInputBinding(). */
  slug = input.required<string>();

  private config = computed(() => CATEGORY_SLUGS[this.slug()]);
  label = computed(() => this.config()?.label ?? 'Unknown');

  private items = computed(() => {
    const c = this.config();
    return c ? this.store.items().filter(i => i.category === c.category) : [];
  });

  notStarted = computed(() => this.items().filter(i => i.status === BacklogStatus.NotStarted));
  inProgress = computed(() => this.items().filter(i => i.status === BacklogStatus.InProgress));
  finished = computed(() => this.items().filter(i => i.status === BacklogStatus.Finished));

  ngOnInit() { this.store.load(); }
  markDone(i: BacklogItem) { this.store.update(i.id, { status: BacklogStatus.Finished, rating: i.rating, note: i.note }); }
}
