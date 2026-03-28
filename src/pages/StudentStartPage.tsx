import React from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Play, 
  ShieldCheck, 
  Clock, 
  FileText,
  AlertCircle,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { api } from '../lib/api';
import { phoneMask } from '../lib/masks';

export function StudentStartPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [exams, setExams] = React.useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = React.useState<string>('');
  const [formData, setFormData] = React.useState({ nome: '', email: '', telefone: '' });

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        if (slug) {
          // Load specific exam by slug
          const exam = await api.get(`/provas/slug/${slug}`);
          setExams([exam]);
          setSelectedExamId(exam.id.toString());
        } else {
          // Load all exams
          const data = await api.get('/provas');
          setExams(data);
          if (data.length > 0) setSelectedExamId(data[0].id.toString());
        }
      } catch (err) {
        console.error('Error fetching exams:', err);
      }
    };
    fetchData();
  }, [slug]);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamId) {
      alert('Por favor, selecione uma prova.');
      return;
    }
    localStorage.setItem('student_info', JSON.stringify({ ...formData, examId: selectedExamId }));
    navigate('/student/exam');
  };

  const selectedExam = exams.find(e => e.id.toString() === selectedExamId);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 relative overflow-hidden font-sans text-on-surface antialiased">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]"></div>
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[50%] rounded-full bg-secondary/10 blur-[100px]"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[30%] rounded-full bg-primary/20 blur-[120px]"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#0F8B8D 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
      </div>

      <div className="w-full max-w-6xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-10"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-primary/10 text-primary rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-primary/20 shadow-sm">
            <ShieldCheck className="w-4 h-4" />
            Ambiente Seguro de Avaliação
          </div>
          
          <div className="space-y-6">
            <h1 className="text-3xl md:text-4xl font-black text-on-surface font-headline leading-[1.15] tracking-tight">
              {selectedExam ? selectedExam.titulo : 'Carregando...'}
            </h1>
            <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed font-medium max-w-xl">
              {selectedExam ? selectedExam.descricao : 'Bem-vindo à sua avaliação profissional. Prepare-se para demonstrar seus conhecimentos técnicos.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 max-w-md">
            <div className="card-saas !p-6 flex items-center gap-5 group">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-sm border border-primary/10">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <p className="text-3xl font-black text-on-surface font-headline tracking-tighter">
                  {selectedExam ? selectedExam.qCount : '0'}
                </p>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Questões</p>
              </div>
            </div>
            <div className="card-saas !p-6 flex items-center gap-5 group">
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform shadow-sm border border-secondary/10">
                <Clock className="w-7 h-7" />
              </div>
              <div>
                <p className="text-3xl font-black text-on-surface font-headline tracking-tighter">60</p>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Minutos</p>
              </div>
            </div>
          </div>

          <div className="p-8 bg-surface-container-high rounded-[32px] text-on-surface shadow-2xl shadow-primary/5 border border-outline relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
            <h4 className="font-bold text-lg mb-6 flex items-center gap-3 font-headline">
              <AlertCircle className="w-6 h-6 text-primary" />
              Instruções de Segurança
            </h4>
            <ul className="space-y-4 text-sm font-medium text-on-surface-variant">
              <li className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0 shadow-[0_0_8px_rgba(15,139,141,0.8)]"></div>
                <span>Mantenha o foco na aba da prova. Saídas frequentes podem invalidar seu teste.</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0 shadow-[0_0_8px_rgba(15,139,141,0.8)]"></div>
                <span>O tempo é contínuo. Mesmo se desconectar, o cronômetro continuará rodando.</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0 shadow-[0_0_8px_rgba(15,139,141,0.8)]"></div>
                <span>Ao finalizar, certifique-se de clicar no botão "Enviar" para registrar sua nota.</span>
              </li>
            </ul>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-surface-container p-10 md:p-12 rounded-[40px] shadow-2xl shadow-primary/5 border border-outline relative"
        >
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-primary/5 rounded-full blur-2xl"></div>
          
          <header className="mb-10">
            <h3 className="text-3xl font-black text-on-surface font-headline tracking-tight mb-2">Identificação</h3>
            <p className="text-on-surface-variant font-medium">Preencha seus dados para iniciar a avaliação.</p>
          </header>
          
          <form className="space-y-8" onSubmit={handleStart}>
            <div className="space-y-3">
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Selecionar Prova</label>
              <div className="relative group">
                <FileText className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
                <select 
                  className="w-full pl-14 pr-12 py-4.5 bg-surface-container-low border border-outline rounded-2xl text-on-surface font-semibold focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none appearance-none cursor-pointer"
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  required
                >
                  {exams.length === 0 ? (
                    <option value="">Carregando provas...</option>
                  ) : (
                    exams.map(exam => (
                      <option key={exam.id} value={exam.id}>{exam.titulo}</option>
                    ))
                  )}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Nome Completo</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
                <input 
                  className="w-full pl-14 pr-6 py-4.5 bg-surface-container-low border border-outline rounded-2xl text-on-surface font-semibold placeholder:text-on-surface-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none" 
                  placeholder="Seu nome completo" 
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">E-mail Acadêmico</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
                <input 
                  className="w-full pl-14 pr-6 py-4.5 bg-surface-container-low border border-outline rounded-2xl text-on-surface font-semibold placeholder:text-on-surface-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none" 
                  placeholder="exemplo@email.com" 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Telefone / WhatsApp</label>
              <div className="relative group">
                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
                <input 
                  className="w-full pl-14 pr-6 py-4.5 bg-surface-container-low border border-outline rounded-2xl text-on-surface font-semibold placeholder:text-on-surface-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none" 
                  placeholder="(00) 00000-0000" 
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: phoneMask(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="pt-6">
              <button 
                className="w-full btn-primary py-5 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-4 group"
                type="submit"
              >
                <Play className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
                <span>Iniciar Avaliação</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>

          <footer className="mt-10 text-center">
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest leading-relaxed">
              Ao iniciar, você concorda com nossos <br/>
              <a className="text-primary hover:underline underline-offset-4" href="#">Termos de Uso</a> e <a className="text-primary hover:underline underline-offset-4" href="#">Privacidade</a>.
            </p>
          </footer>
        </motion.div>
      </div>
    </div>
  );
}
