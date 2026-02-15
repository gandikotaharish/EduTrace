import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { answer, conceptName, taskPrompt } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: `You are an academic integrity checker for an educational platform. Analyze student answers for originality and depth of understanding.

You must return a JSON object with these fields:
- originality_score: number 0-100 (100 = fully original)
- depth_score: number 0-100 (100 = deep understanding)
- is_suspicious: boolean
- feedback: string (brief feedback for the student if improvement needed)
- reason: string (internal reason for the score)

Be fair but firm. Generic or copied-sounding answers should score low. Specific, personal reasoning scores high.`
          },
          {
            role: "user",
            content: `Concept: ${conceptName}\nTask: ${taskPrompt}\n\nStudent's answer:\n${answer}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "evaluate_answer",
              description: "Return originality and depth evaluation",
              parameters: {
                type: "object",
                properties: {
                  originality_score: { type: "number" },
                  depth_score: { type: "number" },
                  is_suspicious: { type: "boolean" },
                  feedback: { type: "string" },
                  reason: { type: "string" }
                },
                required: ["originality_score", "depth_score", "is_suspicious", "feedback", "reason"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "evaluate_answer" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI check unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ 
      originality_score: 70, depth_score: 70, is_suspicious: false, 
      feedback: "", reason: "Could not parse AI response" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("check-originality error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
