import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompetitionSearchParams } from '@/app/services/competition.service';
import { Level, Round } from '@/app/models/competition.model';
import { COMPETITION_TRANSLATIONS } from '@/app/translations/competition.translations';

@Component({
  selector: 'app-competition-search-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './competition-search-panel.component.html',
})
export class CompetitionSearchPanelComponent {
  @Output() searchSubmit = new EventEmitter<CompetitionSearchParams>();
  @Output() resetFilters = new EventEmitter<void>();

  isExpanded = false;

  filters: CompetitionSearchParams = {};

  levels = Object.values(Level).map(value => ({
    value,
    label: COMPETITION_TRANSLATIONS.level[value as Level] ?? value,
  }));

  rounds = Object.values(Round).map(value => ({
    value,
    label: COMPETITION_TRANSLATIONS.round[value as Round] ?? value,
  }));

  onSearch() {
    this.searchSubmit.emit({ ...this.filters });
  }

  onReset() {
    this.filters = {};
    this.resetFilters.emit();
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
  }
}
