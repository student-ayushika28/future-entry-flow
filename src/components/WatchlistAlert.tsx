import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, X, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WatchlistMatch {
  visitorName: string;
  reason: string;
  riskLevel: string;
}

const WatchlistAlert = () => {
  const [alerts, setAlerts] = useState<WatchlistMatch[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const checkWatchlist = async () => {
      const { data: visitors } = await supabase
        .from("visitors")
        .select("name, email, phone")
        .order("created_at", { ascending: false })
        .limit(50);

      const { data: watchlist } = await supabase
        .from("watchlist")
        .select("name, email, phone, reason, risk_level")
        .eq("is_active", true);

      if (!visitors || !watchlist) return;

      const matches: WatchlistMatch[] = [];
      for (const v of visitors) {
        for (const w of watchlist) {
          const nameMatch = v.name.toLowerCase().includes(w.name.toLowerCase()) ||
            w.name.toLowerCase().includes(v.name.toLowerCase());
          const emailMatch = v.email && w.email && v.email.toLowerCase() === w.email.toLowerCase();
          const phoneMatch = v.phone && w.phone && v.phone === w.phone;

          if (nameMatch || emailMatch || phoneMatch) {
            matches.push({
              visitorName: v.name,
              reason: w.reason,
              riskLevel: w.risk_level,
            });
          }
        }
      }
      setAlerts(matches);
    };

    checkWatchlist();
    const interval = setInterval(checkWatchlist, 30000);
    return () => clearInterval(interval);
  }, []);

  const visibleAlerts = alerts.filter(a => !dismissed.has(a.visitorName));
  if (visibleAlerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {visibleAlerts.map((alert, i) => (
        <div
          key={`${alert.visitorName}-${i}`}
          className="relative overflow-hidden rounded-2xl border border-destructive/50 animate-pulse-alert"
        >
          {/* Flashing red background */}
          <div className="absolute inset-0 bg-destructive/10 animate-flash-red" />

          <div className="relative flex items-start gap-4 p-4">
            <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center flex-shrink-0">
              <ShieldAlert size={22} className="text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={14} className="text-destructive" />
                <span className="text-sm font-bold text-destructive uppercase tracking-wide">
                  Watchlist Alert — {alert.riskLevel.toUpperCase()} Risk
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground">
                ⚠️ <span className="text-destructive">{alert.visitorName}</span> matches a watchlisted individual
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Reason: {alert.reason}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => setDismissed(prev => new Set(prev).add(alert.visitorName))}
            >
              <X size={16} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WatchlistAlert;
