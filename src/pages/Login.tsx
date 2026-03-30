import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/hooks/use-toast";
import { Mail, Lock, LogIn, ShieldCheck, ArrowLeft } from "lucide-react";
import FloatingShapes from "@/components/FloatingShapes";

const SIMULATED_OTP = "123456";

const Login = () => {
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("admin@12");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    if (email === "admin@gmail.com" && password === "admin@12") {
      toast({ title: "OTP Sent!", description: "A 6-digit code has been sent to your email. (Demo: 123456)" });
      setStep("otp");
    } else {
      toast({ title: "Login Failed", description: "Invalid email or password.", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleOtpVerify = async () => {
    setLoading(true);
    setOtpError(false);
    await new Promise(r => setTimeout(r, 600));
    if (otp === SIMULATED_OTP) {
      login(email, password);
      toast({ title: "Welcome back!", description: "Authentication successful." });
      navigate("/dashboard");
    } else {
      setOtpError(true);
      toast({ title: "Invalid OTP", description: "The code you entered is incorrect.", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      <FloatingShapes />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--neon-cyan))] flex items-center justify-center text-2xl font-bold mb-4 neon-glow">
            V
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Visitor Management
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {step === "credentials" ? "Sign in to your admin panel" : "Two-Factor Authentication"}
          </p>
        </div>

        {step === "credentials" ? (
          <form onSubmit={handleCredentials} className="glass-strong rounded-2xl p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 focus:border-primary"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--neon-violet))] hover:opacity-90 transition-all duration-300 neon-glow text-base font-semibold"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  Continue
                </>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Demo: admin@gmail.com / admin@12
            </p>
          </form>
        ) : (
          <div className="glass-strong rounded-2xl p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-[hsl(var(--neon-cyan))] to-[hsl(var(--primary))] flex items-center justify-center mb-2 neon-glow-cyan">
                <ShieldCheck size={28} />
              </div>
              <h2 className="text-xl font-semibold">Enter Verification Code</h2>
              <p className="text-muted-foreground text-sm">
                We've sent a 6-digit code to <span className="text-foreground font-medium">{email}</span>
              </p>
            </div>

            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} className={otpError ? "border-destructive" : ""} />
                  <InputOTPSlot index={1} className={otpError ? "border-destructive" : ""} />
                  <InputOTPSlot index={2} className={otpError ? "border-destructive" : ""} />
                  <InputOTPSlot index={3} className={otpError ? "border-destructive" : ""} />
                  <InputOTPSlot index={4} className={otpError ? "border-destructive" : ""} />
                  <InputOTPSlot index={5} className={otpError ? "border-destructive" : ""} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {otpError && (
              <p className="text-center text-sm text-destructive">Invalid code. Please try again.</p>
            )}

            <Button
              onClick={handleOtpVerify}
              disabled={loading || otp.length < 6}
              className="w-full h-12 bg-gradient-to-r from-[hsl(var(--neon-cyan))] to-[hsl(var(--primary))] hover:opacity-90 transition-all duration-300 neon-glow-cyan text-base font-semibold"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Verify & Sign In
                </>
              )}
            </Button>

            <button
              onClick={() => { setStep("credentials"); setOtp(""); setOtpError(false); }}
              className="flex items-center gap-1 mx-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={14} /> Back to login
            </button>

            <p className="text-center text-xs text-muted-foreground">
              Demo OTP: 123456
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
