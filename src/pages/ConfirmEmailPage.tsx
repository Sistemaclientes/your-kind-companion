import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2, XCircle } from 'lucide-react';
import { api } from '../lib/api';
import { motion } from 'motion/react';

export function ConfirmEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [status, setStatus] = React.useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = React.useState('Verificando seu e-mail...');

  React.useEffect(() => {
    const confirm = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Token de confirmação não encontrado.');
        return;
      }

      try {
        const res = await api.get(`/confirmar-email?token=${token}`);
        setStatus('success');
        setMessage(res.message || 'E-mail confirmado com sucesso!');
        setTimeout(() => navigate('/aluno/login'), 3000);
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Erro ao confirmar e-mail. O link pode ter expirado.');
      }
    };

    confirm();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-surface-container p-8 rounded-3xl shadow-2xl border border-outline text-center space-y-6"
      >
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
          {status === 'loading' && <Loader2 className="w-8 h-8 text-primary animate-spin" />}
          {status === 'success' && <ShieldCheck className="w-8 h-8 text-green-500" />}
          {status === 'error' && <XCircle className="w-8 h-8 text-red-500" />}
        </div>

        <h1 className="text-2xl font-black text-on-surface">
          {status === 'loading' && 'Confirmando e-mail'}
          {status === 'success' && 'Tudo pronto!'}
          {status === 'error' && 'Ops! Algo deu errado'}
        </h1>

        <p className="text-on-surface-variant font-medium">
          {message}
        </p>

        {status !== 'loading' && (
          <button 
            onClick={() => navigate('/aluno/login')}
            className="btn-primary w-full py-3.5 rounded-xl font-bold"
          >
            Ir para Login
          </button>
        )}
      </motion.div>
    </div>
  );
}
