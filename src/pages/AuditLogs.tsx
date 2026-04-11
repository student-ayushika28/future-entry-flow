import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ScrollText } from "lucide-react";
import AppLayout from "@/components/AppLayout";

interface AuditEntry {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, any> | null;
  created_at: string;
}

const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    const { data } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(100);
    if (data) setLogs(data as AuditEntry[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const actionColor = (action: string) => {
    if (action.includes("approve")) return "bg-[hsl(var(--success)/0.2)] text-[hsl(var(--success))]";
    if (action.includes("reject") || action.includes("delete")) return "bg-destructive/20 text-destructive";
    if (action.includes("create") || action.includes("add")) return "bg-primary/20 text-primary";
    return "bg-[hsl(var(--warning)/0.2)] text-[hsl(var(--warning))]";
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <ScrollText size={28} className="text-primary" /> Audit Logs
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Complete activity history</p>
        </div>

        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-muted-foreground">
                  <th className="text-left py-3 px-4 font-medium">Time</th>
                  <th className="text-left py-3 px-4 font-medium">Action</th>
                  <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">Entity</th>
                  <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-muted-foreground text-xs">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={`${actionColor(log.action)} border-0 text-xs`}>{log.action}</Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">
                      {log.entity_type}{log.entity_id ? ` #${log.entity_id.slice(0, 8)}` : ""}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs hidden md:table-cell max-w-[300px] truncate">
                      {log.details ? JSON.stringify(log.details) : "—"}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr><td colSpan={4} className="py-12 text-center text-muted-foreground">
                    {loading ? "Loading..." : "No audit logs yet"}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AuditLogs;
