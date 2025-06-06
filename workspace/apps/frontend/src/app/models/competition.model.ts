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
  form: (Form | null)[];
  result: Result;
  other: string;
}

export enum Level
{
  Local,
  State,
  Regional,
  National,
  International
}

export enum Round
{
  School,
  Regional,
  State,
  National,
  OktvRoundOne,
  OktvRoundTwo,
  OktvFinal,
}

export enum Form
{
  Written,
  Oral,
  Sport,
  Submission
}
