import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from "@angular/router";
import { CompetitionService, CompetitionSearchParams } from "@/app/services/competition.service";
import { CompetitionSearchPanelComponent } from './competition-search-panel/competition-search-panel.component';
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
import { Competition } from "@/app/models/competition.model";
import { NotificationService } from "@/app/services/notification.service";
import { AuthService } from "@/app/services/auth.service";
import {
  getCurrentSchoolYear,
  getSchoolYearBounds,
  formatSchoolYear,
  getAvailableSchoolYears,
} from '../competition-editor/schoolYearValidator';
import { COMPETITION_COL_DEFS } from './competition-list.columns';

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
  selector: 'app-competition-list',
  standalone: true,
  imports: [ CommonModule, FormsModule, AgGridAngular, CompetitionSearchPanelComponent, RouterLink ],
  templateUrl: './competition-list.component.html',
  styleUrl: './competition-list.component.css',
})
export class CompetitionListComponent implements OnInit {

  private competitionService = inject(CompetitionService);
  private router             = inject(Router);
  private notification       = inject(NotificationService);
  authService                = inject(AuthService);

  selectedSchoolYear: number = getCurrentSchoolYear();
  availableSchoolYears: number[] = getAvailableSchoolYears();
  formatSchoolYear = formatSchoolYear;

  private lastSearchParams: CompetitionSearchParams = {};
  rowData?: Competition[];
  hasActiveFilters = false;

  ngOnInit(): void {
    this.loadCompetitions();
  }

  loadCompetitions(extraParams: CompetitionSearchParams = {}): void {
    const bounds = getSchoolYearBounds(this.selectedSchoolYear);
    const params: CompetitionSearchParams = { ...bounds, ...extraParams };
    this.competitionService.searchCompetitions(params).subscribe({
      next: (response) => {
        this.rowData = Array.isArray(response) ? response : [];
      },
      error: (error) => {
        console.error('Error loading competitions:', error);
        this.notification.error('Nem sikerült betölteni a versenyeket!');
        this.rowData = [];
      }
    });
  }

  onSchoolYearChange(): void {
    this.loadCompetitions(this.lastSearchParams);
  }

  colDefs = COMPETITION_COL_DEFS;

  autoSizeStrategy: SizeColumnsToFitGridStrategy = {
    type: 'fitGridWidth',
    defaultMinWidth: 10,
  };
  defaultColDef: ColDef<Competition> | undefined = {
    sortable: true,
    unSortIcon: true,
    filter: true,
    resizable: true,
    minWidth: 200,
  };

  onSearch(params: CompetitionSearchParams) {
    this.hasActiveFilters = true;
    this.lastSearchParams = params;
    this.loadCompetitions(params);
  }

  onReset() {
    this.hasActiveFilters = false;
    this.lastSearchParams = {};
    this.loadCompetitions();
  }

  goToCompetition(event: RowClickedEvent<Competition>) {
    this.router.navigate([ 'competition', event.data?.id ]);
  }

  getRowClass = (params: any): string | string[] | undefined => {
    const competition = params.data as Competition;
    const currentUser = this.authService.$currentUser.value;

    if (currentUser && competition?.creatorId === currentUser.id) {
      return 'tinted';
    }
    return undefined;
  }
}
