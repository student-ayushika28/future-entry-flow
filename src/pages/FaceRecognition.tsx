import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Camera, ScanFace, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import AppLayout from "@/components/AppLayout";

type ScanState = "idle" | "scanning" | "processing" | "success" | "failed";

const FaceRecognition = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setCapturedImage(null);
      setScanState("idle");
    } catch {
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to use face recognition.",
        variant: "destructive",
      });
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const captureAndScan = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setScanState("scanning");

    // Capture frame
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 640;
    canvas.height = 480;
    ctx.drawImage(videoRef.current, 0, 0, 640, 480);

    // Draw scanning overlay animation
    const imageData = canvas.toDataURL("image/png");
    setCapturedImage(imageData);
    stopCamera();

    // Simulate face detection processing
    setScanState("processing");
    await new Promise(r => setTimeout(r, 2500));

    // Simulate 80% success rate
    const recognized = Math.random() > 0.2;
    if (recognized) {
      setScanState("success");
      toast({ title: "Face Recognized!", description: "Visitor identity verified. Access granted." });
    } else {
      setScanState("failed");
      toast({ title: "Recognition Failed", description: "Face not found in database. Please register first.", variant: "destructive" });
    }
  }, [stopCamera]);

  const reset = () => {
    setCapturedImage(null);
    setScanState("idle");
    startCamera();
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Face Recognition Entry</h1>
          <p className="text-muted-foreground text-sm mt-1">Verify visitor identity using facial recognition</p>
        </div>

        <div className="glass-strong rounded-2xl p-6 md:p-8 space-y-6">
          {/* Camera / Capture View */}
          <div className="relative aspect-[4/3] max-w-lg mx-auto rounded-xl overflow-hidden bg-black/50 border border-white/10">
            {cameraActive && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}

            {capturedImage && !cameraActive && (
              <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
            )}

            {!cameraActive && !capturedImage && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
                <Camera size={48} className="opacity-40" />
                <p className="text-sm">Camera is off</p>
              </div>
            )}

            {/* Scanning overlay */}
            {scanState === "scanning" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-[hsl(var(--neon-cyan))] rounded-2xl animate-pulse neon-glow-cyan" />
                <div className="absolute w-48 h-0.5 bg-gradient-to-r from-transparent via-[hsl(var(--neon-cyan))] to-transparent animate-scan-line" />
              </div>
            )}

            {/* Processing overlay */}
            {scanState === "processing" && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 border-3 border-[hsl(var(--neon-cyan))]/30 border-t-[hsl(var(--neon-cyan))] rounded-full animate-spin" />
                <p className="text-sm font-medium text-[hsl(var(--neon-cyan))]">Analyzing facial features...</p>
              </div>
            )}

            {/* Success overlay */}
            {scanState === "success" && (
              <div className="absolute inset-0 bg-[hsl(var(--success))]/10 flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                <CheckCircle2 size={64} className="text-[hsl(var(--success))]" />
                <p className="text-lg font-semibold text-[hsl(var(--success))]">Identity Verified</p>
                <p className="text-sm text-muted-foreground">Access Granted</p>
              </div>
            )}

            {/* Failed overlay */}
            {scanState === "failed" && (
              <div className="absolute inset-0 bg-destructive/10 flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                <XCircle size={64} className="text-destructive" />
                <p className="text-lg font-semibold text-destructive">Not Recognized</p>
                <p className="text-sm text-muted-foreground">Visitor not in database</p>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {!cameraActive && scanState === "idle" && (
              <Button
                onClick={startCamera}
                className="h-12 px-8 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--neon-cyan))] hover:opacity-90 neon-glow text-base font-semibold"
              >
                <Camera size={18} />
                Start Camera
              </Button>
            )}

            {cameraActive && (
              <Button
                onClick={captureAndScan}
                className="h-12 px-8 bg-gradient-to-r from-[hsl(var(--neon-cyan))] to-[hsl(var(--primary))] hover:opacity-90 neon-glow-cyan text-base font-semibold"
              >
                <ScanFace size={18} />
                Scan Face
              </Button>
            )}

            {(scanState === "success" || scanState === "failed") && (
              <Button
                onClick={reset}
                variant="outline"
                className="h-12 px-8 border-white/10 text-base"
              >
                <RefreshCw size={18} />
                Scan Again
              </Button>
            )}
          </div>

          {/* Info */}
          <div className="glass rounded-xl p-4 text-sm text-muted-foreground space-y-2">
            <p className="font-medium text-foreground">How it works:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Click "Start Camera" to activate your webcam</li>
              <li>Position your face within the frame</li>
              <li>Click "Scan Face" to capture and verify identity</li>
              <li>The system compares against registered visitor database</li>
            </ul>
            <p className="text-xs italic mt-2">Note: This is a simulated face recognition for demo purposes.</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default FaceRecognition;
