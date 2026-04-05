import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  Target,
  Award,
  BarChart3
} from 'lucide-react';
import { api } from '../lib/api';
import { cn } from '../lib/utils';

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

export function StudentResultDetailPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [result, setResult] = React.useState<any>(null);
  const [exam, setExam] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        if (!slug) return;
        const data = await api.get(`/resultados/slug/${slug}`);
        setResult(data);
        setExam(data.exam);
      } catch (err) {
        console.error('Error loading result detail:', err);
        setError('Erro ao carregar detalhes do resultado.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [slug, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6 font-sans text-on-surface antialiased">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-error/10 flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8 text-error" />
          </div>
          <h1 className="text-2xl font-black text-on-surface font-headline">{error}</h1>
          <button onClick={() => navigate('/student/dashboard')} className="btn-primary px-8 py-3 rounded-xl font-bold text-sm">
            Voltar à Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  const isApproved = result ? result.pontuacao >= 70 : false;
  const erros = result ? result.total - result.acertos : 0;

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface antialiased relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute top-[40%] -right-[5%] w-[30%] h-[40%] rounded-full bg-secondary/6 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/student/dashboard')}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-bold text-xs uppercase tracking-widest mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar à Dashboard
        </motion.button>
...
            {/* Bottom action */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-10 flex justify-center"
            >
              <button
                onClick={() => navigate('/student/dashboard')}
                className="btn-primary px-8 py-3.5 rounded-xl font-bold text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar à Dashboard
              </button>
            </motion.div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default StudentResultDetailPage;
