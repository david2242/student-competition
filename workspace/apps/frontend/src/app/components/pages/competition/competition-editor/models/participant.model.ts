// Participant in the context of a competition
export interface CompetitionParticipant {
  studentId?: number;   // Defined for existing students, undefined for new participants
  firstName: string;    // Required for new participants
  lastName: string;     // Required for new participants
  classYear: number;
  classLetter: string;
}

// Search result for existing students
export interface StudentSearchResult {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  participations: StudentParticipation[];
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

// Type guard to check if a participant is an existing student
export function isExistingStudent(participant: CompetitionParticipant): participant is CompetitionParticipant & { studentId: number } {
  return participant.studentId !== undefined;
}
