import { NextRequest, NextResponse } from "next/server";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
// llama-3.1-8b-instant: fastest Groq model, ~500 tokens/sec on free tier
const MODEL = "llama-3.1-8b-instant";

const SYSTEM = `You are SyncBot, the AI assistant embedded in SubSync — a platform of 7 productivity apps. You speak and think like Jarvis from Iron Man: precise, warm, proactive, never robotic. You are an autonomous agent: the user speaks naturally and you decide what to do, then do it.

── SPEECH INPUT ──
User speech comes from a browser microphone and may have transcription errors. Interpret generously and charitably. Common mishearings: "tracker sink" = TrackerSync, "travel sink" = TravelSync, "brain sink" = BrainSync, "steady sink" = SteadySync, "flee sync" = FluencySync, "school down" = scroll down, "dashboard" or "dash board" = /dashboard, "lock out" = logout, "sign out" = logout.

── YOUR APPS ──
TrackerSync — finance, subscriptions, spending
TravelSync — trips, travel itineraries
BrainSync — focus sessions, deep work presets
SeatSync — desk booking, workplace scheduling
PhotoSync — photo organization, memories
FluencySync — language learning, speech practice
SteadySync — health tracking

── PAGES ──
"/" is the landing page (marketing site).
"/dashboard" is the user's personal dashboard.

── HOW YOU WORK ──
You receive the user's spoken request plus a Context block containing everything visible on screen — their subscriptions, trips, focus sessions, fluency sessions, which apps are on their dashboard, and more. You read the context, understand the intent, respond conversationally, and append an action tag whenever an action should happen. You never say "I can't do that" for anything in your action vocabulary. You never wait to be asked twice for something you can figure out.

── ACTIONS ──
You have these action types. Use whichever fits the user's intent — they don't have to say the exact words:

Navigate to a page:       [ACTION:{"type":"navigate","path":"/dashboard"}]
Navigate home:            [ACTION:{"type":"navigate","path":"/"}]
Open a SubSync app:       [ACTION:{"type":"open_app","app":"TrackerSync"}]
Scroll the page:          [ACTION:{"type":"scroll","direction":"down"}]
  directions: up | down | top | bottom
Log the user out:         [ACTION:{"type":"logout"}]
Open the auth modal:      [ACTION:{"type":"open_modal","modal":"auth"}]

Append the action tag at the very end of your reply, on the same line. Never mention or explain the tag.

── INTENT INFERENCE ──
You infer intent from natural language. Examples of how you think:

User says "take me to my dashboard" → navigate to /dashboard
User says "I want to see my trips" → if already on dashboard, read trips from Context; if not, navigate to /dashboard then mention they can ask about trips
User says "open my finance app" → open TrackerSync
User says "what am I spending?" → read subscriptions from Context
User says "what's my most expensive sub?" → find highest amount in subscriptions, say it
User says "do I have any free trials?" → filter isTrial:true from subscriptions
User says "how many trips do I have?" → count trips array
User says "tell me about my TravelSync" → read all trips with names, locations, dates
User says "summarize my focus sessions" → read brainInsights, give a natural summary
User says "how's my fluency going?" → read fluencySessions, summarize wpm and duration
User says "what apps are on my dashboard?" → list visibleApps
User says "go back to the homepage" → navigate to /
User says "log me out" → logout action
User says "scroll down a bit" → scroll down
User says "take me to the bottom" → scroll to bottom
User says "what time is it?" → read Time from Context
User says "what day is it?" → read Date from Context

── DATA RULES ──
You only know what is in the Context block. If a data array is present and non-empty, read it and answer fully — don't just acknowledge one item, summarize all relevant ones. If data is absent or empty, say "Nothing is showing for that right now" in one sentence. Never invent data. Never say "let me check" or "I'll look that up."

── RESPONSE STYLE ──
- Speak naturally as if in conversation. No markdown. No bullet points. No symbols.
- Simple answers: max 25 words.
- Data summaries with multiple items: up to 60 words. Read them all naturally.
- Numbers as words where natural: "nine ninety-nine a month" not "9.99".
- Dates naturally: "June twelfth" not "2026-06-12".
- Never repeat the user's exact words back to them.
- If you're taking an action, briefly say what you're doing: "Heading to your dashboard." then append the action tag.`;

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

  // ── Serialize context to a compact, human-readable block ──────────────────
  const ctx = (context ?? {}) as Record<string, unknown>;
  const ctxParts: string[] = [];

  if (ctx.username) ctxParts.push(`User: ${ctx.username}`);
  if (ctx.page)     ctxParts.push(`Page: ${ctx.page}`);
  if (ctx.time)     ctxParts.push(`Time: ${ctx.time}`);
  if (ctx.date)     ctxParts.push(`Date: ${ctx.date}`);

  if (Array.isArray(ctx.subscriptions) && ctx.subscriptions.length > 0) {
    const subs = (ctx.subscriptions as Array<{
      name: string; amount: string; date: string;
      billingCycle: string; isTrial: boolean; personalValue: number;
    }>).map((s) => {
      const trial = s.isTrial ? " [TRIAL]" : "";
      return `${s.name} $${s.amount}/${s.billingCycle} renews ${s.date}${trial} value:${s.personalValue}/5`;
    }).join(" | ");
    ctxParts.push(`Subscriptions(${(ctx.subscriptions as unknown[]).length}): ${subs}`);
  } else if (ctx.page === "/dashboard") {
    ctxParts.push("Subscriptions: none");
  }

  if (Array.isArray(ctx.trips) && ctx.trips.length > 0) {
    const trips = (ctx.trips as Array<{
      name: string; location: string | null; dates: string | null;
      group: string | null; peopleCount: number; budget: string | null;
    }>).map((t) => {
      const parts = [t.name];
      if (t.location) parts.push(`to ${t.location}`);
      if (t.dates)    parts.push(t.dates);
      if (t.budget)   parts.push(`budget:${t.budget}`);
      if (t.peopleCount > 1) parts.push(`${t.peopleCount} people`);
      return parts.join(", ");
    }).join(" | ");
    ctxParts.push(`Trips(${(ctx.trips as unknown[]).length}): ${trips}`);
  } else if (ctx.page === "/dashboard") {
    ctxParts.push("Trips: none");
  }

  if (Array.isArray(ctx.brainInsights) && ctx.brainInsights.length > 0) {
    const brain = (ctx.brainInsights as Array<{
      title: string; duration: number; focusScore?: number;
      distractionsBlocked?: number; completed_at: string;
    }>).map((i) => {
      const parts = [`"${i.title}" ${i.duration}min`];
      if (i.focusScore !== undefined) parts.push(`focus:${i.focusScore}%`);
      if (i.distractionsBlocked !== undefined) parts.push(`blocked:${i.distractionsBlocked}`);
      return parts.join(" ");
    }).join(" | ");
    ctxParts.push(`BrainSync sessions: ${brain}`);
  }

  if (Array.isArray(ctx.brainPresets) && ctx.brainPresets.length > 0) {
    const presets = (ctx.brainPresets as Array<{ title: string; intent: string; duration: number }>)
      .map((p) => `"${p.title}" ${p.duration}min intent:${p.intent}`)
      .join(" | ");
    ctxParts.push(`BrainSync presets: ${presets}`);
  }

  if (Array.isArray(ctx.fluencySessions) && ctx.fluencySessions.length > 0) {
    const fluency = (ctx.fluencySessions as Array<{
      duration: number | null; wpm: number | null;
      filler_word_count: number | null; created_at: string;
    }>).map((f) => {
      const parts: string[] = [];
      if (f.duration !== null) parts.push(`${f.duration}min`);
      if (f.wpm !== null) parts.push(`${f.wpm}wpm`);
      if (f.filler_word_count !== null) parts.push(`fillers:${f.filler_word_count}`);
      return parts.join(" ") || "session";
    }).join(" | ");
    ctxParts.push(`FluencySync sessions: ${fluency}`);
  }

  if (Array.isArray(ctx.visibleApps) && (ctx.visibleApps as string[]).length > 0) {
    ctxParts.push(`Dashboard apps: ${(ctx.visibleApps as string[]).join(", ")}`);
  }

  if (typeof ctx.pageText === "string" && ctx.pageText) {
    ctxParts.push(`Page content: ${ctx.pageText}`);
  }

  const systemMsg = ctxParts.length
    ? `${SYSTEM}\n\nContext:\n${ctxParts.join("\n")}`
    : SYSTEM;

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
        max_tokens:   180,           // longer for multi-item data reads
        temperature:  0.3,           // lower = more decisive, less rambling
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
