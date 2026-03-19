import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function getCurrentSchoolYear(): number {
  const now = new Date();
  return now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
}

export function getSchoolYearBounds(startYear: number): { dateFrom: string; dateTo: string } {
  const year = Number(startYear);
  return {
    dateFrom: `${year}-09-01`,
    dateTo:   `${year + 1}-08-31`,
  };
}

export function formatSchoolYear(startYear: number): string {
  return `${startYear}/${String(startYear + 1).slice(-2)}`;
}

export function isInCurrentSchoolYear(date: Date): boolean {
  const currentYear = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const startYear = month >= 9 ? currentYear : currentYear - 1;
  const start = new Date(startYear, 8, 1);
  const end = new Date(startYear + 1, 7, 31);
  return date >= start && date <= end;
}

export function getAvailableSchoolYears(): number[] {
  const current = getCurrentSchoolYear();
  const years: number[] = [];
  for (let y = 2018; y <= current; y++) years.push(y);
  return years.reverse();
}

export function schoolYearValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const date = new Date(control.value);
    if (isNaN(date.getTime())) {
      return null;
    }

    if (isInCurrentSchoolYear(date)) {
      return null;
    }
    return { schoolYear: { value: control.value } };
  };
}
