import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, ChevronRight, Award, Play } from 'lucide-react';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import { TopBar } from '../components/TopBar';

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

export function StudentExamsListPage() {
  const navigate = useNavigate();
  const [exams, setExams] = React.useState<any[]>([]);
  const [results, setResults] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const info = localStorage.getItem('student_info');
    if (!info) return;
    const parsed = JSON.parse(info);

    const fetchData = async () => {
      try {
        const [allExams, allResults] = await Promise.all([
          api.get('/provas'),
          Promise.resolve(JSON.parse(localStorage.getItem('local_resultados') || '[]'))
        ]);
        setExams(allExams);
        setResults(allResults.filter((r: any) => r.email_aluno === parsed.email));
      } catch (err) {
        console.error('Error loading exams:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const approvedExamIds = new Set(results.filter(r => r.pontuacao >= 70).map(r => r.prova_id));
  const availableExams = exams.filter((exam: any) => !approvedExamIds.has(exam.id));

  return (
    <>
      <TopBar title="Provas Disponíveis" subtitle="Escolha uma prova para realizar" />
      <div className="pt-[60px] p-4 sm:p-8">
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
                onClick={() => {
                  if (!exam.slug) return;
                  navigate(`/prova/${exam.slug}`);
                }}
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
