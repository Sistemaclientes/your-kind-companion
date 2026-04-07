import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, ChevronRight, Award, Play } from 'lucide-react';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import { TopBar } from '../components/TopBar';
import { useAuthStore } from '../lib/authStore';

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

export function StudentExamsListPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [exams, setExams] = React.useState<any[]>([]);
  const [results, setResults] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [allExams, allResults] = await Promise.all([
          api.get('/provas'),
          api.get('/resultados')
        ]);
        setExams(allExams);
        setResults(allResults);
      } catch (err) {
        console.error('Error loading exams:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const approvedExamIds = new Set(results.filter(r => r.pontuacao >= 70).map(r => r.prova_id));
  const availableExams = exams.filter((exam: any) => !approvedExamIds.has(exam.id));

  return (
    <>
      <TopBar title="Provas Disponíveis" subtitle="Escolha uma prova para realizar" />
      <div className="pt-24 px-4 sm:px-8 pb-12 max-w-[1600px] mx-auto">
        <div className="max-w-4xl mx-auto space-y-4 mt-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
          ) : availableExams.length === 0 ? (
            <div className="card-saas !p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Award className="w-7 h-7 text-primary" />
              </div>
              <p className="text-base font-bold text-on-surface mb-1">Parabéns!</p>
              <p className="text-sm text-on-surface-variant font-medium">Você foi aprovado em todas as provas disponíveis.</p>
            </div>
          ) : (
            availableExams.map((exam: any) => (
              <motion.div
                key={exam.id}
                whileHover={{ scale: 1.01 }}
                className="card-saas !p-5 flex items-center gap-4 cursor-pointer"
                onClick={() => navigate(`/student/start?examId=${exam.id}`)}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-on-surface truncate">{exam.titulo}</p>
                  <p className="text-xs text-on-surface-variant font-medium truncate">{exam.descricao || 'Sem descrição'}</p>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{exam.qCount || exam.perguntas?.length || 0} questões</span>
                </div>
                <ChevronRight className="w-5 h-5 text-on-surface-variant shrink-0" />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default StudentExamsListPage;
