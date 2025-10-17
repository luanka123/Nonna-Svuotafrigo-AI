import React, { useState, useEffect, useRef } from 'react';
import { identifyIngredientsFromImage } from '../services/geminiService';
import { t } from '../translations';

interface CameraScannerProps {
  onClose: () => void;
  onIngredientsScanned: (ingredients: string[]) => void;
  lang: 'it' | 'en';
}

const CameraScanner: React.FC<CameraScannerProps> = ({ onClose, onIngredientsScanned, lang }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          // It's good practice to call play() as some browsers might not autoplay
          videoRef.current.play().catch(e => {
              console.error("Error playing video stream:", e);
              setError(t('cameraError'));
          });
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setError(t('cameraError'));
      }
    };

    startCamera();

    return () => {
      activeStream?.getTracks().forEach(track => track.stop());
    };
  }, []); // Empty dependency array ensures this runs only on mount/unmount


  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsLoading(true);
    setError(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (!context) {
        setError(t('genericScanError'));
        setIsLoading(false);
        return;
    }
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const base64Data = dataUrl.split(',')[1];

    try {
      const ingredients = await identifyIngredientsFromImage(base64Data, lang);
      if (ingredients && ingredients.length > 0) {
        onIngredientsScanned(ingredients);
        onClose();
      } else {
        setError(t('noIngredientsError'));
      }
    } catch (err: any) {
      setError(err.message || t('genericScanError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="camera-scanner-title">
      <div className="relative w-full max-w-2xl aspect-video bg-slate-900 rounded-lg overflow-hidden shadow-2xl">
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" aria-label="Live camera feed" />
        <canvas ref={canvasRef} className="hidden" />
        {isLoading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white">
                 <div className="w-12 h-12 border-4 border-t-4 border-slate-200 border-t-green-600 rounded-full animate-spin"></div>
                 <p className="mt-4 text-lg" id="camera-scanner-title">{t('analyzing')}</p>
            </div>
        )}
      </div>

       {error && <div className="mt-4 text-center text-red-400 bg-red-900 bg-opacity-50 p-3 rounded-lg max-w-2xl">{error}</div>}

      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={handleCapture}
          disabled={isLoading || !stream}
          className="bg-green-700 text-white font-bold py-3 px-6 rounded-full hover:bg-green-800 transition-colors disabled:bg-slate-500 disabled:cursor-not-allowed text-lg"
        >
          {isLoading ? t('scanning') : t('scanIngredients')}
        </button>
        <button
          onClick={onClose}
          className="bg-slate-600 text-white font-bold py-3 px-6 rounded-full hover:bg-slate-700 transition-colors text-lg"
        >
          {t('cancel')}
        </button>
      </div>
    </div>
  );
};

export default CameraScanner;