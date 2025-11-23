import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from "@angular/router";
import { CompetitionService } from "@/app/services/competition.service";
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
import { translateLevel } from "@/app/translations/competition.translations";
import { AuthService } from "@/app/services/auth.service";

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
  imports: [ CommonModule, AgGridAngular ],
  templateUrl: './competition-list.component.html',
  styleUrl: './competition-list.component.css',
})
export class CompetitionListComponent implements OnInit {

  competitionService = inject(CompetitionService);
  router = inject(Router);
  notification = inject(NotificationService);
  authService = inject(AuthService);

  ngOnInit(): void {
    this.competitionService.getCompetitions().subscribe({
      next: (response) => {
        // Ensure we always set an array, even if response is null/undefined
        if (Array.isArray(response)) {
          this.rowData = response;
        } else {
          // Fallback to empty array if response is not in expected format
          console.warn('Unexpected response format, defaulting to empty array:', response);
          this.rowData = [];
        }
      },
      error: (error) => {
        console.error('Error loading competitions:', error);
        this.notification.error('Nem sikerült betölteni a versenyeket!');
        // Ensure rowData is always an array, even on error
        this.rowData = [];
      }
    });
  }

  rowData?: Competition[];

  colDefs: ColDef[] = [
    {
      field: "id",
      headerName: "#",
      minWidth: 50,
      width: 50,
      filter: false
    },
    {
      field: "name",
      headerName: "Verseny neve"
    },
    {
      field: "students",
      headerName: "Versenyző",
      valueGetter: (data) => {
        const students = data.data.participants || [];
        if (students.length === 1) {
          return students[0].firstName + ' ' + students[0].lastName;
        } else return 'Csapatverseny'
      }
    },
    {
      field: "level",
      headerName: "Szint",
      valueGetter: (data) => translateLevel(data.data.level)
    },
    {
      field: "teacher",
      headerName: "Tanár",
      valueGetter: (data) => data.data.teacher[0] || ''
    },
    {
      field: "result.position",
      headerName: "Helyezés",
      width: 100,
      valueGetter: (data) => data.data.result?.position || ''
    },
    {
      field: "result.nextRound",
      headerName: "Továbbjutás",
      width: 120,
      valueGetter: (data) => data.data.result?.nextRound ? 'Igen' : 'Nem'
    }
  ];

  autoSizeStrategy: SizeColumnsToFitGridStrategy = {
    type: 'fitGridWidth',
    defaultMinWidth: 10,
  };
  defaultColDef: ColDef<Competition> | undefined = {
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 200,
  };

  goToCompetition($event: RowClickedEvent<Competition>) {
    this.router.navigate([ 'competition', $event.data?.id ]);
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
