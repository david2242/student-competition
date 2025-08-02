import { Form, Level, Round } from "@/app/models/competition.model";

export const COMPETITION_TRANSLATIONS = {
  level: {
    [Level.Local]: 'Helyi',
    [Level.State]: 'Vármegyei',
    [Level.National]: 'Országos',
    [Level.International]: 'Nemzetközi',
  } as const,
  
  round: {
    [Round.School]: 'Iskolai',
    [Round.Regional]: 'Regionális',
    [Round.State]: 'Vármegyei',
    [Round.National]: 'Országos',
    [Round.OktvRoundOne]: 'OKTV I. forduló',
    [Round.OktvRoundTwo]: 'OKTV II. forduló',
    [Round.OktvFinal]: 'OKTV döntő',
  } as const,
  
  form: {
    [Form.Written]: 'Írásbeli',
    [Form.Oral]: 'Szóbeli',
    [Form.Sport]: 'Sport',
    [Form.Submission]: 'Dolgozat',
  } as const,
} as const;

export function translateLevel(level: Level | null): string {
  return level ? COMPETITION_TRANSLATIONS.level[level] : '';
}

export function translateRound(round: Round | null): string {
  return round ? COMPETITION_TRANSLATIONS.round[round] : '';
}

export function translateForm(form: Form | null): string {
  return form ? COMPETITION_TRANSLATIONS.form[form] : '';
}
