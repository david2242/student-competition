import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LanguageExamService, LanguageExamSearchParams } from '@/app/services/language-exam.service';
import { LanguageExam } from '@/app/models/language-exam.model';
import { NotificationService } from '@/app/services/notification.service';
import { AuthService } from '@/app/services/auth.service';
import { LanguageExamSearchPanelComponent } from './language-exam-search-panel/language-exam-search-panel.component';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, SizeColumnsToFitGridStrategy, RowClickedEvent } from 'ag-grid-community';
import {
  ModuleRegistry,
  ClientSideRowModelModule,
  ColumnAutoSizeModule,
  NumberFilterModule,
  PaginationModule,
  QuickFilterModule,
  RowSelectionModule,
  TextFilterModule,
  ValidationModule,
  RowStyleModule
} from 'ag-grid-community';

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  ColumnAutoSizeModule,
  NumberFilterModule,
  PaginationModule,
  QuickFilterModule,
  RowSelectionModule,
  TextFilterModule,
  ValidationModule,
  RowStyleModule,
]);

@Component({
  selector: 'app-language-exam-list',
  standalone: true,
  imports: [CommonModule, RouterLink, AgGridAngular, LanguageExamSearchPanelComponent],
  templateUrl: './language-exam-list.component.html',
  styleUrl: './language-exam-list.component.css',
})
export class LanguageExamListComponent implements OnInit {
  private service = inject(LanguageExamService);
  private router = inject(Router);
  private notification = inject(NotificationService);
  authService = inject(AuthService);

  rowData?: LanguageExam[];
  hasActiveFilters = false;

  colDefs: ColDef[] = [
    { field: 'id', headerName: '#', minWidth: 50, width: 60, filter: false },
    {
      field: 'student',
      headerName: 'Tanuló',
      valueGetter: (p) => `${p.data.studentLastName} ${p.data.studentFirstName}`,
    },
    { field: 'language', headerName: 'Nyelv' },
    { field: 'level', headerName: 'Szint', width: 90 },
    { field: 'type', headerName: 'Típus' },
    { field: 'examBody', headerName: 'Vizsgaszervező' },
    { field: 'teacher', headerName: 'Tanár' },
    {
      field: 'date',
      headerName: 'Dátum',
      valueGetter: (p) => p.data.date ? p.data.date.toString() : '',
    },
  ];

  autoSizeStrategy: SizeColumnsToFitGridStrategy = {
    type: 'fitGridWidth',
    defaultMinWidth: 10,
  };

  defaultColDef: ColDef<LanguageExam> = {
    sortable: true,
    unSortIcon: true,
    filter: true,
    resizable: true,
    minWidth: 100,
  };

  ngOnInit(): void {
    this.loadAll();
  }

  private loadAll(): void {
    this.service.getAll().subscribe({
      next: (response) => {
        this.rowData = Array.isArray(response) ? response : [];
      },
      error: () => {
        this.notification.error('Nem sikerült betölteni a nyelvvizsgákat!');
        this.rowData = [];
      }
    });
  }

  onSearch(params: LanguageExamSearchParams): void {
    this.hasActiveFilters = true;
    this.service.search(params).subscribe({
      next: (response) => {
        this.rowData = Array.isArray(response) ? response : [];
      },
      error: () => {
        this.notification.error('Nem sikerült a keresés!');
        this.rowData = [];
      }
    });
  }

  onReset(): void {
    this.hasActiveFilters = false;
    this.loadAll();
  }

  onRowClicked(event: RowClickedEvent<LanguageExam>): void {
    this.router.navigate(['language-exams', event.data?.id]);
  }

  getRowClass = (params: any): string | string[] | undefined => {
    const exam = params.data as LanguageExam;
    const currentUser = this.authService.$currentUser.value;
    if (currentUser && exam?.creatorId === currentUser.id) {
      return 'tinted';
    }
    return undefined;
  };
}
