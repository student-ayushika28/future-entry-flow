import { ShieldAlert, Shield, ShieldCheck } from "lucide-react";

interface RiskScoreBadgeProps {
  score: number | null;
  showLabel?: boolean;
}

const RiskScoreBadge = ({ score, showLabel = false }: RiskScoreBadgeProps) => {
  if (score === null || score === undefined) {
    return (
      <span className="text-xs text-muted-foreground italic">Not scanned</span>
    );
  }

  const level = score >= 75 ? "critical" : score >= 50 ? "high" : score >= 25 ? "medium" : "low";

  const config = {
    critical: {
      icon: ShieldAlert,
      bg: "bg-destructive/20",
      text: "text-destructive",
      label: "Critical",
    },
    high: {
      icon: ShieldAlert,
      bg: "bg-[hsl(var(--warning)/0.2)]",
      text: "text-[hsl(var(--warning))]",
      label: "High",
    },
    medium: {
      icon: Shield,
      bg: "bg-[hsl(40,95%,55%,0.2)]",
      text: "text-[hsl(40,95%,55%)]",
      label: "Medium",
    },
    low: {
      icon: ShieldCheck,
      bg: "bg-[hsl(var(--success)/0.2)]",
      text: "text-[hsl(var(--success))]",
      label: "Low",
    },
  }[level];

  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.bg}`}>
      <Icon size={14} className={config.text} />
      <span className={`text-xs font-bold ${config.text}`}>{score}</span>
      {showLabel && <span className={`text-[10px] ${config.text}`}>{config.label}</span>}
    </div>
  );
};

export default RiskScoreBadge;
