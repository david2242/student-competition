export type LanguageLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type LanguageExamType = 'Komplex' | 'Írásbeli' | 'Szóbeli';
export type ExamBody = 'ECL' | 'ORIGÓ' | 'TELC' | 'BME' | 'Egyéb';
export type ExamLanguage = 'Angol' | 'Német' | 'Francia' | 'Olasz' | 'Spanyol' | 'Orosz' | 'Egyéb';

export interface LanguageExam {
  id: number;
  studentId: number;
  studentFirstName: string;
  studentLastName: string;
  language: ExamLanguage;
  level: LanguageLevel;
  type: LanguageExamType;
  teacher: string;
  date: string;
  examBody: ExamBody;
  creatorId?: string;
  createdAt: string;
  updatedAt?: string;
}

export const EXAM_LANGUAGES: ExamLanguage[] = ['Angol', 'Német', 'Francia', 'Olasz', 'Spanyol', 'Orosz', 'Egyéb'];
export const EXAM_LEVELS: LanguageLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
export const EXAM_TYPES: LanguageExamType[] = ['Komplex', 'Írásbeli', 'Szóbeli'];
export const EXAM_BODIES: ExamBody[] = ['ECL', 'ORIGÓ', 'TELC', 'BME', 'Egyéb'];
