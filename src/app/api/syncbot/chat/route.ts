import { NextRequest, NextResponse } from "next/server";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
// llama-3.1-8b-instant: fastest Groq model, ~500 tokens/sec on free tier
const MODEL = "llama-3.1-8b-instant";

const SYSTEM = `You are SyncBot, the AI voice assistant for SubSync. Think of yourself as Jarvis from Iron Man: extremely helpful, direct, polite, and conversational.

Real page paths in this application:
- "/" (home/landing page)
- "/dashboard" (user dashboard)

SubSync apps: TrackerSync (finance), TravelSync (trips), BrainSync (focus), SeatSync (events), PhotoSync (photos), FluencySync (languages), SteadySync (health).

Rules:
- Speak aloud: be short, clear, and conversational. Max 20 words.
- Do NOT use markdown, lists, symbols, or formatting.
- If asked to read data, subscriptions, or TrackerSync details: read out the subscriptions under "Subs" in the Context. If there is no data in Context, reply exactly: "No data displayed."
- If asked for the time or date, answer using the "Time" and "Date" values in the Context.
- Action tags: append exactly [ACTION:{"type":"logout"}], [ACTION:{"type":"scroll","direction":"bottom"}], [ACTION:{"type":"navigate","path":"/dashboard"}], etc.

Action types available:
  - navigate (path: string) — internal page navigation (e.g. "/dashboard" or "/")
  - open_app (app: string) — opens a SubSync app in new tab (e.g. "TrackerSync")
  - scroll (direction: "top"|"bottom"|"up"|"down")
  - logout
  - open_modal (modal: "auth")

Examples of actions:
  User: "go to the dashboard" -> reply + [ACTION:{"type":"navigate","path":"/dashboard"}]
  User: "go home" -> reply + [ACTION:{"type":"navigate","path":"/"}]
  User: "scroll down" -> reply + [ACTION:{"type":"scroll","direction":"down"}]
  User: "take me to the bottom" -> reply + [ACTION:{"type":"scroll","direction":"bottom"}]
  User: "open TrackerSync" -> reply + [ACTION:{"type":"open_app","app":"TrackerSync"}]
  User: "log me out" -> reply + [ACTION:{"type":"logout"}]

Always append the action tag at the very end of your reply, on the same line. Never explain the tag.`;

// In-memory rate limiter (resets on cold start)
const rl = new Map<string, { n: number; reset: number }>();
function rateOk(ip: string): boolean {
  const now = Date.now();
  const e = rl.get(ip);
  if (!e || now > e.reset) { rl.set(ip, { n: 1, reset: now + 60_000 }); return true; }
  if (e.n >= 25) return false;
  e.n++;
  return true;
}

export async function POST(req: NextRequest) {
  // Rate limit
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "anon";
  if (!rateOk(ip)) {
    return NextResponse.json({ reply: "Too many requests. Please wait a moment.", error: "rate_limit" }, { status: 429 });
  }

  // API key (user-supplied header takes priority)
  const userKey = req.headers.get("x-groq-key") ?? "";
  const apiKey  = userKey || process.env.GROQ_API_KEY || "";
  if (!apiKey) {
    return NextResponse.json({ reply: "No API key configured. Add your Groq key in SyncBot settings.", fallback: true });
  }

  let body: { message?: string; context?: Record<string, unknown> };
  try { body = await req.json(); }
  catch { return NextResponse.json({ reply: "Invalid request." }, { status: 400 }); }

  const { message, context } = body;
  if (!message?.trim()) return NextResponse.json({ reply: "I didn't catch that, please try again." });

  // Build context suffix (keep small for speed)
  const ctxLines: string[] = [];
  if (context?.username)      ctxLines.push(`User: ${context.username}`);
  if (context?.page)          ctxLines.push(`Page: ${context.page}`);
  if (context?.time)          ctxLines.push(`Time: ${context.time}`);
  if (context?.date)          ctxLines.push(`Date: ${context.date}`);
  if (Array.isArray(context?.subscriptions) && (context.subscriptions as unknown[]).length > 0) {
    const subs = (context.subscriptions as Array<{ name: string; amount: string; date: string }>)
      .slice(0, 3)
      .map((s) => `${s.name} $${s.amount} renews ${s.date}`)
      .join(", ");
    ctxLines.push(`Subs: ${subs}`);
  }

  const systemMsg = ctxLines.length ? `${SYSTEM}\n\nContext: ${ctxLines.join(" | ")}` : SYSTEM;

  try {
    const groqRes = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model:        MODEL,
        stream:       true,          // ← streaming for fast first-token latency
        max_tokens:   80,            // short voice responses = much faster
        temperature:  0.3,          // lower = more focused answers
        messages: [
          { role: "system", content: systemMsg },
          { role: "user",   content: message },
        ],
      }),
    });

    if (!groqRes.ok || !groqRes.body) {
      const err = await groqRes.text().catch(() => "unknown");
      console.error("[SyncBot] Groq error", groqRes.status, err);
      return NextResponse.json({ reply: "I'm having trouble connecting. Try again in a moment.", fallback: true });
    }

    // Proxy the SSE stream straight to the client — zero extra latency
    return new Response(groqRes.body, {
      status: 200,
      headers: {
        "Content-Type":  "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",          // disable nginx buffering
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err) {
    console.error("[SyncBot] Fetch failed:", err);
    return NextResponse.json({ reply: "Connection error. Please try again.", fallback: true });
  }
}
