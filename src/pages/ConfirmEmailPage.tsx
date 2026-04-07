import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, XCircle } from 'lucide-react';
import { motion } from 'motion/react';

/**
 * Supabase Auth handles email confirmation automatically.
 * This page just shows a friendly message.
 */
export function ConfirmEmailPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-surface-container p-8 rounded-3xl shadow-2xl border border-outline text-center space-y-6"
      >
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-black text-on-surface">E-mail Confirmado!</h1>
        <p className="text-on-surface-variant font-medium">Sua conta foi verificada com sucesso. Você já pode fazer login.</p>
        <button 
          onClick={() => navigate('/student/login')}
          className="btn-primary w-full py-3.5 rounded-xl font-bold"
        >
          Ir para Login
        </button>
      </motion.div>
    </div>
  );
}

export default ConfirmEmailPage;
