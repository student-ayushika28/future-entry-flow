import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { visitors, type } = await req.json();

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "risk-score") {
      systemPrompt = "You are a security AI that analyzes visitor data and returns a JSON risk assessment. Analyze the visitor's name, purpose, timing, and patterns. Return ONLY valid JSON.";
      userPrompt = `Analyze this visitor for risk: ${JSON.stringify(visitors)}. Return JSON: {"risk_score": 0-100, "risk_level": "low|medium|high|critical", "flags": ["flag1"], "recommendation": "text"}`;
    } else if (type === "predictions") {
      systemPrompt = "You are an analytics AI that predicts visitor traffic patterns. Return ONLY valid JSON.";
      userPrompt = `Based on this visitor history: ${JSON.stringify(visitors?.slice(0, 50))}. Predict next 7 days traffic. Return JSON: {"predictions": [{"day": "Mon", "expected": 5, "confidence": 0.8}], "peak_hours": ["10AM", "2PM"], "insights": ["insight1"]}`;
    } else if (type === "behavioral") {
      systemPrompt = "You are a behavioral analysis AI. Analyze visitor patterns and return ONLY valid JSON.";
      userPrompt = `Analyze behavioral patterns from: ${JSON.stringify(visitors?.slice(0, 50))}. Return JSON: {"patterns": [{"pattern": "name", "description": "text", "frequency": "high|medium|low"}], "anomalies": ["anomaly1"], "suggestions": ["suggestion1"]}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_analysis",
            description: "Return the analysis result",
            parameters: {
              type: "object",
              properties: {
                result: { type: "object", description: "The analysis result" }
              },
              required: ["result"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "return_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    let result;
    
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall) {
      result = JSON.parse(toolCall.function.arguments);
      result = result.result || result;
    } else {
      const content = data.choices?.[0]?.message?.content || "{}";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("AI analytics error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
