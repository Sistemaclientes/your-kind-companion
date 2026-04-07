// Storage utilities - kept for backward compatibility
// Primary data is now in the backend SQLite database

const STORAGE_KEY = 'avaliapro_exams_v2';

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
  };
}

export const storage = {
  getExams: (): Exam[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
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