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
} from 'ag-grid-community';
import { Competition } from "@/app/models/competition.model";
import { ToastrService } from "ngx-toastr";
import { translateLevel } from "@/app/shared/translations/competition.translations";

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  ColumnAutoSizeModule,
  NumberFilterModule,
  PaginationModule,
  QuickFilterModule,
  RowSelectionModule,
  TextFilterModule,
  ValidationModule,
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
  toastr = inject(ToastrService);

  ngOnInit(): void {
    this.competitionService.getCompetitions().subscribe({
      next: (competitions) => this.rowData = competitions,
      error: () => this.toastr.error('Nem sikerült betölteni a versenyeket!'),
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
        const students = data.data.students || [];
        return students.length === 1 ? students[0].name : 'Csapatverseny';
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
}
