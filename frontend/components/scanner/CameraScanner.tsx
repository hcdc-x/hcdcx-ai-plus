// frontend/components/scanner/CameraScanner.tsx
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, RefreshCw, Zap, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import toast from 'react-hot-toast';

// 动态导入扫描库以避免 SSR 问题
let scanImageData: any = null;

interface CameraScannerProps {
  onScan: (decodedText: string) => void;
  onClose?: () => void;
}

export function CameraScanner({ onScan, onClose }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>('');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [lastScanTime, setLastScanTime] = useState(0);

  // 加载扫描库
  useEffect(() => {
    const loadScanner = async () => {
      try {
        // @ts-ignore - 动态导入
        const module = await import('@zxing/library');
        // 使用 ZXing 的多格式读取器
        const { BrowserMultiFormatReader } = module;
        scanImageData = new BrowserMultiFormatReader();
      } catch (err) {
        console.error('Failed to load scanner library:', err);
        // 降级使用简单的图像处理
      }
    };
    loadScanner();
  }, []);

  // 初始化摄像头
  const initCamera = useCallback(async (deviceId?: string) => {
    try {
      setError(null);
      const constraints: MediaStreamTrackConstraints = {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'environment',
      };
      if (deviceId) {
        constraints.deviceId = { exact: deviceId };
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: constraints,
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setHasPermission(true);
        setIsScanning(true);

        // 获取可用设备列表
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        setDevices(videoDevices);
        if (!deviceId && videoDevices.length > 0) {
          setCurrentDeviceId(videoDevices[0].deviceId);
        }
      }
    } catch (err) {
      console.error('Camera error:', err);
      setHasPermission(false);
      setError('Camera access denied or not available');
      toast.error('Camera access denied');
    }
  }, []);

  // 切换摄像头
  const switchCamera = async () => {
    const currentIndex = devices.findIndex((d) => d.deviceId === currentDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    const nextDevice = devices[nextIndex];
    if (nextDevice) {
      stopCamera();
      await initCamera(nextDevice.deviceId);
      setCurrentDeviceId(nextDevice.deviceId);
    }
  };

  // 切换闪光灯
  const toggleFlash = async () => {
    if (!streamRef.current) return;
    try {
      const track = streamRef.current.getVideoTracks()[0];
      // @ts-ignore - 实验性 API
      const capabilities = track.getCapabilities();
      // @ts-ignore
      if (capabilities.torch) {
        // @ts-ignore
        await track.applyConstraints({
          advanced: [{ torch: !flashEnabled }],
        });
        setFlashEnabled(!flashEnabled);
      } else {
        toast.error('Flash not supported on this device');
      }
    } catch (err) {
      toast.error('Failed to toggle flash');
    }
  };

  // 停止摄像头
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
    setIsScanning(false);
  };

  // 扫描帧
  const scanFrame = useCallback(() => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

      // 防抖：避免短时间内重复扫描
      const now = Date.now();
      if (now - lastScanTime > 500) {
        // 尝试扫描
        if (scanImageData) {
          scanImageData
            .decodeFromCanvas(canvas)
            .then((result: any) => {
              if (result && result.getText()) {
                setLastScanTime(now);
                setScanResult(result.getText());
                onScan(result.getText());
              }
            })
            .catch(() => {
              // 未识别到码，继续
            });
        } else {
          // 降级方案：使用浏览器原生 BarcodeDetector API
          if ('BarcodeDetector' in window) {
            // @ts-ignore
            const detector = new BarcodeDetector({ formats: ['qr_code', 'ean_13', 'code_128'] });
            detector
              .detect(canvas)
              .then((barcodes: any[]) => {
                if (barcodes.length > 0) {
                  setLastScanTime(now);
                  setScanResult(barcodes[0].rawValue);
                  onScan(barcodes[0].rawValue);
                }
              })
              .catch(() => {});
          }
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanFrame);
  }, [isScanning, onScan, lastScanTime]);

  // 启动扫描循环
  useEffect(() => {
    if (isScanning) {
      animationFrameRef.current = requestAnimationFrame(scanFrame);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isScanning, scanFrame]);

  // 组件挂载时初始化
  useEffect(() => {
    initCamera();
    return () => {
      stopCamera();
    };
  }, [initCamera]);

  const handleClose = () => {
    stopCamera();
    onClose?.();
  };

  if (hasPermission === false || error) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h3 className="text-lg font-medium">Camera Access Required</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Please allow camera access to scan codes
        </p>
        <Button onClick={initCamera} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="relative h-[400px] w-full overflow-hidden rounded-lg bg-black">
      {/* 视频预览 */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* 扫描框覆盖层 */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <motion.rect
            x="20"
            y="20"
            width="60"
            height="60"
            fill="none"
            stroke="#00FFFF"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="opacity-70"
          />
          {/* 角落装饰 */}
          <path
            d="M 20 30 L 20 20 L 30 20"
            fill="none"
            stroke="#00FFFF"
            strokeWidth="2"
            className="opacity-90"
          />
          <path
            d="M 70 20 L 80 20 L 80 30"
            fill="none"
            stroke="#00FFFF"
            strokeWidth="2"
            className="opacity-90"
          />
          <path
            d="M 20 70 L 20 80 L 30 80"
            fill="none"
            stroke="#00FFFF"
            strokeWidth="2"
            className="opacity-90"
          />
          <path
            d="M 80 70 L 80 80 L 70 80"
            fill="none"
            stroke="#00FFFF"
            strokeWidth="2"
            className="opacity-90"
          />
        </svg>

        {/* 扫描线动画 */}
        <motion.div
          className="absolute left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-transparent via-neon-cyan to-transparent"
          initial={{ top: '20%' }}
          animate={{ top: '80%' }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* 状态指示器 */}
      <div className="absolute left-4 top-4 flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-cyan opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-cyan" />
          </span>
          <span className="text-xs text-white">Scanning</span>
        </div>
      </div>

      {/* 控制栏 */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between">
        <div className="flex gap-2">
          {devices.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={switchCamera}
              className="bg-black/60 text-white backdrop-blur-sm hover:bg-black/70"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFlash}
            className={cn(
              'bg-black/60 text-white backdrop-blur-sm hover:bg-black/70',
              flashEnabled && 'text-yellow-400'
            )}
          >
            <Zap className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="bg-black/60 text-white backdrop-blur-sm hover:bg-black/70"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* 扫描结果显示 */}
      {scanResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-20 left-4 right-4 rounded-lg bg-black/80 p-3 backdrop-blur-md"
        >
          <p className="text-xs text-muted-foreground">Scanned:</p>
          <p className="truncate text-sm text-neon-cyan">{scanResult}</p>
        </motion.div>
      )}

      {/* 隐藏的 canvas 用于图像处理 */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
