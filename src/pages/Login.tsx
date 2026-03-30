import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Mail, Lock, LogIn } from "lucide-react";
import FloatingShapes from "@/components/FloatingShapes";

const Login = () => {
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("admin@12");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    if (login(email, password)) {
      toast({ title: "Welcome back!", description: "Login successful." });
      navigate("/dashboard");
    } else {
      toast({ title: "Login Failed", description: "Invalid credentials.", variant: "destructive" });
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
          <p className="text-muted-foreground mt-2 text-sm">Sign in to your admin panel</p>
        </div>

        {/* Card */}
        <form onSubmit={handleSubmit} className="glass-strong rounded-2xl p-8 space-y-6">
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
                Sign In
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Demo: admin@gmail.com / admin@12
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
