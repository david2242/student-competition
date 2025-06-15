import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Role } from "@/app/models/current-user";

export function schoolYearValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const date = new Date(control.value);
    if (isNaN(date.getTime())) {
      return null;
    }
    const currentYear = new Date().getFullYear();
    const month = new Date().getMonth() + 1; // 1-12

    const isNewSchoolYear = month >= 9;
    const startYear = isNewSchoolYear ? currentYear : currentYear - 1;

    const schoolYearStart = new Date(startYear, 8, 1);
    const schoolYearEnd = new Date(startYear + 1, 7, 31);

    if (date >= schoolYearStart && date <= schoolYearEnd) {
      return null;
    } else {
      return { schoolYear: { value: control.value } };
    }
  };
}
