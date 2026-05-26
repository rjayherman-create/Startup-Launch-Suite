/*
 UNIVERSAL APP SECURITY SCANNER + CHECKER + FIXER
 ----------------------------------------------------------------------
 PURPOSE:
 Scan Vite + Express + Railway apps for common security problems.

 RUN:
 node security-scan.js

 OPTIONAL AUTO FIX:
 node security-scan.js --fix
*/

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { globSync } from "glob";
import chalk from "chalk";

const ROOT = process.cwd();
const FIX_MODE = process.argv.includes("--fix");

const issues = [];
const warnings = [];
const passed = [];

const SCORE = {
  total: 0,
  passed: 0
};

function addPass(msg) {
  passed.push(msg);
  SCORE.total += 1;
  SCORE.passed += 1;
}

function addIssue(msg) {
  issues.push(msg);
  SCORE.total += 1;
}

function addWarning(msg) {
  warnings.push(msg);
}

function logTitle(title) {
  console.log(chalk.cyan("\n================================================"));
  console.log(chalk.cyan(title));
  console.log(chalk.cyan("================================================"));
}

function safeRead(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

function isLikelyFrontend(filePath) {
  const normalized = toPosix(filePath).toLowerCase();
  return (
    normalized.includes("/src/")
    || normalized.includes("frontend")
    || normalized.includes("client")
    || normalized.includes("web")
  ) && !normalized.includes("/server/") && !normalized.includes("/api/");
}

function isLikelyBackend(filePath) {
  const normalized = toPosix(filePath).toLowerCase();
  return (
    normalized.includes("server")
    || normalized.includes("backend")
    || normalized.includes("api/")
    || normalized.endsWith("express.ts")
    || normalized.endsWith("express.js")
    || normalized.endsWith("server.ts")
    || normalized.endsWith("server.js")
  );
}

function writeIfChanged(filePath, nextContent) {
  const current = safeRead(filePath);
  if (current !== nextContent) {
    fs.writeFileSync(filePath, nextContent);
  }
}

function runCommand(command) {
  try {
    execSync(command, {
      stdio: "pipe",
      encoding: "utf8"
    });
    return { ok: true, output: "" };
  } catch (error) {
    return {
      ok: false,
      output: typeof error?.stdout === "string" ? error.stdout : ""
    };
  }
}

const codeFiles = globSync("**/*.{ts,tsx,js,jsx,mjs,cjs}", {
  cwd: ROOT,
  absolute: true,
  ignore: [
    "**/node_modules/**",
    "**/dist/**",
    "**/.next/**",
    "**/build/**",
    "**/.turbo/**",
    "**/.git/**"
  ]
});

const envFiles = globSync("**/.env*", {
  cwd: ROOT,
  absolute: true,
  ignore: [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/.git/**"
  ]
});

const backendFiles = codeFiles.filter(isLikelyBackend);
const frontendFiles = codeFiles.filter(isLikelyFrontend);

logTitle("CHECKING ENVIRONMENT VARIABLE SAFETY");

if (envFiles.length === 0) {
  addWarning("[WARN] No .env files found. Ensure production env vars are configured in Railway or deployment settings.");
} else {
  addPass(`[PASS] Found ${envFiles.length} env file(s)`);
}

let committedEnvFound = false;
envFiles.forEach((filePath) => {
  const rel = path.relative(ROOT, filePath);
  const lower = rel.toLowerCase();
  if (!lower.includes("example") && !lower.endsWith(".local")) {
    committedEnvFound = true;
  }
});

if (committedEnvFound) {
  addWarning("[WARN] Non-example env files are present. Ensure secrets are not committed to source control.");
}

logTitle("CHECKING EXPOSED SECRETS");

const dangerousSecretNames = [
  "STRIPE_SECRET_KEY",
  "DATABASE_URL",
  "CLERK_SECRET_KEY",
  "OPENAI_API_KEY",
  "JWT_SECRET",
  "SUPABASE_SERVICE_ROLE_KEY"
];

const leakedLiteralPatterns = [
  /sk_(live|test)_[A-Za-z0-9]+/g,
  /rk_(live|test)_[A-Za-z0-9]+/g,
  /ghp_[A-Za-z0-9]+/g,
  /AIza[0-9A-Za-z\-_]{35}/g
];

for (const filePath of codeFiles) {
  const content = safeRead(filePath);
  const rel = path.relative(ROOT, filePath);

  for (const secretName of dangerousSecretNames) {
    if (content.includes(secretName) && isLikelyFrontend(filePath)) {
      addIssue(`[CRITICAL] Secret referenced in frontend code: ${secretName} -> ${rel}`);
    }
  }

  for (const pattern of leakedLiteralPatterns) {
    const match = content.match(pattern);
    if (match && match.length > 0) {
      addIssue(`[CRITICAL] Possible hardcoded secret literal in ${rel}`);
      break;
    }
  }
}

logTitle("CHECKING HELMET");

let helmetFound = false;
for (const filePath of backendFiles) {
  const content = safeRead(filePath);
  if (content.includes("helmet(") || content.includes("app.use(helmet") || content.includes("from \"helmet\"")) {
    helmetFound = true;
    break;
  }
}

if (backendFiles.length === 0) {
  addWarning("[WARN] No backend files detected. Helmet check skipped.");
} else if (helmetFound) {
  addPass("[PASS] Helmet detected");
} else {
  addIssue("[CRITICAL] Helmet missing");
  if (FIX_MODE) {
    const install = runCommand("pnpm add helmet");
    if (install.ok) {
      addPass("[PASS] Auto-fix installed helmet package");
    } else {
      addIssue("[CRITICAL] Auto-fix failed to install helmet");
    }
  }
}

logTitle("CHECKING RATE LIMITER");

let limiterFound = false;
for (const filePath of backendFiles) {
  const content = safeRead(filePath);
  if (content.includes("rateLimit(") || content.includes("express-rate-limit")) {
    limiterFound = true;
    break;
  }
}

if (backendFiles.length === 0) {
  addWarning("[WARN] No backend files detected. Rate limiter check skipped.");
} else if (limiterFound) {
  addPass("[PASS] Rate limiter detected");
} else {
  addIssue("[CRITICAL] Rate limiter missing");
}

logTitle("CHECKING CORS");

for (const filePath of backendFiles) {
  const rel = path.relative(ROOT, filePath);
  const content = safeRead(filePath);
  if (/origin\s*:\s*["']\*["']/.test(content)) {
    addIssue(`[CRITICAL] Dangerous CORS wildcard detected: ${rel}`);
    if (FIX_MODE) {
      const fixed = content.replace(/origin\s*:\s*["']\*["']/g, "origin: [process.env.APP_URL].filter(Boolean)");
      writeIfChanged(filePath, fixed);
      addPass(`[PASS] Auto-fix updated CORS origin in ${rel}`);
    }
  }
}

if (backendFiles.length > 0) {
  const hasCorsUsage = backendFiles.some((filePath) => safeRead(filePath).includes("cors("));
  if (!hasCorsUsage) {
    addWarning("[WARN] No explicit CORS middleware found in backend files.");
  }
}

logTitle("CHECKING AUTH PROTECTION");

let authFound = false;
for (const filePath of codeFiles) {
  const content = safeRead(filePath);
  if (
    content.includes("getAuth(")
    || content.includes("requireAuth")
    || content.includes("auth().protect")
    || content.includes("currentUser(")
  ) {
    authFound = true;
    break;
  }
}

if (authFound) {
  addPass("[PASS] Clerk/auth protection patterns detected");
} else {
  addIssue("[CRITICAL] Clerk/auth protection pattern not detected");
}

logTitle("CHECKING STRIPE WEBHOOK SECURITY");

let stripeWebhookProtected = false;
for (const filePath of backendFiles) {
  const content = safeRead(filePath);
  if (content.includes("constructEvent(") || content.includes("stripe.webhooks.constructEvent")) {
    stripeWebhookProtected = true;
    break;
  }
}

const stripeUsed = codeFiles.some((filePath) => safeRead(filePath).toLowerCase().includes("stripe"));

if (!stripeUsed) {
  addWarning("[WARN] Stripe usage not detected. Webhook verification check not applicable.");
} else if (stripeWebhookProtected) {
  addPass("[PASS] Stripe webhook verification detected");
} else {
  addIssue("[CRITICAL] Stripe webhook verification missing");
}

logTitle("CHECKING DANGEROUS FRONTEND SECRET EXPOSURE");

for (const filePath of frontendFiles) {
  const rel = path.relative(ROOT, filePath);
  const content = safeRead(filePath);
  const secretAccess = content.match(/import\.meta\.env\.([A-Z0-9_]+)/g) || [];
  secretAccess.forEach((token) => {
    const envName = token.split(".").pop() || "";
    if (/(SECRET|PRIVATE|TOKEN|PASSWORD|DATABASE|SERVICE_ROLE|WEBHOOK)/.test(envName) && !envName.startsWith("VITE_PUBLIC_")) {
      addIssue(`[CRITICAL] Frontend code references sensitive env variable ${envName}: ${rel}`);
    }
  });
}

logTitle("CHECKING FILE UPLOAD SECURITY");

let uploadUsageFound = false;
let uploadValidationFound = false;

for (const filePath of backendFiles) {
  const content = safeRead(filePath);
  if (content.includes("multer") || content.includes("upload.single") || content.includes("upload.array")) {
    uploadUsageFound = true;
    if (content.includes("fileFilter") || content.includes("mimetype") || content.includes("limits")) {
      uploadValidationFound = true;
    }
  }
}

if (!uploadUsageFound) {
  addWarning("[WARN] Upload routes not detected.");
} else if (uploadValidationFound) {
  addPass("[PASS] Upload validation detected");
} else {
  addIssue("[CRITICAL] Upload handler found without validation (fileFilter/mimetype/limits)");
}

logTitle("CHECKING ENV FILE KEYS");

for (const filePath of envFiles) {
  const rel = path.relative(ROOT, filePath);
  const content = safeRead(filePath);
  if (content.includes("VITE_STRIPE_SECRET_KEY") || content.includes("VITE_CLERK_SECRET_KEY") || content.includes("VITE_DATABASE_URL")) {
    addIssue(`[CRITICAL] Secret exposed in frontend-prefixed env var: ${rel}`);
  }
}

logTitle("CHECKING RAILWAY PRODUCTION READINESS");

const railwayJsonPath = path.join(ROOT, "railway.json");
const nixpacksPath = path.join(ROOT, "nixpacks.toml");
const hasRailwayConfig = fs.existsSync(railwayJsonPath) || fs.existsSync(nixpacksPath);

if (hasRailwayConfig) {
  addPass("[PASS] Railway config detected");
} else {
  addWarning("[WARN] Railway config file not found (railway.json or nixpacks.toml).");
}

const packageJsonPath = path.join(ROOT, "package.json");
if (fs.existsSync(packageJsonPath)) {
  addPass("[PASS] package.json found");
  const packageJson = JSON.parse(safeRead(packageJsonPath));
  const scripts = packageJson.scripts || {};
  if (scripts.start || scripts["start:prod"] || scripts.preview) {
    addPass("[PASS] Production/start script detected");
  } else {
    addWarning("[WARN] No start/start:prod/preview script found in package.json.");
  }
} else {
  addIssue("[CRITICAL] package.json missing");
}

logTitle("RUNNING DEPENDENCY AUDIT");

const auditResult = runCommand("pnpm audit --audit-level moderate");
if (auditResult.ok) {
  addPass("[PASS] pnpm audit completed with no moderate+ findings");
} else {
  addWarning("[WARN] Dependency vulnerabilities detected by pnpm audit.");
}

logTitle("SECURITY REPORT");

const percent = SCORE.total > 0 ? Math.floor((SCORE.passed / SCORE.total) * 100) : 0;

console.log(chalk.green(`\nSECURITY SCORE: ${percent}%\n`));

console.log(chalk.green("PASSED:"));
for (const item of passed) {
  console.log(chalk.green(item));
}

console.log(chalk.red("\nCRITICAL ISSUES:"));
if (issues.length === 0) {
  console.log(chalk.green("[PASS] No critical issues found."));
} else {
  for (const item of issues) {
    console.log(chalk.red(item));
  }
}

console.log(chalk.yellow("\nWARNINGS:"));
if (warnings.length === 0) {
  console.log(chalk.green("[PASS] No warnings."));
} else {
  for (const item of warnings) {
    console.log(chalk.yellow(item));
  }
}

const escaped = {
  pass: passed.map((item) => item.replaceAll("<", "&lt;").replaceAll(">", "&gt;")),
  issues: issues.map((item) => item.replaceAll("<", "&lt;").replaceAll(">", "&gt;")),
  warnings: warnings.map((item) => item.replaceAll("<", "&lt;").replaceAll(">", "&gt;"))
};

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Security Report</title>
  <style>
    body { font-family: Segoe UI, Arial, sans-serif; margin: 0; padding: 32px; background: #0b1220; color: #f8fafc; }
    h1, h2 { margin: 0 0 14px 0; }
    h2 { margin-top: 30px; }
    .score { font-size: 24px; font-weight: 700; color: #22c55e; margin-bottom: 10px; }
    .pass { color: #34d399; margin: 6px 0; }
    .issue { color: #f87171; margin: 6px 0; }
    .warning { color: #fbbf24; margin: 6px 0; }
    .meta { color: #93c5fd; margin-bottom: 20px; }
  </style>
</head>
<body>
  <h1>Universal Security Report</h1>
  <div class="meta">Generated: ${new Date().toISOString()}</div>
  <div class="score">Security Score: ${percent}%</div>

  <h2>Passed</h2>
  ${escaped.pass.map((item) => `<div class="pass">${item}</div>`).join("") || "<div class=\"pass\">No pass items recorded.</div>"}

  <h2>Critical Issues</h2>
  ${escaped.issues.map((item) => `<div class="issue">${item}</div>`).join("") || "<div class=\"pass\">No critical issues found.</div>"}

  <h2>Warnings</h2>
  ${escaped.warnings.map((item) => `<div class="warning">${item}</div>`).join("") || "<div class=\"pass\">No warnings.</div>"}
</body>
</html>`;

const reportPath = path.join(ROOT, "security-report.html");
fs.writeFileSync(reportPath, html);
console.log(chalk.cyan("\n[OK] security-report.html generated"));
console.log(chalk.cyan("\nSCAN COMPLETE\n"));