export interface Result {
  position: number | null;
  specialPrize: boolean;
  compliment: boolean;
  nextRound: boolean;
}

export interface Competition {
  id?: number;
  name: string;
  location: string;
  subject: string[];
  teacher: string[];
  year: string;
  level: 'local' | 'state' | 'regional' | 'national' | 'international';
  round: 'school' | 'regional' | 'state' | 'national';
  form: ['written' | 'oral' | 'sport' | 'submission'];
  result: Result;
  note: string;
}

