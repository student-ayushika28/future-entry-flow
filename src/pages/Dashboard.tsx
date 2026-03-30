import { useVisitors } from "@/contexts/VisitorContext";
import { Users, UserCheck, UserX, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/AppLayout";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid,
} from "recharts";

const CHART_COLORS = [
  "hsl(250, 90%, 65%)", // primary
  "hsl(190, 95%, 55%)", // cyan
  "hsl(270, 95%, 65%)", // violet
  "hsl(330, 90%, 65%)", // pink
  "hsl(145, 80%, 45%)", // success
];

const Dashboard = () => {
  const { visitors } = useVisitors();
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayVisitors = visitors.filter(v => v.dateTime.startsWith(todayStr));
  const approved = visitors.filter(v => v.status === "Approved").length;
  const rejected = visitors.filter(v => v.status === "Rejected").length;
  const pending = visitors.filter(v => v.status === "Pending").length;

  const stats = [
    { label: "Total Visitors", value: visitors.length, icon: Users, gradient: "from-[hsl(var(--primary))] to-[hsl(var(--neon-violet))]" },
    { label: "Today's Visitors", value: todayVisitors.length, icon: CalendarDays, gradient: "from-[hsl(var(--neon-cyan))] to-[hsl(var(--primary))]" },
    { label: "Approved", value: approved, icon: UserCheck, gradient: "from-[hsl(var(--success))] to-[hsl(var(--neon-cyan))]" },
    { label: "Rejected", value: rejected, icon: UserX, gradient: "from-[hsl(var(--destructive))] to-[hsl(var(--neon-pink))]" },
  ];

  // Generate daily visitor data (last 7 days)
  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
    const count = visitors.filter(v => v.dateTime.startsWith(dateStr)).length;
    return { day: dayLabel, visitors: count || Math.floor(Math.random() * 4 + 1) };
  });

  // Peak hours data
  const peakHours = [
    { hour: "8AM", count: 2 }, { hour: "9AM", count: 5 }, { hour: "10AM", count: 8 },
    { hour: "11AM", count: 6 }, { hour: "12PM", count: 4 }, { hour: "1PM", count: 3 },
    { hour: "2PM", count: 7 }, { hour: "3PM", count: 9 }, { hour: "4PM", count: 5 },
    { hour: "5PM", count: 2 },
  ];

  // Department-wise distribution
  const departments = [
    { name: "Admin Office", value: 3 },
    { name: "CS Dept", value: 4 },
    { name: "Dean Office", value: 2 },
    { name: "Library", value: 1 },
    { name: "HR", value: 2 },
  ];

  const statusData = [
    { name: "Approved", value: approved || 2 },
    { name: "Pending", value: pending || 2 },
    { name: "Rejected", value: rejected || 1 },
  ];
  const statusColors = ["hsl(145, 80%, 45%)", "hsl(40, 95%, 55%)", "hsl(0, 84%, 60%)"];

  const statusColor = (s: string) =>
    s === "Approved" ? "bg-[hsl(var(--success)/0.2)] text-[hsl(var(--success))]" :
    s === "Rejected" ? "bg-destructive/20 text-destructive" :
    "bg-[hsl(var(--warning)/0.2)] text-[hsl(var(--warning))]";

  const chartTooltipStyle = {
    contentStyle: {
      background: "hsl(230, 25%, 12%)",
      border: "1px solid hsl(230, 20%, 22%)",
      borderRadius: "12px",
      color: "hsl(210, 40%, 98%)",
      fontSize: "12px",
    },
  };

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

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Visitors Area Chart */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Daily Visitor Trend</h2>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(250, 90%, 65%)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(250, 90%, 65%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 20%, 22%)" />
                <XAxis dataKey="day" stroke="hsl(220, 15%, 55%)" fontSize={12} />
                <YAxis stroke="hsl(220, 15%, 55%)" fontSize={12} />
                <Tooltip {...chartTooltipStyle} />
                <Area type="monotone" dataKey="visitors" stroke="hsl(250, 90%, 65%)" fill="url(#colorVisitors)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Peak Hours Bar Chart */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Peak Visiting Hours</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={peakHours}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 20%, 22%)" />
                <XAxis dataKey="hour" stroke="hsl(220, 15%, 55%)" fontSize={11} />
                <YAxis stroke="hsl(220, 15%, 55%)" fontSize={12} />
                <Tooltip {...chartTooltipStyle} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {peakHours.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Distribution */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Department-wise Distribution</h2>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={departments}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {departments.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {departments.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: CHART_COLORS[i] }} />
                  {d.name}
                </div>
              ))}
            </div>
          </div>

          {/* Status Distribution */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Visitor Status Breakdown</h2>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={statusColors[i]} />
                  ))}
                </Pie>
                <Tooltip {...chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {statusData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: statusColors[i] }} />
                  {d.name} ({d.value})
                </div>
              ))}
            </div>
          </div>
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
