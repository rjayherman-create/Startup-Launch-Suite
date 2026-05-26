import { hasDatabase, saveExportEvent, saveProject } from "./db.js";

export async function handleProjects(request, response) {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }
  if (!hasDatabase()) {
    sendJson(response, 503, { error: "DATABASE_URL is not configured." });
    return;
  }
  try {
    const body = await readJsonBody(request);
    const validationError = validateProject(body);
    if (validationError) {
      sendJson(response, 400, { error: validationError });
      return;
    }
    const saved = await saveProject(body);
    sendJson(response, 200, { saved: true, project: saved });
  } catch (error) {
    sendJson(response, 500, { error: error instanceof Error ? error.message : "Project save failed." });
  }
}

export async function handleExports(request, response) {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }
  if (!hasDatabase()) {
    sendJson(response, 503, { error: "DATABASE_URL is not configured." });
    return;
  }
  try {
    const body = await readJsonBody(request);
    if (!body.ownerKey || !body.exportTarget) {
      sendJson(response, 400, { error: "ownerKey and exportTarget are required." });
      return;
    }
    const saved = await saveExportEvent(body);
    sendJson(response, 200, { saved: true, export: saved });
  } catch (error) {
    sendJson(response, 500, { error: error instanceof Error ? error.message : "Export save failed." });
  }
}

function validateProject(body) {
  if (!body.ownerKey) return "ownerKey is required.";
  if (!body.brandProfile || typeof body.brandProfile !== "object") return "brandProfile is required.";
  if (!body.brandProfile.businessName) return "brandProfile.businessName is required.";
  return "";
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let raw = "";
    request.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 2_000_000) {
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
