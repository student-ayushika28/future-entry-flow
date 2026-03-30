import { useVisitors } from "@/contexts/VisitorContext";
import { Users, UserCheck, UserX, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/AppLayout";

const Dashboard = () => {
  const { visitors } = useVisitors();
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayVisitors = visitors.filter(v => v.dateTime.startsWith(todayStr));
  const approved = visitors.filter(v => v.status === "Approved").length;
  const rejected = visitors.filter(v => v.status === "Rejected").length;

  const stats = [
    { label: "Total Visitors", value: visitors.length, icon: Users, gradient: "from-[hsl(var(--primary))] to-[hsl(var(--neon-violet))]" },
    { label: "Today's Visitors", value: todayVisitors.length, icon: CalendarDays, gradient: "from-[hsl(var(--neon-cyan))] to-[hsl(var(--primary))]" },
    { label: "Approved", value: approved, icon: UserCheck, gradient: "from-[hsl(var(--success))] to-[hsl(var(--neon-cyan))]" },
    { label: "Rejected", value: rejected, icon: UserX, gradient: "from-[hsl(var(--destructive))] to-[hsl(var(--neon-pink))]" },
  ];

  const statusColor = (s: string) =>
    s === "Approved" ? "bg-[hsl(var(--success)/0.2)] text-[hsl(var(--success))]" :
    s === "Rejected" ? "bg-destructive/20 text-destructive" :
    "bg-[hsl(var(--warning)/0.2)] text-[hsl(var(--warning))]";

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Overview of your visitor management system</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, gradient }) => (
            <div key={label} className="glass rounded-2xl p-5 hover-lift cursor-default">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                  <Icon size={20} />
                </div>
              </div>
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-muted-foreground text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Recent visitors */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Visitors</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-muted-foreground">
                  <th className="text-left py-3 px-2 font-medium">Name</th>
                  <th className="text-left py-3 px-2 font-medium hidden sm:table-cell">Purpose</th>
                  <th className="text-left py-3 px-2 font-medium hidden md:table-cell">Person to Meet</th>
                  <th className="text-left py-3 px-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {visitors.slice(0, 5).map(v => (
                  <tr key={v.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-2 font-medium">{v.name}</td>
                    <td className="py-3 px-2 text-muted-foreground hidden sm:table-cell">{v.purpose}</td>
                    <td className="py-3 px-2 text-muted-foreground hidden md:table-cell">{v.personToMeet}</td>
                    <td className="py-3 px-2">
                      <Badge className={`${statusColor(v.status)} border-0 text-xs`}>{v.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
