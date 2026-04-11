import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useVisitors } from "@/contexts/VisitorContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Brain, TrendingUp, AlertTriangle, Sparkles } from "lucide-react";

interface Prediction {
  day: string;
  expected: number;
  confidence: number;
}

interface AIInsights {
  predictions?: Prediction[];
  peak_hours?: string[];
  insights?: string[];
  patterns?: { pattern: string; description: string; frequency: string }[];
  anomalies?: string[];
  suggestions?: string[];
}

const AIInsightsPanel = () => {
  const { visitors } = useVisitors();
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"predictions" | "behavioral">("predictions");

  const fetchInsights = async (type: "predictions" | "behavioral") => {
    setLoading(true);
    setActiveTab(type);
    try {
      const { data, error } = await supabase.functions.invoke("ai-analytics", {
        body: { visitors, type },
      });
      if (error) throw error;
      setInsights(data);
    } catch (e: any) {
      toast({ title: "AI Analysis Failed", description: e.message || "Try again later.", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="text-primary" size={20} />
          <h2 className="text-lg font-semibold">AI Insights</h2>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant={activeTab === "predictions" ? "default" : "outline"}
            onClick={() => fetchInsights("predictions")} disabled={loading}
            className={activeTab === "predictions" ? "neon-glow" : "border-white/10"}>
            <TrendingUp size={14} className="mr-1" /> Predictions
          </Button>
          <Button size="sm" variant={activeTab === "behavioral" ? "default" : "outline"}
            onClick={() => fetchInsights("behavioral")} disabled={loading}
            className={activeTab === "behavioral" ? "neon-glow" : "border-white/10"}>
            <Sparkles size={14} className="mr-1" /> Behavioral
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">AI analyzing visitor patterns...</p>
          </div>
        </div>
      )}

      {!loading && !insights && (
        <div className="text-center py-12 text-muted-foreground">
          <Brain size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Click a button above to generate AI-powered insights</p>
        </div>
      )}

      {!loading && insights && activeTab === "predictions" && (
        <div className="space-y-4">
          {insights.predictions && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">7-Day Traffic Forecast</h3>
              <div className="grid grid-cols-7 gap-2">
                {insights.predictions.map((p, i) => (
                  <div key={i} className="text-center glass rounded-xl p-3">
                    <p className="text-xs text-muted-foreground">{p.day}</p>
                    <p className="text-lg font-bold text-primary">{p.expected}</p>
                    <p className="text-[10px] text-muted-foreground">{Math.round(p.confidence * 100)}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {insights.peak_hours && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Predicted Peak Hours</h3>
              <div className="flex gap-2 flex-wrap">
                {insights.peak_hours.map((h, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-medium">{h}</span>
                ))}
              </div>
            </div>
          )}
          {insights.insights && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Key Insights</h3>
              <ul className="space-y-2">
                {insights.insights.map((ins, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Sparkles size={14} className="text-accent mt-0.5 shrink-0" />
                    {ins}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!loading && insights && activeTab === "behavioral" && (
        <div className="space-y-4">
          {insights.patterns && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Detected Patterns</h3>
              <div className="space-y-2">
                {insights.patterns.map((p, i) => (
                  <div key={i} className="glass rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{p.pattern}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        p.frequency === "high" ? "bg-destructive/20 text-destructive" :
                        p.frequency === "medium" ? "bg-[hsl(var(--warning)/0.2)] text-[hsl(var(--warning))]" :
                        "bg-[hsl(var(--success)/0.2)] text-[hsl(var(--success))]"
                      }`}>{p.frequency}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {insights.anomalies && insights.anomalies.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Anomalies Detected</h3>
              <ul className="space-y-2">
                {insights.anomalies.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[hsl(var(--warning))]">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIInsightsPanel;
