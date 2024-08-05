export interface Result {
  position: number;
  specialPrize: boolean;
  compliment: boolean;
  nextRound: boolean;
}

export interface Competition {
  name: string;
  location: string;
  subject: string[];
  teacher: string[];
  year: string;
  date: Date;
  level: 'local' | 'state' | 'regional' | 'national' | 'international';
  round: 'school' | 'regional' | 'state' | 'national';
  form: ['written' | 'oral' | 'sport' | 'submission'];
  result: Result;
  note: string;
}
