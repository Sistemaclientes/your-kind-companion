import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProctoringConfig {
  enabled: boolean;
  captureIntervalSec: number;
  attemptId: string | null;
}

export function useProctoring({ enabled, captureIntervalSec, attemptId }: ProctoringConfig) {
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);
      setCameraError(null);
    } catch (err: any) {
      setCameraError(err.message || 'Câmera não disponível');
      setCameraReady(false);
    }
  }, []);

  const captureAndUpload = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !attemptId || !cameraReady) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 320;
    canvas.height = 240;
    ctx.drawImage(videoRef.current, 0, 0, 320, 240);

    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.6));
    if (!blob) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const filename = `${user.id}/${attemptId}/${Date.now()}.jpg`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('proctoring')
        .upload(filename, blob, { contentType: 'image/jpeg' });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from('proctoring').getPublicUrl(filename);

      await supabase.from('proctoring_logs').insert({
        attempt_id: attemptId,
        image_url: publicUrl,
      });
    } catch (err) {
      console.error('Proctoring capture error:', err);
    }
  }, [attemptId, cameraReady]);

  const stopCamera = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  useEffect(() => {
    if (!enabled || !attemptId) return;
    startCamera();
    return () => stopCamera();
  }, [enabled, attemptId, startCamera, stopCamera]);

  useEffect(() => {
    if (!enabled || !cameraReady || !attemptId) return;

    // First capture after 5 seconds
    const timeout = setTimeout(() => {
      captureAndUpload();
      intervalRef.current = setInterval(captureAndUpload, captureIntervalSec * 1000);
    }, 5000);

    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, cameraReady, attemptId, captureIntervalSec, captureAndUpload]);

  return { videoRef, canvasRef, cameraReady, cameraError, stopCamera };
}
