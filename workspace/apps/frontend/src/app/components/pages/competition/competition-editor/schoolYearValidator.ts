import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function isInCurrentSchoolYear(date: Date): boolean {
  const currentYear = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const startYear = month >= 9 ? currentYear : currentYear - 1;
  const start = new Date(startYear, 8, 1);
  const end = new Date(startYear + 1, 7, 31);
  return date >= start && date <= end;
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
