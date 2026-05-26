const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
const rateLimitHits = new Map();

export async function handleAiImproveStep(request, response) {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    sendJson(response, 503, {
      error: "OpenAI is not configured. Add OPENAI_API_KEY on the server."
    });
    return;
  }

  const clientId = getClientId(request);
  if (!rateLimit(clientId)) {
    sendJson(response, 429, { error: "Too many AI requests. Please wait a minute and try again." });
    return;
  }

  try {
    const body = await readJsonBody(request);
    const payload = buildOpenAiRequest(body);
    const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await openAiResponse.json().catch(() => ({}));
    if (!openAiResponse.ok) {
      sendJson(response, openAiResponse.status, {
        error: data.error?.message || "OpenAI request failed."
      });
      return;
    }

    const text = extractResponseText(data);
    const parsed = parseAssistantJson(text);
    sendJson(response, 200, {
      provider: "openai",
      model: payload.model,
      insight: parsed.insight,
      suggestions: parsed.suggestions,
      actions: parsed.actions,
      rawText: text
    });
  } catch (error) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : "AI route failed."
    });
  }
}

function buildOpenAiRequest(body) {
  const step = Number(body.step || 1);
  const model = process.env.OPENAI_MODEL || "gpt-4.1";
  const context = {
    step,
    routeLabel: body.routeLabel,
    businessName: body.businessName,
    tagline: body.tagline,
    description: body.description,
    industry: body.industry,
    audience: body.audience,
    launchTargets: body.launchTargets,
    brandProfile: body.brandProfile,
    assetStatus: body.assetStatus,
    codeDraftSummary: summarizeCode(body.codeDraft),
    storeCheck: body.storeCheck,
    exportTarget: body.exportTarget
  };

  return {
    model,
    instructions: [
      "You are the AI strategist inside Launch OS, a startup launch branding system.",
      "Return only valid JSON with keys: insight, suggestions, actions.",
      "insight must be one concise paragraph.",
      "suggestions must be 3 to 5 short strings.",
      "actions must be 1 to 3 concrete strings the app can show as next steps.",
      "Do not mention that you are an AI model. Do not invent real trademark, domain, or store availability results."
    ].join(" "),
    input: `Improve this Launch OS workflow step using the current brand context:\n${JSON.stringify(context, null, 2)}`,
    text: {
      format: {
        type: "json_object"
      },
      verbosity: "low"
    },
    max_output_tokens: 700
  };
}

function summarizeCode(code) {
  if (!code) return "";
  return String(code).slice(0, 1200);
}

function parseAssistantJson(text) {
  try {
    const parsed = JSON.parse(text);
    return normalizeAiResult(parsed);
  } catch {
    return normalizeAiResult({
      insight: text || "OpenAI returned an empty response.",
      suggestions: [],
      actions: []
    });
  }
}

function normalizeAiResult(value) {
  return {
    insight: String(value.insight || "AI reviewed this step."),
    suggestions: Array.isArray(value.suggestions) ? value.suggestions.map(String).slice(0, 5) : [],
    actions: Array.isArray(value.actions) ? value.actions.map(String).slice(0, 3) : []
  };
}

function extractResponseText(data) {
  if (typeof data.output_text === "string") return data.output_text;
  const output = Array.isArray(data.output) ? data.output : [];
  return output
    .flatMap((item) => Array.isArray(item.content) ? item.content : [])
    .map((content) => content.text || "")
    .filter(Boolean)
    .join("\n")
    .trim();
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let raw = "";
    request.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("Request body too large."));
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Invalid JSON body."));
      }
    });
    request.on("error", reject);
  });
}

function sendJson(response, status, payload) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}

function getClientId(request) {
  return request.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim()
    || request.socket?.remoteAddress
    || "local";
}

function rateLimit(clientId) {
  const now = Date.now();
  const hits = rateLimitHits.get(clientId)?.filter((time) => now - time < RATE_LIMIT_WINDOW_MS) ?? [];
  if (hits.length >= RATE_LIMIT_MAX) {
    rateLimitHits.set(clientId, hits);
    return false;
  }
  hits.push(now);
  rateLimitHits.set(clientId, hits);
  return true;
}
