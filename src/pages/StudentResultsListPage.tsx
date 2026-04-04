import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Trophy, Eye, BarChart3 } from 'lucide-react';
import { cn } from '../lib/utils';
import { TopBar } from '../components/TopBar';

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

export function StudentResultsListPage() {
  const navigate = useNavigate();
  const [results, setResults] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.get('/resultados');
        setResults(data);
      } catch (err) {
        console.error('Error fetching results:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <TopBar title="Meus Resultados" subtitle="Histórico de provas realizadas" />
      <div className="pt-24 px-4 sm:px-8 pb-12 max-w-[1600px] mx-auto">
        <div className="max-w-4xl mx-auto space-y-4 mt-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)
          ) : results.length === 0 ? (
            <div className="card-saas !p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-7 h-7 text-primary" />
              </div>
              <p className="text-base font-bold text-on-surface mb-1">Nenhuma prova realizada</p>
              <p className="text-sm text-on-surface-variant font-medium">Comece fazendo uma prova disponível.</p>
            </div>
          ) : (
            [...results].reverse().map((result, idx) => {
              const realIdx = results.length - 1 - idx;
              const isApproved = result.pontuacao >= 70;
              const dateStr = result.data ? new Date(result.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
              return (
                <motion.div
                  key={realIdx}
                  whileHover={{ scale: 1.01 }}
                  className="card-saas !p-5"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-headline font-black text-xl",
                      isApproved ? "bg-primary/10 text-primary" : "bg-error/10 text-error"
                    )}>
                      {(result.pontuacao / 10).toFixed(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-on-surface truncate">{result.prova_titulo}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{dateStr}</span>
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{result.acertos}/{result.total} acertos</span>
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                          isApproved ? "text-primary bg-primary/10 border-primary/20" : "text-error bg-error/10 border-error/20"
                        )}>
                          {isApproved ? 'Aprovado' : 'Reprovado'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/aluno/resultado/${realIdx}`)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-outline text-on-surface-variant font-bold text-[10px] uppercase tracking-widest hover:bg-surface-container-high hover:text-primary transition-all shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Detalhes</span>
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

export default StudentResultsListPage;
