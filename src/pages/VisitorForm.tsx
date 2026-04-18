import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Phone, FileText, CheckCircle2, Loader2 } from "lucide-react";
import FloatingShapes from "@/components/FloatingShapes";

const purposes = ["Campus Tour", "Interview", "Meeting", "Document Submission", "Event Attendance", "Other"];

const VisitorForm = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [form, setForm] = useState({ name: "", phone: "", purpose: "", personToMeet: "", email: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 200);
    return () => clearTimeout(t);
  }, []);

  if (booting) {
    return (
      <div className="min-h-screen gradient-bg flex flex-col items-center justify-center gap-4 p-4 relative">
        <FloatingShapes />
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--neon-cyan))] flex items-center justify-center text-2xl font-bold animate-pulse z-10">V</div>
        <div className="flex items-center gap-2 text-muted-foreground z-10">
          <Loader2 className="animate-spin" size={18} /> Loading visitor form…
        </div>
      </div>
    );
  }

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!/^\d{10}$/.test(form.phone)) e.phone = "Enter a valid 10-digit phone number";
    if (!form.purpose) e.purpose = "Select a purpose";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    const { error } = await supabase.from("visitors").insert({
      name: form.name.trim(),
      email: form.email.trim() || "N/A",
      phone: form.phone.trim(),
      purpose: form.purpose,
      person_to_meet: form.personToMeet.trim() || "General",
      date_time: new Date().toISOString(),
      status: "Pending",
    });
    setLoading(false);

    if (error) {
      toast({ title: "Error", description: "Failed to submit. Please try again.", variant: "destructive" });
      return;
    }

    setSubmitted(true);
    toast({ title: "Request Submitted!", description: "Your visit request is pending admin approval." });
  };

  if (submitted) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4 relative">
        <FloatingShapes />
        <Card className="glass border-white/10 p-8 max-w-md w-full text-center space-y-6 relative z-10 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
            <CheckCircle2 className="text-green-400" size={40} />
          </div>
          <h2 className="text-2xl font-bold">Request Submitted!</h2>
          <p className="text-muted-foreground">
            Your visit request has been sent to the admin for approval. Please wait at the reception area.
          </p>
          <div className="px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-sm text-yellow-300 font-medium">Status: Pending Approval</p>
          </div>
          <Button variant="outline" onClick={() => { setSubmitted(false); setForm({ name: "", phone: "", purpose: "", personToMeet: "", email: "" }); }}>
            Submit Another Request
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 relative">
      <FloatingShapes />
      <Card className="glass border-white/10 p-8 max-w-lg w-full space-y-6 relative z-10 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--neon-cyan))] flex items-center justify-center mx-auto text-xl font-bold">
            V
          </div>
          <h1 className="text-2xl font-bold">Visitor Check-In</h1>
          <p className="text-sm text-muted-foreground">Please fill in your details to request entry</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input id="name" placeholder="Enter your full name" className="pl-10 glass border-white/10" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input id="phone" placeholder="10-digit phone number" className="pl-10 glass border-white/10" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input id="email" type="email" placeholder="your@email.com" className="glass border-white/10" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>Purpose of Visit *</Label>
            <Select value={form.purpose} onValueChange={v => setForm({ ...form, purpose: v })}>
              <SelectTrigger className="glass border-white/10">
                <SelectValue placeholder="Select purpose" />
              </SelectTrigger>
              <SelectContent>
                {purposes.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.purpose && <p className="text-xs text-destructive">{errors.purpose}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="personToMeet">Person / Dept to Meet</Label>
            <div className="relative">
              <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input id="personToMeet" placeholder="e.g. Dr. Mehta, Admin Office" className="pl-10 glass border-white/10" value={form.personToMeet} onChange={e => setForm({ ...form, personToMeet: e.target.value })} />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-base font-semibold neon-glow" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </span>
            ) : "Submit Visit Request"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default VisitorForm;
