
export interface Question {
  id: number;
  type: string;
  text: string;
  options: string[];
  correct: number;
  points: number;
  explanation: string;
}

export interface Exam {
  id: string;
  title: string;
  subtitle: string;
  status: 'Ativa' | 'Rascunho' | 'Finalizada';
  students: string;
  date: string;
  questions: Question[];
  duration: number;
  category: string;
  settings: {
    random: boolean;
    results: boolean;
    review: boolean;
    lock: boolean;
  };
}