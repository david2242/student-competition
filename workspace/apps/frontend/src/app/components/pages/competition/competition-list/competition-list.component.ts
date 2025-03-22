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

  ngOnInit(): void {
    this.competitionService.getCompetitions().subscribe(competitions => this.rowData = competitions);
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
      headerName: "Versenyző neve"
    },
    {
      field: "subject",
      headerName: "Tantárgy",
      valueGetter: (data) => data.data.subject[0]
    },
    {
      field: "result.position",
      headerName: "Helyezés"
    },
    {
      field: "date",
      headerName: "Dátum",
      valueGetter: data => new Date(data.data.date).toLocaleString('hu') || ''
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
