import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageExamSearchParams } from '@/app/services/language-exam.service';
import { EXAM_LANGUAGES, EXAM_LEVELS, EXAM_TYPES, EXAM_BODIES } from '@/app/models/language-exam.model';

@Component({
  selector: 'app-language-exam-search-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './language-exam-search-panel.component.html',
})
export class LanguageExamSearchPanelComponent {
  @Output() searchSubmit = new EventEmitter<LanguageExamSearchParams>();
  @Output() resetFilters = new EventEmitter<void>();

  isExpanded = false;
  filters: LanguageExamSearchParams = {};

  languages = EXAM_LANGUAGES;
  levels = EXAM_LEVELS;
  types = EXAM_TYPES;
  examBodies = EXAM_BODIES;

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
