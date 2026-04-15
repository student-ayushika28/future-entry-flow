import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ShieldCheck, Lock } from "lucide-react";
import FloatingShapes from "@/components/FloatingShapes";

const BYPASS_CODE = "123456";

const OTPVerification = () => {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    text.split("").forEach((ch, i) => { newOtp[i] = ch; });
    setOtp(newOtp);
    inputRefs.current[Math.min(text.length, 5)]?.focus();
  };

  const handleVerify = () => {
    const code = otp.join("");
    if (code.length !== 6) {
      toast({ title: "Incomplete Code", description: "Please enter all 6 digits.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      if (code === BYPASS_CODE) {
        sessionStorage.setItem("mfa_verified", "true");
        toast({ title: "Verified!", description: "Multi-factor authentication successful." });
        navigate("/dashboard", { replace: true });
      } else {
        toast({ title: "Invalid Code", description: "The verification code is incorrect.", variant: "destructive" });
        setOtp(Array(6).fill(""));
        inputRefs.current[0]?.focus();
      }
      setLoading(false);
    }, 800);
  };

  const handleResend = () => {
    setTimeLeft(30);
    toast({ title: "Code Resent", description: "A new verification code has been sent to your device." });
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      <FloatingShapes />
      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--neon-cyan))] flex items-center justify-center mb-4 neon-glow">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Two-Factor Authentication
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Enter the 6-digit verification code sent to your device
          </p>
        </div>

        <div className="glass-strong rounded-2xl p-8 space-y-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Lock size={14} />
            <span>Secure verification required</span>
          </div>

          <div className="flex justify-center gap-3" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-2xl font-bold rounded-xl bg-white/5 border border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition-all duration-200 text-foreground"
              />
            ))}
          </div>

          <Button
            onClick={handleVerify}
            disabled={loading || otp.join("").length !== 6}
            className="w-full h-12 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--neon-violet))] hover:opacity-90 transition-all duration-300 neon-glow text-base font-semibold"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck size={18} className="mr-2" />
                Verify & Continue
              </>
            )}
          </Button>

          <div className="text-center">
            {timeLeft > 0 ? (
              <p className="text-sm text-muted-foreground">
                Resend code in <span className="text-primary font-semibold">{timeLeft}s</span>
              </p>
            ) : (
              <button onClick={handleResend} className="text-sm text-primary hover:underline font-medium">
                Resend Verification Code
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
