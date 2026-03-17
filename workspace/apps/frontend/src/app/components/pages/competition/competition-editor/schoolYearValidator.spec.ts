import { FormControl } from '@angular/forms';
import { schoolYearValidator } from './schoolYearValidator';

function makeControl(value: string): FormControl {
    const ctrl = new FormControl(value);
    return ctrl;
}

function currentSchoolYearDate(): string {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = month >= 9 ? now.getFullYear() : now.getFullYear() - 1;
    // Pick a date well inside the school year: October 15
    return `${year}-10-15`;
}

function pastSchoolYearDate(): string {
    const now = new Date();
    const month = now.getMonth() + 1;
    const startYear = month >= 9 ? now.getFullYear() : now.getFullYear() - 1;
    // A date two school years ago
    return `${startYear - 2}-10-15`;
}

function summerDate(): string {
    // August is outside the school year (school year ends on Aug 31 of start+1, but
    // August of the *start* year is the previous school year's summer)
    const now = new Date();
    const month = now.getMonth() + 1;
    const startYear = month >= 9 ? now.getFullYear() : now.getFullYear() - 1;
    // July of the current school year's start year is before Sep 1 of that year
    return `${startYear}-07-15`;
}

describe('schoolYearValidator', () => {
    const validator = schoolYearValidator();

    it('should return null for a date within the current school year', () => {
        const ctrl = makeControl(currentSchoolYearDate());
        expect(validator(ctrl)).toBeNull();
    });

    it('should return an error for a date from a past school year', () => {
        const ctrl = makeControl(pastSchoolYearDate());
        const result = validator(ctrl);
        expect(result).not.toBeNull();
        expect(result).toHaveProperty('schoolYear');
        expect(result!['schoolYear'].value).toBe(pastSchoolYearDate());
    });

    it('should return an error for a date outside the school year (summer before Sept 1)', () => {
        const ctrl = makeControl(summerDate());
        const result = validator(ctrl);
        expect(result).not.toBeNull();
        expect(result).toHaveProperty('schoolYear');
    });

    it('should return null for an invalid date string (graceful skip)', () => {
        const ctrl = makeControl('not-a-date');
        expect(validator(ctrl)).toBeNull();
    });

    it('should return null on Sept 1 (school year start boundary)', () => {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = month >= 9 ? now.getFullYear() : now.getFullYear() - 1;
        const ctrl = makeControl(`${year}-09-01`);
        expect(validator(ctrl)).toBeNull();
    });

    it('should return null on Aug 30 (within school year end period)', () => {
        // Aug 31 is the last valid day but parses as UTC midnight, which is after
        // local midnight in UTC+ zones. Use Aug 30 to stay timezone-safe.
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = month >= 9 ? now.getFullYear() : now.getFullYear() - 1;
        const ctrl = makeControl(`${year + 1}-08-30`);
        expect(validator(ctrl)).toBeNull();
    });
});
