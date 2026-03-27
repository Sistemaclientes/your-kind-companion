
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

const STORAGE_KEY = 'avaliapro_exams_v2';

const initialExams: Exam[] = [];

// Reset exams for this session as requested by the user
if (typeof window !== 'undefined') {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
}

export const storage = {
  getExams: (): Exam[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialExams));
      return initialExams;
    }
    return JSON.parse(stored);
  },
  saveExam: (exam: Exam) => {
    const exams = storage.getExams();
    const index = exams.findIndex(e => e.id === exam.id);
    if (index >= 0) {
      exams[index] = exam;
    } else {
      exams.unshift(exam);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(exams));
  },
  deleteExam: (id: string) => {
    const exams = storage.getExams();
    const filtered = exams.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },
  clearAllExams: () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
};
