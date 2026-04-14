import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, UserPlus, Users, ScanFace, QrCode, LogOut, Menu, X, Shield, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import FloatingShapes from "./FloatingShapes";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/add-visitor", label: "Add Visitor", icon: UserPlus },
  { to: "/visitors", label: "Visitor List", icon: Users },
  { to: "/qr-checkin", label: "QR Check-In", icon: QrCode },
  { to: "/watchlist", label: "Watchlist", icon: Shield },
  { to: "/audit-logs", label: "Audit Logs", icon: ScrollText },
  { to: "/face-recognition", label: "Face Scan", icon: ScanFace },
];

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen gradient-bg relative">
      <FloatingShapes />

      {/* Top navbar */}
      <header className="sticky top-0 z-40 glass border-b border-white/10">
        <div className="flex items-center justify-between px-4 h-16 md:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--neon-cyan))] flex items-center justify-center text-sm font-bold">
                V
              </div>
              <span className="font-bold text-lg hidden sm:block">VMS</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--neon-violet))] flex items-center justify-center text-xs font-bold">
                {user?.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="hidden sm:block">
                <span className="text-sm font-medium block">{user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"}</span>
                {user?.email && <span className="text-xs text-muted-foreground block">{user.email}</span>}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
              <LogOut size={18} />
              <span className="hidden sm:inline ml-1">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed md:sticky top-16 left-0 z-30 h-[calc(100vh-4rem)] w-60 glass border-r border-white/10 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
          <nav className="p-4 space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-primary/20 text-primary neon-glow"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main content */}
        <main className="flex-1 p-4 md:p-8 relative z-10 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
