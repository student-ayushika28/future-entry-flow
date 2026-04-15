import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase env not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { visitor_id } = await req.json();
    if (!visitor_id) throw new Error("visitor_id is required");

    // Fetch the visitor
    const { data: visitor, error: vErr } = await supabase
      .from("visitors")
      .select("*")
      .eq("id", visitor_id)
      .single();
    if (vErr || !visitor) throw new Error("Visitor not found");

    // Fetch watchlist
    const { data: watchlist } = await supabase
      .from("watchlist")
      .select("*")
      .eq("is_active", true);

    // Fetch visitor history for pattern analysis
    const { data: history } = await supabase
      .from("visitors")
      .select("name, email, phone, date_time, purpose, status")
      .or(`name.ilike.%${visitor.name}%,email.eq.${visitor.email},phone.eq.${visitor.phone}`)
      .neq("id", visitor_id)
      .order("created_at", { ascending: false })
      .limit(20);

    // --- Rule-based scoring ---
    let ruleScore = 0;
    const flags: string[] = [];

    // 1. Watchlist matching
    const watchlistMatch = (watchlist || []).find((w: any) => {
      const nameMatch = visitor.name.toLowerCase().includes(w.name.toLowerCase()) ||
        w.name.toLowerCase().includes(visitor.name.toLowerCase());
      const emailMatch = visitor.email && w.email && visitor.email.toLowerCase() === w.email.toLowerCase();
      const phoneMatch = visitor.phone && w.phone && visitor.phone === w.phone;
      return nameMatch || emailMatch || phoneMatch;
    });
    if (watchlistMatch) {
      const wScore = watchlistMatch.risk_level === "critical" ? 50 : watchlistMatch.risk_level === "high" ? 40 : watchlistMatch.risk_level === "medium" ? 25 : 10;
      ruleScore += wScore;
      flags.push(`Watchlist match: ${watchlistMatch.reason} (${watchlistMatch.risk_level})`);
    }

    // 2. Unusual timing (before 6AM or after 10PM)
    const visitHour = new Date(visitor.date_time).getHours();
    if (visitHour < 6 || visitHour > 22) {
      ruleScore += 15;
      flags.push(`Unusual visit time: ${visitHour}:00`);
    }

    // 3. Repeated visits (>3 in last 30 days)
    const repeatCount = (history || []).length;
    if (repeatCount > 5) {
      ruleScore += 20;
      flags.push(`High frequency: ${repeatCount + 1} visits detected`);
    } else if (repeatCount > 2) {
      ruleScore += 10;
      flags.push(`Repeated visitor: ${repeatCount + 1} visits`);
    }

    // 4. Previously rejected
    const rejections = (history || []).filter((h: any) => h.status === "Rejected").length;
    if (rejections > 0) {
      ruleScore += 15 * rejections;
      flags.push(`${rejections} previous rejection(s)`);
    }

    // --- AI-enhanced analysis ---
    let aiScore = 0;
    let aiInsight = "";
    try {
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: "You are a security risk assessment AI. Analyze visitor data and return a risk assessment. Return ONLY valid JSON via the tool call."
            },
            {
              role: "user",
              content: `Assess risk for visitor: ${JSON.stringify({
                name: visitor.name,
                email: visitor.email,
                phone: visitor.phone,
                purpose: visitor.purpose,
                person_to_meet: visitor.person_to_meet,
                visit_time: visitor.date_time,
                history_count: repeatCount,
                rejections,
                watchlist_match: !!watchlistMatch,
                rule_flags: flags,
              })}`
            },
          ],
          tools: [{
            type: "function",
            function: {
              name: "return_risk",
              description: "Return risk assessment",
              parameters: {
                type: "object",
                properties: {
                  ai_risk_score: { type: "number", description: "0-100 risk score" },
                  insight: { type: "string", description: "Brief security insight" },
                  recommendation: { type: "string", description: "Action recommendation" },
                },
                required: ["ai_risk_score", "insight", "recommendation"],
                additionalProperties: false,
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "return_risk" } },
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        if (toolCall) {
          const parsed = JSON.parse(toolCall.function.arguments);
          aiScore = parsed.ai_risk_score || parsed.result?.ai_risk_score || 0;
          aiInsight = parsed.insight || parsed.result?.insight || "";
        }
      }
    } catch (aiErr) {
      console.error("AI analysis failed, using rule-based only:", aiErr);
    }

    // Combine scores: 60% rule-based, 40% AI
    const finalScore = Math.min(100, Math.round(ruleScore * 0.6 + aiScore * 0.4));
    const riskLevel = finalScore >= 75 ? "critical" : finalScore >= 50 ? "high" : finalScore >= 25 ? "medium" : "low";

    // Update visitor risk score
    await supabase
      .from("visitors")
      .update({ risk_score: finalScore })
      .eq("id", visitor_id);

    // Create notification if high risk
    if (finalScore >= 50) {
      await supabase.from("notifications").insert({
        title: `⚠️ High-Risk Visitor: ${visitor.name}`,
        message: `Risk Score: ${finalScore}/100 (${riskLevel}). ${flags.join(". ")}. ${aiInsight}`,
        type: riskLevel === "critical" ? "critical" : "warning",
        visitor_id: visitor_id,
        risk_score: finalScore,
      });
    }

    // Log to audit
    await supabase.from("audit_logs").insert({
      action: "risk_scan",
      entity_type: "visitor",
      entity_id: visitor_id,
      details: { risk_score: finalScore, risk_level: riskLevel, flags, ai_insight: aiInsight },
    });

    return new Response(JSON.stringify({
      risk_score: finalScore,
      risk_level: riskLevel,
      flags,
      ai_insight: aiInsight,
      watchlist_match: !!watchlistMatch,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Risk scan error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
