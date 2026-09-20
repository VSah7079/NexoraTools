import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, X, FlipHorizontal, Sparkles, Check, AlertCircle } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
  mode?: 'passport' | 'document';
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  mode = 'passport',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isMirrored, setIsMirrored] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);

  // Enumerate camera devices
  useEffect(() => {
    if (!isOpen) return;

    const getCameras = async () => {
      try {
        const devList = await navigator.mediaDevices.enumerateDevices();
        const videoDevs = devList.filter((d) => d.kind === 'videoinput');
        setDevices(videoDevs);
        if (videoDevs.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(videoDevs[0].deviceId);
        }
      } catch (err) {
        console.warn('Camera enumeration error:', err);
      }
    };
    getCameras();
  }, [isOpen, selectedDeviceId]);

  // Start video stream
  useEffect(() => {
    if (!isOpen) {
      stopStream();
      return;
    }

    let activeStream: MediaStream | null = null;

    const startCamera = async () => {
      setErrorMsg(null);
      setCapturedPreview(null);
      setCapturedBlob(null);

      try {
        const constraints: MediaStreamConstraints = {
          video: selectedDeviceId
            ? { deviceId: { exact: selectedDeviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
            : { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: 'user' },
          audio: false,
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        activeStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play();
        }
      } catch (err: any) {
        console.error('Camera access error:', err);
        setErrorMsg('Unable to access webcam. Please check browser permissions.');
      }
    };

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isOpen, selectedDeviceId]);

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleCaptureInstant = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flash effect
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    if (isMirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedBlob(blob);
          setCapturedPreview(URL.createObjectURL(blob));
        }
      },
      'image/jpeg',
      0.95
    );
  };

  const startCountdownCapture = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setTimeout(() => {
            handleCaptureInstant();
            setCountdown(null);
          }, 100);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleConfirmUse = () => {
    if (!capturedBlob) return;
    const file = new File([capturedBlob], `camera_capture_${Date.now()}.jpg`, {
      type: 'image/jpeg',
    });
    stopStream();
    onCapture(file);
    onClose();
  };

  const handleRetake = () => {
    setCapturedPreview(null);
    setCapturedBlob(null);
  };

  const handleCloseModal = () => {
    stopStream();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900/95 border border-white/10 rounded-3xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                Live Studio Camera
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                  Direct Capture
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {mode === 'passport' ? 'Align face within oval guide for 35×45mm standard' : 'Position document flat in viewfinder'}
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseModal}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Canvas Area */}
        <div className="relative flex-1 bg-black min-h-[360px] sm:min-h-[440px] flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-contain max-h-[500px] ${isMirrored ? 'scale-x-[-1]' : ''} ${
              capturedPreview ? 'hidden' : 'block'
            }`}
          />

          {capturedPreview && (
            <img
              src={capturedPreview}
              alt="Captured Frame"
              className="w-full h-full object-contain max-h-[500px] animate-in zoom-in-95 duration-150"
            />
          )}

          {/* White Camera Flash Overlay */}
          {isFlashing && (
            <div className="absolute inset-0 bg-white pointer-events-none animate-out fade-out duration-200 z-30" />
          )}

          {/* Countdown Number Overlay */}
          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none bg-black/40">
              <span className="text-8xl sm:text-9xl font-black text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] animate-ping duration-1000">
                {countdown}
              </span>
            </div>
          )}

          {/* Passport Face Oval Alignment Guide (Only during live feed) */}
          {!capturedPreview && mode === 'passport' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              {/* Oval Face Silhouette */}
              <div className="relative w-48 h-64 sm:w-56 sm:h-72 rounded-[50%] border-2 border-dashed border-indigo-400/80 shadow-[0_0_0_9999px_rgba(3,7,18,0.45)] flex flex-col items-center justify-between py-6">
                <div className="text-[10px] uppercase font-bold tracking-wider text-indigo-300 bg-slate-900/90 px-2 py-0.5 rounded-full border border-indigo-500/40">
                  Top of Head
                </div>

                {/* Eye line marker */}
                <div className="w-full flex items-center justify-between px-2">
                  <span className="w-3 h-0.5 bg-cyan-400" />
                  <span className="text-[9px] text-cyan-300 font-mono tracking-widest bg-slate-900/80 px-1 rounded">
                    — EYE LEVEL —
                  </span>
                  <span className="w-3 h-0.5 bg-cyan-400" />
                </div>

                <div className="text-[10px] uppercase font-bold tracking-wider text-indigo-300 bg-slate-900/90 px-2 py-0.5 rounded-full border border-indigo-500/40">
                  Chin Level
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-950/90 text-center space-y-3 z-30">
              <AlertCircle className="w-10 h-10 text-rose-500" />
              <p className="text-sm font-semibold text-rose-300 max-w-sm">{errorMsg}</p>
              <button
                onClick={() => setSelectedDeviceId(devices[0]?.deviceId || '')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
              >
                Retry Camera
              </button>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Bottom Control Bar */}
        <div className="px-5 py-4 bg-slate-950/90 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Camera options */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            {devices.length > 1 && !capturedPreview && (
              <select
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-medium text-slate-200 border border-white/10 focus:outline-none focus:border-indigo-500 max-w-[160px] truncate"
              >
                {devices.map((d, i) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Camera ${i + 1}`}
                  </option>
                ))}
              </select>
            )}

            {!capturedPreview && (
              <button
                onClick={() => setIsMirrored(!isMirrored)}
                title="Mirror Video"
                className={`p-2 rounded-xl border border-white/10 transition-colors text-xs flex items-center gap-1.5 font-medium ${
                  isMirrored ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <FlipHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Mirror</span>
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {!capturedPreview ? (
              <>
                <button
                  onClick={startCountdownCapture}
                  disabled={countdown !== null || !!errorMsg}
                  className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>3s Timer Shot</span>
                </button>

                <button
                  onClick={handleCaptureInstant}
                  disabled={!!errorMsg}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer transform active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>Take Photo</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleRetake}
                  className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retake</span>
                </button>

                <button
                  onClick={handleConfirmUse}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Use This Photo</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
