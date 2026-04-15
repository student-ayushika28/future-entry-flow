import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center gradient-bg">
      <div className="text-center space-y-6 glass-strong rounded-2xl p-12 max-w-md">
        <div className="text-8xl font-bold bg-gradient-to-r from-primary to-muted-foreground bg-clip-text text-transparent">404</div>
        <h2 className="text-2xl font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground">The page "{location.pathname}" doesn't exist or you don't have access.</p>
        <Link to="/dashboard">
          <Button className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--neon-violet))] neon-glow">
            <Home size={18} /> Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;