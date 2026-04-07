import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, LayoutDashboard, MapPinOff } from 'lucide-react';

const REDIRECT_SECONDS = 4;
const LAST_ROUTE_KEY = 'last_valid_route';
const ADMIN_FALLBACK = '/admin/dashboard';

export function NotFoundPage() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

  const lastRoute = React.useMemo(() => {
    const saved = localStorage.getItem(LAST_ROUTE_KEY);
    // Avoid redirecting back to a non-existent or current page
    if (saved && saved !== window.location.pathname && saved !== '/') return saved;
    return null;
  }, []);

  const redirectTarget = lastRoute || ADMIN_FALLBACK;
  const redirectLabel = lastRoute ? lastRoute : 'Painel';

  const handleRedirect = useCallback(() => {
    navigate(redirectTarget, { replace: true });
  }, [navigate, redirectTarget]);

  useEffect(() => {
    if (countdown <= 0) {
      handleRedirect();
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, handleRedirect]);

  return (
    <div className="min-h-[100dvh] bg-surface flex items-center justify-center p-4 relative overflow-hidden font-sans text-on-surface antialiased">
      {/* Ambient background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[15%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/8 blur-[140px]" />
        <div className="absolute bottom-[5%] right-[-5%] w-[40%] h-[40%] rounded-full bg-secondary/6 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'radial-gradient(var(--color-primary) 0.5px, transparent 0.5px)', backgroundSize: '28px 28px' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 w-full max-w-lg text-center space-y-8"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5, ease: 'easeOut' }}
          className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-primary/10 border border-primary/15 flex items-center justify-center shadow-lg shadow-primary/5"
        >
          <MapPinOff className="w-9 h-9 sm:w-11 sm:h-11 text-primary" strokeWidth={1.5} />
        </motion.div>

        {/* 404 Number */}
        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="text-7xl sm:text-8xl font-black text-on-surface/10 font-headline tracking-tighter select-none leading-none"
        >
          404
        </motion.p>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-3"
        >
          <h1 className="text-xl sm:text-2xl font-black text-on-surface font-headline tracking-tight">
            Página não encontrada
          </h1>
          <p className="text-sm sm:text-base text-on-surface-variant font-medium leading-relaxed max-w-sm mx-auto">
            Parece que você tentou acessar algo que não existe ou foi movido.
          </p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          {lastRoute && (
            <button
              onClick={() => navigate(lastRoute, { replace: true })}
              className="btn-primary px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2.5 group w-full sm:w-auto justify-center"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Voltar para onde eu estava
            </button>
          )}
          <button
            onClick={() => navigate(ADMIN_FALLBACK, { replace: true })}
            className="btn-secondary px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2.5 group w-full sm:w-auto justify-center"
          >
            <LayoutDashboard className="w-4 h-4" />
            Ir para o painel
          </button>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="space-y-3"
        >
          <p className="text-xs text-on-surface-variant font-medium">
            Redirecionando para <span className="text-primary font-bold">{redirectLabel}</span> em{' '}
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-primary/10 text-primary font-black text-xs tabular-nums">
              {countdown}
            </span>
          </p>
          {/* Progress bar */}
          <div className="mx-auto w-48 h-1 rounded-full bg-outline overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: REDIRECT_SECONDS, ease: 'linear' }}
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default NotFoundPage;
