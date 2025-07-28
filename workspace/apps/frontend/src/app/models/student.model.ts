export interface Student {
  studentId?: number;  // For existing students, to match backend DTO
  name?: string;
  class?: string;
  firstName?: string;
  lastName?: string;
  classYear?: number;
  classLetter?: string;
  schoolYear?: number; // For display purposes only, not sent to backend
  isNew?: boolean;
}

export interface StudentSearchResult extends Student {
  participations: StudentParticipation[];
  fullName: string;
  currentClassYear: number;
  currentClassLetter: string;
}

export interface StudentParticipation {
  competitionId: number;
  competitionName: string;
  competitionDate: string;
  classYear: number;
  classLetter: string;
  schoolYear: number;
  createdAt: string;
}

export interface ExistingParticipant {
  studentId: number;
  classYear: number;
  classLetter: string;
}

export interface NewParticipant {
  firstName: string;
  lastName: string;
  classYear: number;
  classLetter: string;
}
