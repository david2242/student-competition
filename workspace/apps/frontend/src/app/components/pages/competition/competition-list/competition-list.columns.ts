import type { ColDef } from 'ag-grid-community';
import { Competition } from '@/app/models/competition.model';
import { translateLevel } from '@/app/translations/competition.translations';

function formatParticipants(data: { data: Competition }): string {
  const students = data.data.participants ?? [];
  if (students.length === 1) {
    return `${students[0].firstName} ${students[0].lastName}`;
  }
  return 'Csapatverseny';
}

function formatTeacher(data: { data: Competition }): string {
  return data.data.teacher[0] ?? '';
}

export const COMPETITION_COL_DEFS: ColDef[] = [
  { field: 'id',               headerName: '#',           minWidth: 50, width: 50, filter: false },
  { field: 'name',             headerName: 'Verseny neve' },
  { field: 'students',         headerName: 'Versenyző',   valueGetter: formatParticipants },
  { field: 'level',            headerName: 'Szint',       valueGetter: (p) => translateLevel(p.data.level) },
  { field: 'teacher',          headerName: 'Tanár',       valueGetter: formatTeacher },
  { field: 'result.position',  headerName: 'Helyezés',    width: 100, valueGetter: (p) => p.data.result?.position ?? '' },
  { field: 'result.nextRound', headerName: 'Továbbjutás', width: 120, valueGetter: (p) => p.data.result?.nextRound ? 'Igen' : 'Nem' },
];
