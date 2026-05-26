import Stripe from "stripe";
import { insertBillingEvent } from "./db.js";

export async function handleCreateCheckoutSession(request, response) {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    sendJson(response, 503, { error: "STRIPE_SECRET_KEY is not configured." });
    return;
  }

  try {
    const body = await readJsonBody(request);
    const plan = body.plan === "subscription" ? "subscription" : "one-time";
    const priceId = plan === "subscription" ? process.env.STRIPE_SUBSCRIPTION_PRICE_ID : process.env.STRIPE_STARTUP_PACK_PRICE_ID;
    if (!priceId) {
      sendJson(response, 503, { error: `${plan} Stripe price id is not configured.` });
      return;
    }

    const stripe = new Stripe(secretKey);
    const origin = getOrigin(request);
    const session = await stripe.checkout.sessions.create({
      mode: plan === "subscription" ? "subscription" : "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/export-kit?checkout=success`,
      cancel_url: `${origin}/export-kit?checkout=cancelled`,
      metadata: {
        ownerKey: String(body.ownerKey || ""),
        businessName: String(body.businessName || ""),
        plan
      }
    });

    sendJson(response, 200, { url: session.url, id: session.id });
  } catch (error) {
    sendJson(response, 500, { error: error instanceof Error ? error.message : "Stripe checkout failed." });
  }
}

export async function handleStripeWebhook(request, response) {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    sendJson(response, 503, { error: "Stripe webhook is not configured." });
    return;
  }

  const stripe = new Stripe(secretKey);
  const rawBody = await readRawBody(request);
  const signature = request.headers["stripe-signature"];

  try {
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    await insertBillingEvent(event);
    sendJson(response, 200, { received: true });
  } catch (error) {
    sendJson(response, 400, { error: error instanceof Error ? error.message : "Webhook signature verification failed." });
  }
}

function getOrigin(request) {
  const configured = process.env.PUBLIC_APP_URL;
  if (configured) return configured.replace(/\/+$/, "");
  const protocol = request.headers["x-forwarded-proto"] || "http";
  return `${protocol}://${request.headers.host}`;
}

function readJsonBody(request) {
  return readRawBody(request).then((raw) => {
    try {
      return raw.length ? JSON.parse(raw.toString("utf8")) : {};
    } catch {
      throw new Error("Invalid JSON body.");
    }
  });
}

function readRawBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    request.on("data", (chunk) => {
      chunks.push(chunk);
      size += chunk.length;
      if (size > 2_000_000) {
        reject(new Error("Request body too large."));
        request.destroy();
      }
    });
    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
}

function sendJson(response, status, payload) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}
