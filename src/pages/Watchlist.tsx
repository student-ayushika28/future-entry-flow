import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Shield, Plus, Trash2, Search, AlertTriangle } from "lucide-react";
import AppLayout from "@/components/AppLayout";

interface WatchlistEntry {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  reason: string;
  risk_level: string;
  is_active: boolean;
  created_at: string;
}

const riskColors: Record<string, string> = {
  low: "bg-[hsl(var(--success)/0.2)] text-[hsl(var(--success))]",
  medium: "bg-[hsl(var(--warning)/0.2)] text-[hsl(var(--warning))]",
  high: "bg-orange-500/20 text-orange-400",
  critical: "bg-destructive/20 text-destructive",
};

const Watchlist = () => {
  const [entries, setEntries] = useState<WatchlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", reason: "", risk_level: "medium" });

  const fetchEntries = useCallback(async () => {
    const { data } = await supabase.from("watchlist").select("*").order("created_at", { ascending: false });
    if (data) setEntries(data as WatchlistEntry[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const handleAdd = async () => {
    if (!form.name.trim() || !form.reason.trim()) {
      toast({ title: "Required", description: "Name and reason are required.", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("watchlist").insert([{
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      reason: form.reason.trim(),
      risk_level: form.risk_level as any,
    }]);
    if (error) {
      toast({ title: "Error", description: "Failed to add entry.", variant: "destructive" });
      return;
    }
    toast({ title: "Added to Watchlist", description: `${form.name} has been flagged.` });
    setForm({ name: "", phone: "", email: "", reason: "", risk_level: "medium" });
    setShowAdd(false);
    fetchEntries();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("watchlist").delete().eq("id", id);
    toast({ title: "Removed", description: "Entry removed from watchlist." });
    fetchEntries();
  };

  const filtered = entries.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    (e.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Shield className="text-destructive" size={28} /> Watchlist
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Flagged individuals and security alerts</p>
          </div>
          <Button onClick={() => setShowAdd(true)} className="neon-glow">
            <Plus size={16} className="mr-1" /> Add Entry
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input placeholder="Search watchlist..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-white/10" />
        </div>

        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-muted-foreground">
                  <th className="text-left py-3 px-4 font-medium">Name</th>
                  <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">Contact</th>
                  <th className="text-left py-3 px-4 font-medium">Reason</th>
                  <th className="text-left py-3 px-4 font-medium">Risk</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-medium flex items-center gap-2">
                      <AlertTriangle size={14} className="text-[hsl(var(--warning))]" /> {e.name}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">
                      {e.phone || e.email || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground max-w-[200px] truncate">{e.reason}</td>
                    <td className="py-3 px-4">
                      <Badge className={`${riskColors[e.risk_level]} border-0 text-xs uppercase`}>{e.risk_level}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(e.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="py-12 text-center text-muted-foreground">
                    {loading ? "Loading..." : "No watchlist entries found"}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="glass-strong border-white/10">
          <DialogHeader>
            <DialogTitle>Add to Watchlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="bg-white/5 border-white/10" placeholder="Full name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="bg-white/5 border-white/10" placeholder="Phone" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="bg-white/5 border-white/10" placeholder="Email" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reason *</Label>
              <Input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
                className="bg-white/5 border-white/10" placeholder="Why is this person flagged?" />
            </div>
            <div className="space-y-2">
              <Label>Risk Level</Label>
              <Select value={form.risk_level} onValueChange={v => setForm({ ...form, risk_level: v })}>
                <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd} className="neon-glow">Add to Watchlist</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Watchlist;
