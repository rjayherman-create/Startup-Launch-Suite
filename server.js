import { createReadStream, existsSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { handleCreateCheckoutSession, handleStripeWebhook } from "./server/billing.js";
import { handleAiImproveStep } from "./server/openai-ai.js";
import { handleExports, handleProjects } from "./server/projects.js";

const root = fileURLToPath(new URL(".", import.meta.url));
const distDir = join(root, "dist");
const port = Number(process.env.PORT || 4301);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon"
};

createServer(async (request, response) => {
  helmet(response);
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

  if (url.pathname === "/api/ai/improve-step") {
    await handleAiImproveStep(request, response);
    return;
  }
  if (url.pathname === "/api/projects") {
    await handleProjects(request, response);
    return;
  }
  if (url.pathname === "/api/exports") {
    await handleExports(request, response);
    return;
  }
  if (url.pathname === "/api/billing/create-checkout-session") {
    await handleCreateCheckoutSession(request, response);
    return;
  }
  if (url.pathname === "/api/billing/webhook") {
    await handleStripeWebhook(request, response);
    return;
  }

  await serveStatic(url.pathname, response);
}).listen(port, () => {
  console.log(`Launch OS server listening on http://0.0.0.0:${port}`);
});

function helmet(response) {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "SAMEORIGIN");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
}

async function serveStatic(pathname, response) {
  const cleanPath = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  const requested = cleanPath === "/" ? "index.html" : cleanPath.replace(/^[/\\]/, "");
  let filePath = join(distDir, requested);

  if (!filePath.startsWith(distDir) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = join(distDir, "index.html");
  }

  if (!existsSync(filePath)) {
    response.statusCode = 404;
    response.end("Build not found. Run npm run build first.");
    return;
  }

  const type = mimeTypes[extname(filePath)] || "application/octet-stream";
  response.setHeader("Content-Type", type);
  if (filePath.endsWith("index.html")) {
    response.end(await readFile(filePath));
    return;
  }
  createReadStream(filePath).pipe(response);
}
