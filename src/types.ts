
export interface Category {
  id: string;
  nome: string;
  slug: string;
  descricao?: string;
  cor?: string;
  icon?: string;
}

export interface Question {
  id: number | string;
  type: string;
  text: string;
  options: string[];
  correct: number;
  points: number;
  explanation: string;
  imagem_url?: string;
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
  category?: string;
  categoria_id?: string;
  categoria?: Category;
  settings: {
    random: boolean;
    results: boolean;
    review: boolean;
    lock: boolean;
  };
}