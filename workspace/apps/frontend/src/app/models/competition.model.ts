import { Student } from "@/app/models/student.model";

export interface Result {
  position: number | null;
  specialPrize: boolean;
  compliment: boolean;
  nextRound: boolean;
}

export interface Competition {
  id?: number;
  created?: string;
  name: string;
  students: Student[];
  location: string;
  subject: string[];
  teacher: string[];
  date: string;
  level: Level | null;
  round: Round | null;
  forms: (Form | null)[];
  result: Result;
  other: string;
}

export enum Level {
  Local = 'LOCAL',
  State = 'STATE',
  National = 'NATIONAL',
  International = 'INTERNATIONAL',
}

export enum Round {
  School = 'SCHOOL',
  Regional = 'REGIONAL',
  State = 'STATE',
  National = 'NATIONAL',
  OktvRoundOne = 'OKTV_ROUND_ONE',
  OktvRoundTwo = 'OKTV_ROUND_TWO',
  OktvFinal = 'OKTV_FINAL',
}

export enum Form {
  Written = 'WRITTEN',
  Oral = 'ORAL',
  Sport = 'SPORT',
  Submission = 'SUBMISSION',
}
