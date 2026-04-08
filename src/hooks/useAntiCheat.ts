import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AntiCheatConfig {
  enabled: boolean;
  maxViolations: number;
  attemptId: string | null;
  onTerminate: () => void;
}

export interface AntiCheatState {
  violations: number;
  isFullscreen: boolean;
  lastViolationType: string | null;
}

export function useAntiCheat({ enabled, maxViolations, attemptId, onTerminate }: AntiCheatConfig) {
  const [state, setState] = useState<AntiCheatState>({
    violations: 0,
    isFullscreen: false,
    lastViolationType: null,
  });
  const violationsRef = useRef(0);
  const terminatedRef = useRef(false);

  const addViolation = useCallback(async (type: string, metadata: Record<string, any> = {}) => {
    if (!enabled || terminatedRef.current || !attemptId) return;

    violationsRef.current += 1;
    const count = violationsRef.current;

    setState(prev => ({ ...prev, violations: count, lastViolationType: type }));

    // Log to database
    try {
      await supabase.from('violations_log').insert({
        attempt_id: attemptId,
        type,
        metadata,
      });

      await supabase.from('exam_attempts').update({ violations: count }).eq('id', attemptId);
    } catch (err) {
      console.error('Failed to log violation:', err);
    }

    if (count >= maxViolations) {
      terminatedRef.current = true;
      onTerminate();
    }
  }, [enabled, maxViolations, attemptId, onTerminate]);

  const requestFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
      setState(prev => ({ ...prev, isFullscreen: true }));
    } catch {
      // User denied
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Fullscreen change
    const onFullscreenChange = () => {
      const isFs = !!document.fullscreenElement;
      setState(prev => ({ ...prev, isFullscreen: isFs }));
      if (!isFs && !terminatedRef.current) {
        addViolation('exit_fullscreen');
      }
    };

    // Tab visibility
    const onVisibilityChange = () => {
      if (document.hidden && !terminatedRef.current) {
        addViolation('tab_switch');
      }
    };

    // Window blur
    const onBlur = () => {
      if (!terminatedRef.current) {
        addViolation('window_blur');
      }
    };

    // Copy/paste
    const onCopy = (e: Event) => {
      e.preventDefault();
      addViolation('copy_attempt');
    };
    const onPaste = (e: Event) => {
      e.preventDefault();
      addViolation('paste_attempt');
    };

    // Right-click
    const onContextMenu = (e: Event) => {
      e.preventDefault();
      addViolation('right_click');
    };

    // DevTools detection
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) ||
          (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) ||
          (e.ctrlKey && (e.key === 'U' || e.key === 'u'))) {
        e.preventDefault();
        addViolation('devtools_attempt', { key: e.key });
      }
    };

    // Multi-screen detection
    const checkMultiScreen = () => {
      if (window.screen && (window.screen as any).isExtended) {
        addViolation('multi_screen');
      }
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);
    document.addEventListener('copy', onCopy);
    document.addEventListener('paste', onPaste);
    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('keydown', onKeyDown);

    checkMultiScreen();
    const screenInterval = setInterval(checkMultiScreen, 10000);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('paste', onPaste);
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('keydown', onKeyDown);
      clearInterval(screenInterval);
    };
  }, [enabled, addViolation]);

  return { ...state, requestFullscreen, addViolation };
}
