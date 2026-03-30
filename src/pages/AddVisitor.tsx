import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useVisitors } from "@/contexts/VisitorContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, FileText, UserCheck, CalendarDays, Send } from "lucide-react";
import AppLayout from "@/components/AppLayout";

const fields = [
  { name: "name", label: "Full Name", icon: User, type: "text", placeholder: "John Doe" },
  { name: "email", label: "Email", icon: Mail, type: "email", placeholder: "john@example.com" },
  { name: "phone", label: "Phone Number", icon: Phone, type: "tel", placeholder: "9876543210" },
  { name: "purpose", label: "Purpose of Visit", icon: FileText, type: "text", placeholder: "Interview / Meeting" },
  { name: "personToMeet", label: "Person to Meet", icon: UserCheck, type: "text", placeholder: "Dr. Smith" },
  { name: "dateTime", label: "Date & Time", icon: CalendarDays, type: "datetime-local", placeholder: "" },
] as const;

type FormData = Record<(typeof fields)[number]["name"], string>;

const AddVisitor = () => {
  const { addVisitor } = useVisitors();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormData>({ name: "", email: "", phone: "", purpose: "", personToMeet: "", dateTime: "" });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validate = () => {
    const e: Partial<FormData> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone)) e.phone = "10-digit phone required";
    if (!form.purpose.trim()) e.purpose = "Purpose is required";
    if (!form.personToMeet.trim()) e.personToMeet = "Required";
    if (!form.dateTime) e.dateTime = "Date & time required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    addVisitor(form);
    toast({ title: "Visitor Added!", description: `${form.name} has been registered.` });
    setLoading(false);
    navigate("/visitors");
  };

  const update = (key: keyof FormData, val: string) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }));
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">Add Visitor</h1>
          <p className="text-muted-foreground text-sm mt-1">Register a new visitor entry</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-strong rounded-2xl p-6 md:p-8 space-y-5">
          {fields.map(({ name, label, icon: Icon, type, placeholder }) => (
            <div key={name} className="space-y-1.5">
              <Label htmlFor={name}>{label}</Label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id={name}
                  type={type}
                  placeholder={placeholder}
                  value={form[name]}
                  onChange={e => update(name, e.target.value)}
                  className={`pl-10 bg-white/5 border-white/10 focus:border-primary ${errors[name] ? "border-destructive" : ""}`}
                />
              </div>
              {errors[name] && <p className="text-xs text-destructive">{errors[name]}</p>}
            </div>
          ))}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--neon-cyan))] hover:opacity-90 neon-glow-cyan text-base font-semibold"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send size={18} />
                Register Visitor
              </>
            )}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
};

export default AddVisitor;
