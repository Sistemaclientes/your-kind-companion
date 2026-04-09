import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ExamTimerConfig {
  attemptId: string | null;
  initialSeconds: number;
  enabled: boolean;
  syncIntervalSec?: number;
  onExpired: () => void;
}

export function useExamTimer({
  attemptId,
  initialSeconds,
  enabled,
  syncIntervalSec = 30,
  onExpired,
}: ExamTimerConfig) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const expiredRef = useRef(false);
  const onExpiredRef = useRef(onExpired);
  onExpiredRef.current = onExpired;

  // Update initial time when it changes (e.g. after fetching from backend)
  useEffect(() => {
    if (initialSeconds > 0) {
      setTimeLeft(initialSeconds);
    }
  }, [initialSeconds]);

  // Local countdown
  useEffect(() => {
    if (!enabled || expiredRef.current) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          expiredRef.current = true;
          onExpiredRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [enabled]);

  // Backend sync
  useEffect(() => {
    if (!enabled || !attemptId || expiredRef.current) return;

    const interval = setInterval(async () => {
      try {
        const { data } = await supabase.functions.invoke('exam-manager', {
          body: { action: 'sync-time', attempt_id: attemptId },
        });

        let parsed = data;
        if (typeof data === 'string') try { parsed = JSON.parse(data); } catch {}

        if (parsed?.remaining_seconds !== undefined) {
          setTimeLeft(parsed.remaining_seconds);
          if (parsed.status === 'expired' || parsed.remaining_seconds <= 0) {
            expiredRef.current = true;
            onExpiredRef.current();
          }
        }
      } catch {}
    }, syncIntervalSec * 1000);

    return () => clearInterval(interval);
  }, [enabled, attemptId, syncIntervalSec]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    timeLeft,
    formatted: formatTime(timeLeft),
    isExpired: expiredRef.current,
    isCritical: timeLeft < 300,
  };
}
