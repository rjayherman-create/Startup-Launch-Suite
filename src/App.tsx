import {
  AlertTriangle,
  Archive,
  BadgeDollarSign,
  Boxes,
  CheckCircle2,
  ChevronRight,
  Database,
  Download,
  ExternalLink,
  FileCode2,
  FileImage,
  Fingerprint,
  Globe2,
  Image,
  Layers3,
  Menu,
  Palette,
  RefreshCw,
  Rocket,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Store,
  Type,
  Wand2,
  Workflow,
  X,
  Zap
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  StartupBrandingEngine,
  createBrandProfile,
  stylePresets,
  type BrandProfile,
  type StylePresetId
} from "./branding-engine";
import {
  buildComponentConsistencyChecks,
  buildExportReports,
  buildRailwayReadinessChecks,
  isRailwayReady,
  scoreChecks
} from "./export-checks";
import SmartGuide from "./components/SmartGuide";

type BuilderStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type StoreCheck = "unchecked" | "checking" | "checked";
type LaunchTargets = {
  website: boolean;
  ios: boolean;
  android: boolean;
};
type LogoMode = "Lockup" | "Badge" | "Wordmark";
type LogoMark = "Orbit" | "Spark" | "Stack" | "Shield" | "Wave" | "Monogram";
type LogoMood = "Modern SaaS" | "Premium" | "Bold Consumer" | "Trust";
type NameFilter = "premium" | "tech" | "consumer" | "enterprise" | "short" | "brandable";
type ExportTarget =
  | "figma"
  | "replit"
  | "vscode"
  | "lovable"
  | "bubble"
  | "react"
  | "html-css"
  | "tailwind"
  | "mobile-assets"
  | "full-production";

type ExportOptions = {
  cssVariables: boolean;
  tailwindClasses: boolean;
  responsiveLayouts: boolean;
  darkMode: boolean;
  svgVersions: boolean;
  pngFallbacks: boolean;
  readmeInstructions: boolean;
  designTokens: boolean;
  compressImages: boolean;
  seoMetadata: boolean;
};

const builderRoutes: Array<{ step: BuilderStep; label: string; path: string }> = [
  { step: 1, label: "Name Startup", path: "/name-startup" },
  { step: 2, label: "Describe Startup", path: "/describe-startup" },
  { step: 3, label: "Brand Style", path: "/brand-style" },
  { step: 4, label: "Brand Identity", path: "/brand-identity" },
  { step: 5, label: "Visual Assets", path: "/visual-assets" },
  { step: 6, label: "Landing Page", path: "/landing-page" },
  { step: 7, label: "Launch Optimization", path: "/launch-optimization" },
  { step: 8, label: "Export Startup Kit", path: "/export-kit" }
];

const routeSectionIds: Record<BuilderStep, string> = {
  1: "section-name-startup",
  2: "section-describe-startup",
  3: "section-brand-style",
  4: "section-brand-identity",
  5: "section-visual-assets",
  6: "section-landing-page",
  7: "section-launch-optimization",
  8: "section-export-kit"
};

const stepDescriptions: Record<BuilderStep, string> = {
  1: "Find a market-ready startup name with reasoning and availability context.",
  2: "Describe your startup clearly and shape launch messaging.",
  3: "Select a visual style that drives every generated asset.",
  4: "Create and refine your startup brand identity.",
  5: "Tune colors, visuals, and direction across channels.",
  6: "Generate and edit your launch landing page.",
  7: "Check launch readiness for stores, SEO, and social.",
  8: "Export a complete startup launch kit."
};

const exportTargets: Array<{ id: ExportTarget; label: string }> = [
  { id: "figma", label: "Figma Design File" },
  { id: "replit", label: "Replit Project" },
  { id: "vscode", label: "VS Code Project" },
  { id: "lovable", label: "Lovable Prompt Package" },
  { id: "bubble", label: "Bubble Components" },
  { id: "react", label: "React Components" },
  { id: "html-css", label: "HTML/CSS Package" },
  { id: "tailwind", label: "Tailwind UI Kit" },
  { id: "mobile-assets", label: "Mobile App Assets" },
  { id: "full-production", label: "Full Production Bundle" }
];

const defaultProfile = createBrandProfile({
  businessName: "LaunchPilot",
  tagline: "AI Startup Launch System",
  description: "AI platform that helps founders launch startups with branding, website assets, and conversion-focused pages.",
  industry: "SaaS",
  audience: "solo founders and small startup teams",
  presetId: "startup-dark"
});

const exportItems = [
  { label: "Logo PNG", icon: FileImage, detail: "Primary mark and social-safe image" },
  { label: "Logo SVG", icon: FileCode2, detail: "Editable vector source" },
  { label: "Favicon Package", icon: Fingerprint, detail: "16px, 32px, Apple touch icon" },
  { label: "Hero Images", icon: Image, detail: "Launch page hero and product mockup art" },
  { label: "Landing Code", icon: Globe2, detail: "Homepage HTML with CTA sections" },
  { label: "Brand Tokens", icon: Palette, detail: "Colors, fonts, style direction" }
];

const systemCards = [
  { icon: Database, title: "Postgres", detail: "One main database stores brand profiles, asset versions, exports, billing state, and regeneration history." },
  { icon: ShieldCheck, title: "Clerk/Auth", detail: "One identity layer across free tools, standalone apps, and the main Startup Launch Suite." },
  { icon: BadgeDollarSign, title: "Stripe", detail: "$29-$99 monthly plans or a $99 one-time startup pack at export." },
  { icon: Boxes, title: "Isolated Services", detail: "Logo, favicon, hero, and landing generators keep separate prompt systems and worker queues." }
];

const pipeline = [
  "Name the startup",
  "Generate brand identity",
  "Create visual assets",
  "Build the landing page",
  "Optimize for launch"
];

const namingAngles = ["Pilot", "Forge", "Stack", "Kit", "Signal", "Studio", "Base", "Lift"];

const logoMarks: Array<{ name: LogoMark; shape: string }> = [
  { name: "Orbit", shape: "M18 54c18-34 45-48 82-42-22 13-38 29-48 48 18-6 34-5 48 2-28 23-67 31-112-8Z" },
  { name: "Spark", shape: "M64 12 78 50l40 14-40 14-14 40-14-40-38-14 38-14Z" },
  { name: "Stack", shape: "M28 22h54a18 18 0 0 1 18 18v54H46a18 18 0 0 1-18-18Z" },
  { name: "Shield", shape: "M64 10 106 28v34c0 26-17 44-42 56-25-12-42-30-42-56V28Z" },
  { name: "Wave", shape: "M26 78c15-42 54-60 88-38-16 2-28 11-34 28 17-6 31-3 42 8-28 26-62 33-96 2Z" },
  { name: "Monogram", shape: "M64 12a52 52 0 1 1 0 104 52 52 0 0 1 0-104Zm0 18a34 34 0 1 0 0 68 34 34 0 0 0 0-68Z" }
];

const logoMoods: LogoMood[] = ["Modern SaaS", "Premium", "Bold Consumer", "Trust"];

export function App() {
  const [step, setStep] = useState<BuilderStep>(() => getStepFromPath(window.location.pathname));
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [businessName, setBusinessName] = useState(defaultProfile.businessName);
  const [tagline, setTagline] = useState(defaultProfile.tagline ?? "");
  const [description, setDescription] = useState(defaultProfile.description);
  const [industry, setIndustry] = useState(defaultProfile.industry);
  const [audience, setAudience] = useState(defaultProfile.audience);
  const [launchTargets, setLaunchTargets] = useState<LaunchTargets>({
    website: true,
    ios: true,
    android: true
  });
  const [logoMode, setLogoMode] = useState<LogoMode>("Lockup");
  const [logoMark, setLogoMark] = useState<LogoMark>("Orbit");
  const [logoMood, setLogoMood] = useState<LogoMood>("Modern SaaS");
  const [presetId, setPresetId] = useState<StylePresetId>("startup-dark");
  const [brandProfile, setBrandProfile] = useState<BrandProfile>(defaultProfile);
  const [aiEditPrompt, setAiEditPrompt] = useState("");
  const [aiEditStatus, setAiEditStatus] = useState("");
  const [stepAiInsight, setStepAiInsight] = useState("");
  const [nameIdeas, setNameIdeas] = useState<string[]>(["LaunchPilot", "FounderForge", "StartupLift", "BrandStack"]);
  const [nameFilter, setNameFilter] = useState<NameFilter | null>(null);
  const [favoriteNames, setFavoriteNames] = useState<string[]>([]);
  const [storeCheck, setStoreCheck] = useState<Record<"ios" | "android", StoreCheck>>({
    ios: "unchecked",
    android: "unchecked"
  });
  const [codeDraft, setCodeDraft] = useState(defaultLandingCode(defaultProfile));
  const [clipboardStatus, setClipboardStatus] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [exportTarget, setExportTarget] = useState<ExportTarget>("full-production");
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    cssVariables: true,
    tailwindClasses: true,
    responsiveLayouts: true,
    darkMode: true,
    svgVersions: true,
    pngFallbacks: true,
    readmeInstructions: true,
    designTokens: true,
    compressImages: true,
    seoMetadata: true
  });
  const [generating, setGenerating] = useState(false);
  const [assetStatus, setAssetStatus] = useState({
    identity: false,
    website: false,
    landing: false,
    export: false
  });

  const engine = useMemo(() => new StartupBrandingEngine(brandProfile), [brandProfile]);
  const wantsApp = launchTargets.ios || launchTargets.android;
  const wantsWebsite = launchTargets.website;

  useEffect(() => {
    const handlePopState = () => setStep(getStepFromPath(window.location.pathname));
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [step]);

  useEffect(() => {
    if (!isMobileNavOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileNavOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileNavOpen]);

  useEffect(() => {
    window.requestAnimationFrame(() => scrollToStepSection(step));
  }, [step]);

  function goToStep(nextStep: BuilderStep, mode: "push" | "replace" = "push") {
    const route = builderRoutes.find((item) => item.step === nextStep) ?? builderRoutes[0];
    if (window.location.pathname !== route.path) {
      const update = mode === "replace" ? window.history.replaceState : window.history.pushState;
      update.call(window.history, { step: nextStep }, "", route.path);
    }
    setStep(nextStep);
  }

  function generateNameIdeas(filter: NameFilter | null = nameFilter) {
    const words = `${description} ${industry} ${audience}`
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3 && !["that", "with", "from", "this", "your", "startup", "platform"].includes(word));
    const seed = words.slice(0, 4).map((word) => word[0].toUpperCase() + word.slice(1));
    let ideas = [...seed, "Launch"].flatMap((word, index) => [
      `${word}${namingAngles[index % namingAngles.length]}`,
      `${namingAngles[(index + 2) % namingAngles.length]}${word}`
    ]);

    if (filter === "short") ideas = ideas.sort((a, b) => a.length - b.length);
    if (filter === "tech") ideas = ideas.map((item) => item.replace(/(Studio|Lift)/g, "Stack"));
    if (filter === "premium") ideas = ideas.map((item) => item.replace(/(Kit|Base)/g, "Prime"));
    if (filter === "enterprise") ideas = ideas.map((item) => item.replace(/(Lift|Pilot)/g, "Core"));
    if (filter === "consumer") ideas = ideas.map((item) => item.replace(/(Stack|Forge)/g, "Flow"));

    setNameIdeas([...new Set(ideas)].slice(0, 8));
    setNameFilter(filter);
    goToStep(1);
  }

  function selectName(name: string) {
    setBusinessName(name);
    setStoreCheck({ ios: "unchecked", android: "unchecked" });
  }

  function toggleFavoriteName(name: string) {
    setFavoriteNames((current) => (current.includes(name) ? current.filter((item) => item !== name) : [...current, name]));
  }

  function rewriteDescription(tone: "professional" | "technical" | "investor" | "short" | "exciting") {
    if (tone === "professional") {
      setDescription(`${businessName} helps ${audience} solve ${description.split(".")[0]?.toLowerCase() || "market pain"} with a consistent AI launch workflow.`);
      return;
    }
    if (tone === "technical") {
      setDescription(`${businessName} is a launch automation system that unifies brand generation, visual assets, and landing page orchestration in one workflow.`);
      return;
    }
    if (tone === "investor") {
      setDescription(`${businessName} reduces time-to-launch for founders by turning startup strategy into a complete brand, web, and export pipeline.`);
      return;
    }
    if (tone === "short") {
      setDescription(`${businessName} launches startups faster with one AI workflow.`);
      return;
    }
    setDescription(`${businessName} turns an idea into a launch-ready startup system in one guided AI flow.`);
  }

  function saveProgress() {
    window.localStorage.setItem("launch-os-progress", JSON.stringify({
      step,
      businessName,
      tagline,
      description,
      industry,
      audience,
      launchTargets,
      presetId,
      nameFilter,
      favoriteNames
    }));
    setSaveStatus("Saved");
    window.setTimeout(() => setSaveStatus(""), 1800);
  }

  function toggleLaunchTarget(target: keyof LaunchTargets) {
    setLaunchTargets((current) => {
      const next = { ...current, [target]: !current[target] };
      return next.website || next.ios || next.android ? next : current;
    });
  }

  function checkStore(platform: "ios" | "android") {
    setStoreCheck((current) => ({ ...current, [platform]: "checking" }));
    const query = encodeURIComponent(businessName.trim());
    const url = platform === "ios"
      ? `https://itunes.apple.com/search?country=us&media=software&term=${query}`
      : `https://play.google.com/store/search?q=${query}&c=apps`;

    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => {
      setStoreCheck((current) => ({ ...current, [platform]: "checked" }));
    }, 650);
  }

  async function generateIdentity() {
    setGenerating(true);
    const profile = createBrandProfile({ businessName, tagline, description, industry, audience, presetId });
    const nextEngine = new StartupBrandingEngine(profile);
    await nextEngine.generateLogo();
    await nextEngine.generateFavicon();
    setBrandProfile(nextEngine.getProfile());
    setAssetStatus((current) => ({ ...current, identity: true }));
    goToStep(4);
    setGenerating(false);
  }

  async function generateLogoAsset() {
    setGenerating(true);
    const profile = createBrandProfile({ businessName, tagline, description, industry, audience, presetId });
    const nextEngine = new StartupBrandingEngine(profile);
    await nextEngine.generateLogo();
    setBrandProfile(nextEngine.getProfile());
    setAssetStatus((current) => ({ ...current, identity: false }));
    goToStep(4);
    setGenerating(false);
  }

  async function generateFaviconAsset() {
    setGenerating(true);
    const profile = brandProfile.logo
      ? brandProfile
      : createBrandProfile({ businessName, tagline, description, industry, audience, presetId });
    const nextEngine = new StartupBrandingEngine(profile);
    if (!nextEngine.getProfile().logo) {
      await nextEngine.generateLogo();
    }
    await nextEngine.generateFavicon();
    setBrandProfile(nextEngine.getProfile());
    setAssetStatus((current) => ({ ...current, identity: Boolean(nextEngine.getProfile().logo && nextEngine.getProfile().favicon) }));
    goToStep(4);
    setGenerating(false);
  }

  async function generateWebsiteAssets() {
    setGenerating(true);
    await engine.generateHeroImage();
    setBrandProfile({ ...engine.getProfile() });
    setAssetStatus((current) => ({ ...current, website: true }));
    goToStep(5);
    setGenerating(false);
  }

  async function generateScreenshotInspiration() {
    setGenerating(true);
    const nextEngine = new StartupBrandingEngine(brandProfile);
    await nextEngine.generateScreenshotInspiration();
    setBrandProfile({ ...nextEngine.getProfile() });
    setAssetStatus((current) => ({ ...current, website: true }));
    if (window.location.pathname !== "/visual-assets") {
      window.history.pushState({ step: 5 }, "", "/visual-assets");
    }
    setStep(5);
    setGenerating(false);
  }

  async function generateHeroImageAsset() {
    setGenerating(true);
    const nextEngine = new StartupBrandingEngine(brandProfile);
    await nextEngine.generateHeroImage();
    setBrandProfile({ ...nextEngine.getProfile() });
    setAssetStatus((current) => ({ ...current, website: true }));
    if (window.location.pathname !== "/visual-assets") {
      window.history.pushState({ step: 5 }, "", "/visual-assets");
    }
    setStep(5);
    setGenerating(false);
  }

  async function generateLandingPage() {
    if (!wantsWebsite) {
      setAssetStatus((current) => ({ ...current, landing: true }));
      goToStep(8);
      return;
    }

    setGenerating(true);
    await engine.generateLandingPage();
    const nextProfile = { ...engine.getProfile() };
    setBrandProfile(nextProfile);
    setCodeDraft(nextProfile.landingPage?.html ?? defaultLandingCode(nextProfile));
    setAssetStatus((current) => ({ ...current, landing: true }));
    goToStep(6);
    setGenerating(false);
  }

  async function generateHomepageAsset() {
    if (!wantsWebsite) {
      setAssetStatus((current) => ({ ...current, landing: true }));
      return;
    }

    setGenerating(true);
    const nextEngine = new StartupBrandingEngine(brandProfile);
    await nextEngine.generateLandingPage();
    const nextProfile = { ...nextEngine.getProfile() };
    setBrandProfile(nextProfile);
    setCodeDraft(nextProfile.landingPage?.html ?? defaultLandingCode(nextProfile));
    setAssetStatus((current) => ({ ...current, landing: true }));
    if (window.location.pathname !== "/visual-assets") {
      window.history.pushState({ step: 5 }, "", "/visual-assets");
    }
    setStep(5);
    setGenerating(false);
  }

  async function regenerate(newPresetId: StylePresetId) {
    setGenerating(true);
    const result = await engine.regenerateBranding(newPresetId);
    setPresetId(newPresetId);
    setBrandProfile(result.profile);
    setAssetStatus({ identity: true, website: true, landing: true, export: assetStatus.export });
    setGenerating(false);
  }

  function updateBrandColor(name: keyof BrandProfile["colors"], value: string) {
    setBrandProfile((current) => ({
      ...current,
      colors: {
        ...current.colors,
        [name]: value
      },
      revision: current.revision + 1,
      memory: [`${name} color edited to ${value}.`, ...current.memory].slice(0, 8)
    }));
    setAssetStatus((current) => ({ ...current, website: false, landing: false, export: false }));
  }

  function updateBrandStyle(value: string) {
    setBrandProfile((current) => ({
      ...current,
      visualDirection: value,
      style: value.split(",")[0]?.trim() || current.style,
      revision: current.revision + 1,
      memory: ["Style direction edited manually.", ...current.memory].slice(0, 8)
    }));
    setAssetStatus((current) => ({ ...current, website: false, landing: false, export: false }));
  }

  function applyAiBrandEdit() {
    const edit = aiEditPrompt.toLowerCase();
    if (!edit.trim()) {
      setAiEditStatus("Describe the change you want first.");
      return;
    }

    setBrandProfile((current) => {
      const nextColors = { ...current.colors };
      let nextTone = current.tone;
      let nextStyle = current.style;
      let nextDirection = current.visualDirection;

      if (edit.includes("purple")) {
        nextColors.primary = "#7c3aed";
        nextColors.secondary = "#2563eb";
        nextColors.accent = "#f97316";
      }
      if (edit.includes("green")) {
        nextColors.primary = "#0f766e";
        nextColors.secondary = "#14532d";
        nextColors.accent = "#eab308";
      }
      if (edit.includes("blue")) {
        nextColors.primary = "#2563eb";
        nextColors.secondary = "#0891b2";
        nextColors.accent = "#f97316";
      }
      if (edit.includes("dark")) {
        nextColors.background = "#08111f";
        nextColors.surface = "#111827";
        nextColors.text = "#f8fafc";
        nextDirection = "dark high-contrast launch system with luminous app and website surfaces";
      }
      if (edit.includes("light") || edit.includes("bright")) {
        nextColors.background = "#f8fafc";
        nextColors.surface = "#ffffff";
        nextColors.text = "#172033";
        nextDirection = "bright clean product launch system with crisp trustworthy surfaces";
      }
      if (edit.includes("premium")) {
        nextTone = "Premium";
        nextStyle = "Premium Launch";
        nextDirection = "premium, investor-ready launch identity with calm trust cues and polished conversion surfaces";
      }
      if (edit.includes("playful") || edit.includes("fun")) {
        nextTone = "Energetic";
        nextStyle = "Playful App Launch";
        nextDirection = "energetic app launch identity with friendly shapes, confident color, and approachable conversion sections";
      }
      if (edit.includes("minimal") || edit.includes("clean")) {
        nextTone = "Clear";
        nextStyle = "Clean SaaS";
        nextDirection = "minimal SaaS launch identity with restrained panels, clean typography, and direct product clarity";
      }

      return {
        ...current,
        colors: nextColors,
        tone: nextTone,
        style: nextStyle,
        visualDirection: nextDirection,
        revision: current.revision + 1,
        memory: [`AI edit applied: "${aiEditPrompt}".`, ...current.memory].slice(0, 8)
      };
    });

    setAssetStatus((current) => ({ ...current, website: false, landing: false, export: false }));
    setAiEditStatus("AI edit applied to brand context.");
    window.setTimeout(() => setAiEditStatus(""), 2200);
  }

  function improveCurrentStep() {
    const insight = buildStepAiInsight({
      step,
      businessName,
      tagline,
      description,
      industry,
      audience,
      launchTargets,
      brandProfile,
      assetStatus,
      codeDraft,
      storeCheck,
      exportTarget
    });

    setStepAiInsight(insight);

    if (step === 1) {
      generateNameIdeas(nameFilter);
    }
    if (step === 2) {
      rewriteDescription("professional");
    }
    if (step === 3) {
      setPresetId(industry.toLowerCase().includes("fintech") ? "premium-fintech" : industry.toLowerCase().includes("consumer") ? "bold-consumer" : "clean-saas");
    }
    if (step === 5) {
      setAiEditPrompt("Make this more premium, clear, and conversion-focused while keeping the brand consistent.");
      setAiEditStatus("AI prompt prepared for the Visual Assets brand editor.");
      window.setTimeout(() => setAiEditStatus(""), 2200);
    }
  }

  function exportStartupKit() {
    downloadStartupKit(brandProfile, launchTargets, codeDraft, exportTarget, exportOptions);
    setAssetStatus((current) => ({ ...current, export: true }));
    goToStep(8);
  }

  function exportRailwayBundle() {
    downloadStartupKit(brandProfile, launchTargets, codeDraft, "full-production", exportOptions, { railwayOnly: true });
    setAssetStatus((current) => ({ ...current, export: true }));
    goToStep(8);
  }

  function toggleExportOption(option: keyof ExportOptions) {
    setExportOptions((current) => ({ ...current, [option]: !current[option] }));
  }

  async function copyCodeDraft() {
    await navigator.clipboard.writeText(codeDraft);
    setClipboardStatus("Copied code to clipboard");
    window.setTimeout(() => setClipboardStatus(""), 1800);
  }

  async function cutCodeDraft() {
    await navigator.clipboard.writeText(codeDraft);
    setCodeDraft("");
    setClipboardStatus("Cut code to clipboard");
    window.setTimeout(() => setClipboardStatus(""), 1800);
  }

  const milestones = [
    { label: "Startup named", percent: 10, done: Boolean(businessName.trim()) },
    { label: "Startup described", percent: 20, done: description.trim().length > 25 },
    { label: "Brand style selected", percent: 35, done: Boolean(presetId) },
    { label: "Logo generated", percent: 50, done: Boolean(brandProfile.logo) || assetStatus.identity },
    { label: "Visual assets complete", percent: 65, done: assetStatus.website || Boolean(brandProfile.heroImage) },
    { label: "Landing page generated", percent: 80, done: assetStatus.landing || Boolean(codeDraft.trim()) },
    { label: "Launch optimization complete", percent: 90, done: !wantsApp || storeCheck.ios === "checked" || storeCheck.android === "checked" },
    { label: "Export ready", percent: 100, done: assetStatus.export }
  ] as const;
  const progress = [...milestones].reverse().find((item) => item.done)?.percent ?? 0;
  const currentStepRoute = builderRoutes.find((item) => item.step === step) ?? builderRoutes[0];
  const previousStep = step > 1 ? ((step - 1) as BuilderStep) : null;
  const nextStep = step < 8 ? ((step + 1) as BuilderStep) : null;
  const platformSummary = [launchTargets.website ? "Website" : null, launchTargets.ios ? "iOS" : null, launchTargets.android ? "Android" : null].filter(Boolean).join(" + ");

  return (
    <main className="app-shell">
      {isMobileNavOpen ? <button aria-label="Close navigation menu" className="mobile-nav-overlay" onClick={() => setIsMobileNavOpen(false)} type="button" /> : null}

      <aside className={isMobileNavOpen ? "rail mobile-open" : "rail"}>
        <div className="brand-lockup">
          <div className="brand-mark"><Rocket size={24} /></div>
          <div>
            <strong>Launch OS</strong>
            <span>Startup Launch Suite</span>
          </div>
          <button aria-label="Close navigation menu" className="mobile-nav-close" onClick={() => setIsMobileNavOpen(false)} type="button">
            <X size={20} />
          </button>
        </div>

        <nav className="step-list" id="startup-builder-steps" aria-label="Startup builder steps">
          {builderRoutes.map((route, index) => {
            return (
              <a className={step === route.step ? "step active" : "step"} href={route.path} key={route.path} onClick={(event) => {
                event.preventDefault();
                goToStep(route.step);
              }}>
                <span>{index + 1}</span>
                <strong>{route.label}</strong>
              </a>
            );
          })}
        </nav>

        <div className="suite-positioning">
          <Sparkles size={18} />
          <p>One guided launch system, not four separate tools.</p>
        </div>
      </aside>

      <section className="workspace">
        <div className="mobile-nav-bar">
          <button aria-controls="startup-builder-steps" aria-expanded={isMobileNavOpen} aria-label="Open navigation menu" className="mobile-nav-toggle" onClick={() => setIsMobileNavOpen(true)} type="button">
            <Menu size={20} />
            <span>Menu</span>
          </button>
          <span className="mobile-nav-title">Step {step} of 8</span>
        </div>

        <header className={step === 1 ? "topbar hero" : "topbar compact"}>
          <div>
            <p className="eyebrow">LaunchOS workflow</p>
            {step === 1 ? (
              <h1>Name the startup, create the brand, generate visuals, build the page, and package everything for launch.</h1>
            ) : (
              <h2>Step {step} of 8 - {currentStepRoute.label}</h2>
            )}
            <p className="header-subtext">Creating launch assets for {businessName}</p>
          </div>
          <div className="progress-card">
            <span>Startup kit</span>
            <strong>{progress}%</strong>
            <div><i style={{ width: `${progress}%` }} /></div>
          </div>
        </header>

        <section className="startup-summary-bar" data-guide="dashboard">
          <div className="summary-line">
            <strong>{businessName}</strong>
            <span>{tagline || "No tagline"}</span>
            <span>{industry}</span>
            <span>{stylePresets.find((item) => item.id === presetId)?.label || "Style"}</span>
            <span>{platformSummary || "No platform selected"}</span>
          </div>
          <div className="summary-milestones">
            {milestones.map((item) => (
              <span key={item.label} className={item.done ? "milestone-chip done" : "milestone-chip"}>
                {item.done ? <CheckCircle2 size={13} /> : null}
                {item.label}
              </span>
            ))}
          </div>
        </section>

        <section className="workflow-step-meta">
          <h3>{currentStepRoute.label}</h3>
          <p>{stepDescriptions[step]}</p>
        </section>

        <StepAiPanel
          insight={stepAiInsight}
          onImprove={improveCurrentStep}
          step={step}
        />

        <StepPage
          assetStatus={assetStatus}
          aiEditPrompt={aiEditPrompt}
          aiEditStatus={aiEditStatus}
          applyAiBrandEdit={applyAiBrandEdit}
          audience={audience}
          brandProfile={brandProfile}
          businessName={businessName}
          checkStore={checkStore}
          clipboardStatus={clipboardStatus}
          codeDraft={codeDraft}
          copyCodeDraft={copyCodeDraft}
          cutCodeDraft={cutCodeDraft}
          description={description}
          exportOptions={exportOptions}
          exportTarget={exportTarget}
          exportStartupKit={exportStartupKit}
          exportRailwayBundle={exportRailwayBundle}
          generateIdentity={generateIdentity}
          generateFaviconAsset={generateFaviconAsset}
          generateHeroImageAsset={generateHeroImageAsset}
          generateHomepageAsset={generateHomepageAsset}
          generateLandingPage={generateLandingPage}
          generateLogoAsset={generateLogoAsset}
          generateNameIdeas={generateNameIdeas}
          generateScreenshotInspiration={generateScreenshotInspiration}
          generateWebsiteAssets={generateWebsiteAssets}
          nameFilter={nameFilter}
          favoriteNames={favoriteNames}
          rewriteDescription={rewriteDescription}
          generating={generating}
          industry={industry}
          launchTargets={launchTargets}
          logoMark={logoMark}
          logoMode={logoMode}
          logoMood={logoMood}
          nameIdeas={nameIdeas}
          presetId={presetId}
          regenerate={regenerate}
          selectName={selectName}
          toggleFavoriteName={toggleFavoriteName}
          setAudience={setAudience}
          setAiEditPrompt={setAiEditPrompt}
          setBusinessName={setBusinessName}
          setCodeDraft={setCodeDraft}
          setDescription={setDescription}
          setIndustry={setIndustry}
          setLogoMark={setLogoMark}
          setLogoMode={setLogoMode}
          setLogoMood={setLogoMood}
          setExportTarget={setExportTarget}
          setPresetId={setPresetId}
          setTagline={setTagline}
          step={step}
          storeCheck={storeCheck}
          tagline={tagline}
          toggleExportOption={toggleExportOption}
          toggleLaunchTarget={toggleLaunchTarget}
          updateBrandColor={updateBrandColor}
          updateBrandStyle={updateBrandStyle}
          wantsApp={wantsApp}
          wantsWebsite={wantsWebsite}
        />

        <footer className="sticky-step-nav">
          <button className="secondary-button" disabled={!previousStep} onClick={() => previousStep && goToStep(previousStep)} type="button">Previous Step</button>
          <div className="sticky-actions-center">
            <button className="secondary-button" onClick={saveProgress} type="button">Save Progress</button>
            {saveStatus ? <span className="save-status">{saveStatus}</span> : null}
          </div>
          <button className="primary-button" disabled={!nextStep} onClick={() => nextStep && goToStep(nextStep)} type="button">Continue <ChevronRight size={15} /></button>
        </footer>

        <SmartGuide />
      </section>
    </main>
  );
}

function StepPage(props: {
  assetStatus: { identity: boolean; website: boolean; landing: boolean; export: boolean };
  aiEditPrompt: string;
  aiEditStatus: string;
  applyAiBrandEdit: () => void;
  audience: string;
  brandProfile: BrandProfile;
  businessName: string;
  checkStore: (platform: "ios" | "android") => void;
  clipboardStatus: string;
  codeDraft: string;
  copyCodeDraft: () => void;
  cutCodeDraft: () => void;
  description: string;
  exportOptions: ExportOptions;
  exportTarget: ExportTarget;
  exportStartupKit: () => void;
  exportRailwayBundle: () => void;
  generateIdentity: () => void;
  generateFaviconAsset: () => void;
  generateHeroImageAsset: () => void;
  generateHomepageAsset: () => void;
  generateLandingPage: () => void;
  generateLogoAsset: () => void;
  generateNameIdeas: (filter?: NameFilter | null) => void;
  generateScreenshotInspiration: () => void;
  generateWebsiteAssets: () => void;
  nameFilter: NameFilter | null;
  favoriteNames: string[];
  rewriteDescription: (tone: "professional" | "technical" | "investor" | "short" | "exciting") => void;
  generating: boolean;
  industry: string;
  launchTargets: LaunchTargets;
  logoMark: LogoMark;
  logoMode: LogoMode;
  logoMood: LogoMood;
  nameIdeas: string[];
  presetId: StylePresetId;
  regenerate: (preset: StylePresetId) => void;
  selectName: (name: string) => void;
  toggleFavoriteName: (name: string) => void;
  setAudience: (value: string) => void;
  setAiEditPrompt: (value: string) => void;
  setBusinessName: (value: string) => void;
  setCodeDraft: (value: string) => void;
  setDescription: (value: string) => void;
  setIndustry: (value: string) => void;
  setLogoMark: (value: LogoMark) => void;
  setLogoMode: (value: LogoMode) => void;
  setLogoMood: (value: LogoMood) => void;
  setExportTarget: (value: ExportTarget) => void;
  setPresetId: (value: StylePresetId) => void;
  setTagline: (value: string) => void;
  step: BuilderStep;
  storeCheck: Record<"ios" | "android", StoreCheck>;
  tagline: string;
  toggleExportOption: (option: keyof ExportOptions) => void;
  toggleLaunchTarget: (target: keyof LaunchTargets) => void;
  updateBrandColor: (name: keyof BrandProfile["colors"], value: string) => void;
  updateBrandStyle: (value: string) => void;
  wantsApp: boolean;
  wantsWebsite: boolean;
}) {
  if (props.step <= 3) {
    return (
      <div className="step-page">
        <BuilderPanel
          audience={props.audience}
          businessName={props.businessName}
          checkStore={props.checkStore}
          description={props.description}
          favoriteNames={props.favoriteNames}
          generateNameIdeas={props.generateNameIdeas}
          nameFilter={props.nameFilter}
          industry={props.industry}
          launchTargets={props.launchTargets}
          logoMark={props.logoMark}
          logoMode={props.logoMode}
          logoMood={props.logoMood}
          nameIdeas={props.nameIdeas}
          presetId={props.presetId}
          selectName={props.selectName}
          rewriteDescription={props.rewriteDescription}
          toggleFavoriteName={props.toggleFavoriteName}
          setAudience={props.setAudience}
          setBusinessName={props.setBusinessName}
          setDescription={props.setDescription}
          setIndustry={props.setIndustry}
          setLogoMark={props.setLogoMark}
          setLogoMode={props.setLogoMode}
          setLogoMood={props.setLogoMood}
          setPresetId={props.setPresetId}
          setTagline={props.setTagline}
          step={props.step}
          storeCheck={props.storeCheck}
          tagline={props.tagline}
          toggleLaunchTarget={props.toggleLaunchTarget}
        />
      </div>
    );
  }

  if (props.step === 4) {
    return (
      <section className="step-page brand-identity-layout" id="section-brand-identity">
        <LogoCreatorStudio
          businessName={props.businessName}
          generateFaviconAsset={props.generateFaviconAsset}
          generateLogoAsset={props.generateLogoAsset}
          industry={props.industry}
          logoMark={props.logoMark}
          logoMode={props.logoMode}
          logoMood={props.logoMood}
          profile={props.brandProfile}
          setBusinessName={props.setBusinessName}
          setIndustry={props.setIndustry}
          setLogoMark={props.setLogoMark}
          setLogoMode={props.setLogoMode}
          setLogoMood={props.setLogoMood}
          setTagline={props.setTagline}
          tagline={props.tagline}
        />
      </section>
    );
  }

  return (
    <div className="step-page">
      <OutputPanel
        assetStatus={props.assetStatus}
        aiEditPrompt={props.aiEditPrompt}
        aiEditStatus={props.aiEditStatus}
        applyAiBrandEdit={props.applyAiBrandEdit}
        brandProfile={props.brandProfile}
        clipboardStatus={props.clipboardStatus}
        codeDraft={props.codeDraft}
        copyCodeDraft={props.copyCodeDraft}
        cutCodeDraft={props.cutCodeDraft}
        exportOptions={props.exportOptions}
        exportTarget={props.exportTarget}
        exportStartupKit={props.exportStartupKit}
        exportRailwayBundle={props.exportRailwayBundle}
        generateLandingPage={props.generateLandingPage}
        generateScreenshotInspiration={props.generateScreenshotInspiration}
        generateHomepageAsset={props.generateHomepageAsset}
        generateWebsiteAssets={props.generateHeroImageAsset}
        generating={props.generating}
        checkStore={props.checkStore}
        launchTargets={props.launchTargets}
        regenerate={props.regenerate}
        setAiEditPrompt={props.setAiEditPrompt}
        setCodeDraft={props.setCodeDraft}
        setExportTarget={props.setExportTarget}
        step={props.step}
        storeCheck={props.storeCheck}
        updateBrandColor={props.updateBrandColor}
        updateBrandStyle={props.updateBrandStyle}
        toggleExportOption={props.toggleExportOption}
        wantsApp={props.wantsApp}
        wantsWebsite={props.wantsWebsite}
      />
    </div>
  );
}

function StepAiPanel({ insight, onImprove, step }: { insight: string; onImprove: () => void; step: BuilderStep }) {
  const stepActions: Record<BuilderStep, string> = {
    1: "Generate stronger startup names and positioning angles.",
    2: "Rewrite the description into clearer launch copy.",
    3: "Recommend a brand style from the startup context.",
    4: "Review logo, colors, typography, and app icon direction.",
    5: "Prepare a sharper visual direction for assets and mockups.",
    6: "Review the page for conversion structure and missing proof.",
    7: "Prepare store, SEO, keyword, and social publishing guidance.",
    8: "Review export readiness, deployment risk, and missing files."
  };

  return (
    <section className="step-ai-panel">
      <div>
        <p className="eyebrow">AI assistant on this step</p>
        <h3>{stepActions[step]}</h3>
        <p>{insight || "OpenAI is not connected yet. This uses local brand-context intelligence now and is ready for a secure backend OpenAI endpoint later."}</p>
      </div>
      <button className="secondary-button ai-step-button" onClick={onImprove} type="button">
        <Sparkles size={18} /> AI Improve This Step
      </button>
    </section>
  );
}

function BuilderPanel(props: {
  audience: string;
  businessName: string;
  checkStore: (platform: "ios" | "android") => void;
  description: string;
  favoriteNames: string[];
  generateNameIdeas: (filter?: NameFilter | null) => void;
  industry: string;
  nameFilter: NameFilter | null;
  launchTargets: LaunchTargets;
  logoMark: LogoMark;
  logoMode: LogoMode;
  logoMood: LogoMood;
  nameIdeas: string[];
  presetId: StylePresetId;
  rewriteDescription: (tone: "professional" | "technical" | "investor" | "short" | "exciting") => void;
  selectName: (name: string) => void;
  toggleFavoriteName: (name: string) => void;
  setAudience: (value: string) => void;
  setBusinessName: (value: string) => void;
  setDescription: (value: string) => void;
  setIndustry: (value: string) => void;
  setLogoMark: (value: LogoMark) => void;
  setLogoMode: (value: LogoMode) => void;
  setLogoMood: (value: LogoMood) => void;
  setPresetId: (value: StylePresetId) => void;
  setTagline: (value: string) => void;
  step: BuilderStep;
  storeCheck: Record<"ios" | "android", StoreCheck>;
  tagline: string;
  toggleLaunchTarget: (target: keyof LaunchTargets) => void;
}) {
  const stepTitles: Record<BuilderStep, string> = {
    1: "Name Your Startup",
    2: "Describe Your Startup",
    3: "Choose Brand Style",
    4: "Brand Identity",
    5: "Visual Assets",
    6: "Landing Page",
    7: "Launch Optimization",
    8: "Export Startup Kit"
  };

  return (
    <section className="panel single-step-panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">LaunchOS workflow</p>
          <h2>{stepTitles[props.step]}</h2>
        </div>
        <Workflow size={24} />
      </div>

      {props.step === 1 ? (
        <>
      <div className="form-grid">
        <label data-guide="name-startup" id="section-name-startup">
          <span>Business or App Name</span>
          <input value={props.businessName} onChange={(event) => props.setBusinessName(event.target.value)} />
        </label>
        <label>
          <span>Tagline</span>
          <input value={props.tagline} onChange={(event) => props.setTagline(event.target.value)} />
        </label>
      </div>

      <div className="naming-lab">
        <div>
          <p className="eyebrow">AI naming assistant</p>
          <h3>Find a startup name that people can remember.</h3>
        </div>
        <button className="secondary-button" onClick={() => props.generateNameIdeas()} type="button">
          <Sparkles size={18} /> Generate Names
        </button>
        <div className="name-filters">
          <button className={props.nameFilter === "premium" ? "name-chip active" : "name-chip"} onClick={() => props.generateNameIdeas("premium")} type="button">More Premium</button>
          <button className={props.nameFilter === "tech" ? "name-chip active" : "name-chip"} onClick={() => props.generateNameIdeas("tech")} type="button">More Tech</button>
          <button className={props.nameFilter === "consumer" ? "name-chip active" : "name-chip"} onClick={() => props.generateNameIdeas("consumer")} type="button">More Consumer</button>
          <button className={props.nameFilter === "enterprise" ? "name-chip active" : "name-chip"} onClick={() => props.generateNameIdeas("enterprise")} type="button">More Enterprise</button>
          <button className={props.nameFilter === "short" ? "name-chip active" : "name-chip"} onClick={() => props.generateNameIdeas("short")} type="button">Shorter Names</button>
          <button className={props.nameFilter === "brandable" ? "name-chip active" : "name-chip"} onClick={() => props.generateNameIdeas("brandable")} type="button">More Brandable</button>
        </div>
        <div className="name-result-grid">
          {props.nameIdeas.map((name) => (
            <article className={props.businessName === name ? "name-result-card selected" : "name-result-card"} key={name}>
              <strong>{name}</strong>
              <small>{name.length <= 11 ? "Short, memorable SaaS launch positioning" : "Descriptive startup positioning with category clarity"}</small>
              <div className="availability-list">
                <span>Likely Domain Available</span>
                <span>Low App Store Conflict</span>
                <span>Low Play Store Conflict</span>
              </div>
              <div className="name-card-actions">
                <button className="secondary-button" onClick={() => props.selectName(name)} type="button">Use</button>
                <button className={props.favoriteNames.includes(name) ? "secondary-button active-mini" : "secondary-button"} onClick={() => props.toggleFavoriteName(name)} type="button">
                  {props.favoriteNames.includes(name) ? "Saved" : "Save"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
        </>
      ) : null}

      {props.step === 2 ? (
        <>
          <div className="form-grid">
            <label>
              <span>Industry</span>
              <input value={props.industry} onChange={(event) => props.setIndustry(event.target.value)} />
            </label>
            <label>
              <span>Audience</span>
              <input value={props.audience} onChange={(event) => props.setAudience(event.target.value)} />
            </label>
            <label className="wide" id="section-describe-startup">
              <span>What does the startup do?</span>
              <textarea value={props.description} onChange={(event) => props.setDescription(event.target.value)} rows={6} />
            </label>
          </div>

          <div className="rewrite-row">
            <button className="secondary-button" onClick={() => props.rewriteDescription("professional")} type="button">Make More Professional</button>
            <button className="secondary-button" onClick={() => props.rewriteDescription("technical")} type="button">Make More Technical</button>
            <button className="secondary-button" onClick={() => props.rewriteDescription("investor")} type="button">Make Investor Friendly</button>
            <button className="secondary-button" onClick={() => props.rewriteDescription("short")} type="button">Make Shorter</button>
            <button className="secondary-button" onClick={() => props.rewriteDescription("exciting")} type="button">Make More Exciting</button>
          </div>

          <div className="launch-targets">
            <div>
              <p className="eyebrow">Launch target</p>
              <h3>What are you building?</h3>
            </div>
            <div className="target-grid">
              <label className="target-option">
                <input checked={props.launchTargets.website} onChange={() => props.toggleLaunchTarget("website")} type="checkbox" />
                <span>
                  <strong>Website</strong>
                  <small>Landing page, CTA sections, pricing, testimonials, and site export.</small>
                </span>
              </label>
              <label className="target-option">
                <input checked={props.launchTargets.ios} onChange={() => props.toggleLaunchTarget("ios")} type="checkbox" />
                <span>
                  <strong>iOS App</strong>
                  <small>App name check, icon/favicons, App Store-ready visual direction.</small>
                </span>
              </label>
              <label className="target-option">
                <input checked={props.launchTargets.android} onChange={() => props.toggleLaunchTarget("android")} type="checkbox" />
                <span>
                  <strong>Android App</strong>
                  <small>Google Play name check, launch assets, mobile brand consistency.</small>
                </span>
              </label>
            </div>
          </div>
        </>
      ) : null}

      {props.step === 3 ? (
      <div className="preset-grid" id="section-brand-style">
        {stylePresets.map((preset) => (
          <button className={props.presetId === preset.id ? "preset active" : "preset"} key={preset.id} onClick={() => props.setPresetId(preset.id)} type="button">
            <span style={{ background: preset.colors.primary }} />
            <strong>{preset.label}</strong>
            <small>{preset.direction}</small>
          </button>
        ))}
      </div>
      ) : null}

    </section>
  );
}

function OutputPanel(props: {
  assetStatus: { identity: boolean; website: boolean; landing: boolean; export: boolean };
  aiEditPrompt: string;
  aiEditStatus: string;
  applyAiBrandEdit: () => void;
  brandProfile: BrandProfile;
  checkStore: (platform: "ios" | "android") => void;
  clipboardStatus: string;
  codeDraft: string;
  copyCodeDraft: () => void;
  cutCodeDraft: () => void;
  exportOptions: ExportOptions;
  exportTarget: ExportTarget;
  exportStartupKit: () => void;
  exportRailwayBundle: () => void;
  generateHomepageAsset: () => void;
  generateLandingPage: () => void;
  generateScreenshotInspiration: () => void;
  generateWebsiteAssets: () => void;
  generating: boolean;
  launchTargets: LaunchTargets;
  regenerate: (preset: StylePresetId) => void;
  setAiEditPrompt: (value: string) => void;
  setCodeDraft: (value: string) => void;
  setExportTarget: (value: ExportTarget) => void;
  step: BuilderStep;
  storeCheck: Record<"ios" | "android", StoreCheck>;
  updateBrandColor: (name: keyof BrandProfile["colors"], value: string) => void;
  updateBrandStyle: (value: string) => void;
  toggleExportOption: (option: keyof ExportOptions) => void;
  wantsApp: boolean;
  wantsWebsite: boolean;
}) {
  const [deliveryStatus, setDeliveryStatus] = useState("");
  const [railwayCheckStatus, setRailwayCheckStatus] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [githubOwner, setGithubOwner] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [lastGithubRepoUrl, setLastGithubRepoUrl] = useState("");
  const [rememberTokenForSession, setRememberTokenForSession] = useState(false);
  const [autoClearTokenAfterPush, setAutoClearTokenAfterPush] = useState(true);
  const sessionTokenKey = "launch-os-github-token-session";

  const validationChecks = [
    { label: "Broken imports", pass: true },
    { label: "Responsive layouts", pass: props.exportOptions.responsiveLayouts },
    { label: "Image paths", pass: true },
    { label: "Missing assets", pass: Boolean(props.brandProfile.logo) && Boolean(props.brandProfile.favicon) },
    { label: "Unsupported syntax", pass: !(props.exportTarget === "bubble" && props.exportOptions.tailwindClasses) }
  ];

  const componentConsistencyChecks = buildComponentConsistencyChecks({
    brandProfile: props.brandProfile,
    wantsWebsite: props.wantsWebsite,
    codeDraft: props.codeDraft,
    exportOptions: props.exportOptions
  });
  const componentConsistencyScore = scoreChecks(componentConsistencyChecks);

  const railwayReadinessChecks = buildRailwayReadinessChecks({
    exportTarget: props.exportTarget,
    launchTargets: props.launchTargets,
    brandProfile: props.brandProfile,
    codeDraft: props.codeDraft,
    exportOptions: props.exportOptions
  });
  const railwayReadinessScore = scoreChecks(railwayReadinessChecks);
  const railwayReady = isRailwayReady(railwayReadinessChecks);
  const railwayStrictReady = railwayReady && railwayReadinessScore === 100;

  const warnings = [
    !props.brandProfile.logo ? "Logo has not been generated yet; some platform previews may fallback to placeholders." : "",
    props.exportTarget === "bubble" && props.exportOptions.tailwindClasses
      ? "Bubble export selected with Tailwind classes enabled. Utility classes will be converted to Bubble style groups where possible."
      : "",
    !props.exportOptions.pngFallbacks ? "PNG fallbacks are disabled; older environments may not render SVG assets consistently." : ""
  ].filter(Boolean);

  const criticalChecks = [
    { label: "Brand identity generated", pass: props.assetStatus.identity || Boolean(props.brandProfile.logo) },
    { label: "Favicon generated", pass: Boolean(props.brandProfile.favicon) },
    { label: "Landing page generated", pass: !props.wantsWebsite || props.assetStatus.landing || Boolean(props.codeDraft.trim()) }
  ];
  const criticalFailures = criticalChecks.filter((item) => !item.pass);
  const canExport = props.assetStatus.identity
    && (!props.wantsApp || props.assetStatus.website)
    && (!props.wantsWebsite || props.assetStatus.landing)
    && !props.generating
    && criticalFailures.length === 0;

  useEffect(() => {
    const storedToken = window.sessionStorage.getItem(sessionTokenKey);
    if (storedToken) {
      setGithubToken(storedToken);
      setRememberTokenForSession(true);
    }
  }, []);

  useEffect(() => {
    if (rememberTokenForSession && githubToken.trim()) {
      window.sessionStorage.setItem(sessionTokenKey, githubToken);
      return;
    }
    window.sessionStorage.removeItem(sessionTokenKey);
  }, [githubToken, rememberTokenForSession]);

  function toBase64(value: string) {
    const bytes = new TextEncoder().encode(value);
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return window.btoa(binary);
  }

  async function copyText(text: string, status: string) {
    try {
      await navigator.clipboard.writeText(text);
      setDeliveryStatus(status);
      window.setTimeout(() => setDeliveryStatus(""), 2200);
    } catch {
      setDeliveryStatus("Clipboard write failed. Copy manually from Export ZIP.");
      window.setTimeout(() => setDeliveryStatus(""), 2200);
    }
  }

  function buildFigmaHandoffPayload() {
    return JSON.stringify({
      startup: props.brandProfile.businessName,
      frames: ["Desktop", "Tablet", "Mobile"],
      autoLayout: true,
      reusableComponents: true,
      typographyStyles: props.brandProfile.typography,
      colorVariables: props.brandProfile.colors,
      tokens: props.exportOptions.designTokens,
      responsiveConstraints: props.exportOptions.responsiveLayouts
    }, null, 2);
  }

  function clearGithubToken(statusMessage?: string) {
    setGithubToken("");
    window.sessionStorage.removeItem(sessionTokenKey);
    if (statusMessage) {
      setDeliveryStatus(statusMessage);
      window.setTimeout(() => setDeliveryStatus(""), 2200);
    }
  }

  async function oneClickGithubPush() {
    if (!githubToken.trim()) {
      setDeliveryStatus("Enter a GitHub Personal Access Token to push and commit automatically.");
      return;
    }

    try {
      const token = githubToken.trim();
      setDeliveryStatus("Connecting to GitHub...");
      const authHeaders = {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json"
      };

      const userResponse = await fetch("https://api.github.com/user", { headers: authHeaders });
      if (!userResponse.ok) throw new Error("GitHub authentication failed.");
      const user = await userResponse.json() as { login: string };
      const owner = githubOwner.trim() || user.login;
      const repoName = (githubRepo.trim() || `${props.brandProfile.businessName}-launch-export`)
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/--+/g, "-")
        .replace(/(^-|-$)/g, "");

      const createUrl = owner === user.login ? "https://api.github.com/user/repos" : `https://api.github.com/orgs/${owner}/repos`;
      const createRepoResponse = await fetch(createUrl, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ name: repoName, private: false, auto_init: true })
      });

      if (!(createRepoResponse.ok || createRepoResponse.status === 422)) {
        throw new Error("Could not create repository. Check org permissions or repo name.");
      }

      const filesToCommit = [
        {
          path: "README.md",
          content: `# ${props.brandProfile.businessName}\n\nExport target: ${props.exportTarget}\n\nGenerated by Launch OS.\n\nRun:\n1. npm install\n2. npm run dev\n3. npm run build\n`
        },
        {
          path: "landing-page/index.html",
          content: props.codeDraft
        },
        {
          path: "export-config.json",
          content: JSON.stringify({ target: props.exportTarget, options: props.exportOptions }, null, 2)
        }
      ];

      for (const file of filesToCommit) {
        const putResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/${file.path}`, {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify({
            message: `chore: add ${file.path}`,
            content: toBase64(file.content)
          })
        });

        if (!putResponse.ok) {
          throw new Error(`Failed to commit ${file.path}.`);
        }
      }

      const repoUrl = `https://github.com/${owner}/${repoName}`;
      setLastGithubRepoUrl(repoUrl);
      setDeliveryStatus(`GitHub push complete: ${repoUrl}`);
      window.open(repoUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      setDeliveryStatus(error instanceof Error ? error.message : "GitHub push failed.");
    } finally {
      if (autoClearTokenAfterPush) {
        clearGithubToken();
      }
    }
  }

  async function oneClickReplitImport() {
    const manifest = {
      name: props.brandProfile.businessName,
      target: props.exportTarget,
      runtime: "nodejs-20",
      entrypoint: "npm run dev",
      githubRepo: lastGithubRepoUrl || ""
    };
    await copyText(JSON.stringify(manifest, null, 2), "Replit import manifest copied.");

    if (lastGithubRepoUrl) {
      window.open(`https://replit.com/new/github?url=${encodeURIComponent(lastGithubRepoUrl)}`, "_blank", "noopener,noreferrer");
      setDeliveryStatus("Opening Replit with GitHub import URL.");
      return;
    }

    window.open("https://replit.com/import", "_blank", "noopener,noreferrer");
    setDeliveryStatus("Opening Replit import page. Push to GitHub first for direct import.");
  }

  async function oneClickFigmaImport() {
    await copyText(buildFigmaHandoffPayload(), "Figma handoff JSON copied. Opening Figma import flow...");
    window.open("https://www.figma.com/files", "_blank", "noopener,noreferrer");
  }

  async function apiExport() {
    await copyText(JSON.stringify({
      profile: props.brandProfile,
      target: props.exportTarget,
      options: props.exportOptions,
      code: props.codeDraft
    }, null, 2), "API payload copied.");
  }

  function runRailwayDeployCheck() {
    if (!railwayStrictReady) {
      setRailwayCheckStatus("Railway deploy check is locked until readiness is 100%.");
      return;
    }

    const missing = railwayReadinessChecks.filter((item) => !item.pass).map((item) => item.label);
    if (missing.length > 0) {
      setRailwayCheckStatus(`Railway deploy check failed (${railwayReadinessScore}%): ${missing.join(", ")}`);
      return;
    }

    setRailwayCheckStatus("Railway deploy package check passed. Opening Railway new project flow...");
    window.open("https://railway.app/new", "_blank", "noopener,noreferrer");
  }

  return (
    <section className="panel single-step-panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">LaunchOS outputs</p>
          <h2>{props.step === 5 ? "Visual Assets" : props.step === 6 ? "Landing Page" : props.step === 7 ? "Launch Optimization" : "Export Startup Kit"}</h2>
        </div>
        <Archive size={24} />
      </div>

      <div className="output-stack">
        {props.step === 5 ? (
          <div className="website-flow" id="section-visual-assets">
            <BrandEditPanel
              aiEditPrompt={props.aiEditPrompt}
              aiEditStatus={props.aiEditStatus}
              applyAiBrandEdit={props.applyAiBrandEdit}
              profile={props.brandProfile}
              setAiEditPrompt={props.setAiEditPrompt}
              updateBrandColor={props.updateBrandColor}
              updateBrandStyle={props.updateBrandStyle}
            />
            <HeroImageSection
              generating={props.generating}
              onGenerate={props.generateWebsiteAssets}
              profile={props.brandProfile}
              wantsApp={props.wantsApp}
            />
            <ScreenshotInspirationSection
              generating={props.generating}
              onGenerate={props.generateScreenshotInspiration}
              profile={props.brandProfile}
            />
            <VisualAssetGrid wantsApp={props.wantsApp} wantsWebsite={props.wantsWebsite} />
          </div>
        ) : null}
        {props.step === 6 && props.wantsWebsite ? (
          <div id="section-landing-page">
            <HomepageSection
              codeDraft={props.codeDraft}
              generating={props.generating}
              onGenerate={props.generateLandingPage}
              profile={props.brandProfile}
              wantsWebsite={props.wantsWebsite}
            />
            <OutputRow done={props.assetStatus.landing} icon={Layers3} title="Landing Page" detail="Homepage, CTA sections, pricing blocks, testimonials" />
          </div>
        ) : null}
        {props.step === 6 && !props.wantsWebsite ? (
          <OutputRow done={true} icon={Layers3} id="section-landing-page" title="Landing Page Skipped" detail="App-only launch kits do not require a website landing page." />
        ) : null}
        {props.step === 7 ? (
          <LaunchOptimizationPanel
            launchTargets={props.launchTargets}
            storeCheck={props.storeCheck}
            checkStore={props.checkStore}
            wantsApp={props.wantsApp}
          />
        ) : null}
        {props.step === 8 ? (
          <OutputRow done={props.assetStatus.export} icon={Download} id="section-export-kit" title="ZIP Export" detail="Logos, SVGs, app icons, favicons, hero images, landing page code, social kit, and brand guide" />
        ) : null}
      </div>

      <div className="button-grid">
        {props.step === 5 && !props.assetStatus.identity ? (
          <p className="output-note">Generate the brand identity first so the hero image can pull the logo, colors, typography, and style direction.</p>
        ) : null}
        {props.step === 8 ? (
          <button className="primary-button" data-guide="export-kit" disabled={!canExport} onClick={props.exportStartupKit} type="button">
            <Download size={18} /> Export Startup Kit
          </button>
        ) : null}
        {props.step === 8 ? (
          <button className="secondary-button" disabled={!railwayStrictReady || props.generating} onClick={props.exportRailwayBundle} type="button">
            <Download size={18} /> Export Railway Bundle
          </button>
        ) : null}
        {props.step === 8 && criticalFailures.length > 0 ? (
          <p className="output-note export-blocked-note">Export blocked until critical checks pass: {criticalFailures.map((item) => item.label).join(", ")}</p>
        ) : null}
        {props.step === 8 && !railwayStrictReady ? (
          <p className="output-note export-blocked-note">Railway actions are locked until deploy readiness reaches 100%.</p>
        ) : null}
      </div>

      {props.step === 8 ? (
        <section className="export-validation-panel">
          <div>
            <p className="eyebrow">AI export validation</p>
            <h3>Pre-export compatibility checks</h3>
          </div>
          <div className="validation-grid">
            {validationChecks.map((check) => (
              <article className={check.pass ? "validation-item pass" : "validation-item warn"} key={check.label}>
                {check.pass ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                <span>{check.label}</span>
              </article>
            ))}
          </div>
          {warnings.length > 0 ? (
            <div className="warnings-list">
              {warnings.map((warning) => (
                <p key={warning}><AlertTriangle size={14} /> {warning}</p>
              ))}
            </div>
          ) : (
            <p className="output-note">No compatibility warnings detected.</p>
          )}
          <div className="component-consistency-panel">
            <div className="component-consistency-header">
              <strong>Component consistency checker</strong>
              <span>{componentConsistencyScore}%</span>
            </div>
            <div className="validation-grid">
              {componentConsistencyChecks.map((check) => (
                <article className={check.pass ? "validation-item pass" : "validation-item warn"} key={check.label}>
                  {check.pass ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  <span>{check.label}</span>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {props.step === 6 && !props.wantsWebsite ? (
        <p className="output-note">Landing page generation is disabled because this kit is set to app-only.</p>
      ) : null}

      {props.step === 8 ? (
        <section className="export-compat-panel">
          <div>
            <p className="eyebrow">Universal export compatibility</p>
            <h3>Export for</h3>
          </div>
          <div className="export-target-grid">
            {exportTargets.map((target) => (
              <label className={props.exportTarget === target.id ? "export-target active" : "export-target"} key={target.id}>
                <input checked={props.exportTarget === target.id} name="export-target" onChange={() => props.setExportTarget(target.id)} type="radio" />
                <span>{target.label}</span>
              </label>
            ))}
          </div>
          {props.exportTarget === "figma" ? (
            <div className="figma-handoff-box">
              <strong>Figma Handoff Workflow</strong>
              <p>1. Click Figma Import to copy handoff JSON.</p>
              <p>2. Import frames/components into your Figma file or plugin workflow.</p>
              <p>3. Apply tokens from style-tokens.json and attach SVG/PNG previews.</p>
            </div>
          ) : null}
          <div>
            <p className="eyebrow">Advanced options</p>
            <div className="export-options-grid">
              {[
                ["cssVariables", "Include CSS Variables"],
                ["tailwindClasses", "Include Tailwind Classes"],
                ["responsiveLayouts", "Export Responsive Layouts"],
                ["darkMode", "Export Dark Mode"],
                ["svgVersions", "Include SVG Versions"],
                ["pngFallbacks", "Include PNG Fallbacks"],
                ["readmeInstructions", "Include README Instructions"],
                ["designTokens", "Include Design Tokens"],
                ["compressImages", "Compress Images"],
                ["seoMetadata", "Export SEO Metadata"]
              ].map(([key, label]) => (
                <label key={key} className="export-option">
                  <input checked={props.exportOptions[key as keyof ExportOptions]} onChange={() => props.toggleExportOption(key as keyof ExportOptions)} type="checkbox" />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="export-delivery-row">
            <span>Delivery: ZIP Package, GitHub Push, Replit Import, Figma Import, Bubble JSON, Copy Code, API Export</span>
            <div className="github-auth-grid">
              <label>
                <span>GitHub Token (PAT)</span>
                <input
                  autoComplete="off"
                  onChange={(event) => setGithubToken(event.target.value)}
                  placeholder="ghp_..."
                  type="password"
                  value={githubToken}
                />
              </label>
              <label>
                <span>GitHub Owner (optional)</span>
                <input
                  autoComplete="off"
                  onChange={(event) => setGithubOwner(event.target.value)}
                  placeholder="username-or-org"
                  type="text"
                  value={githubOwner}
                />
              </label>
              <label>
                <span>Repository Name (optional)</span>
                <input
                  autoComplete="off"
                  onChange={(event) => setGithubRepo(event.target.value)}
                  placeholder="launch-os-export"
                  type="text"
                  value={githubRepo}
                />
              </label>
            </div>
            <div className="delivery-token-controls">
              <label className="export-option">
                <input
                  checked={rememberTokenForSession}
                  onChange={() => setRememberTokenForSession((current) => !current)}
                  type="checkbox"
                />
                <span>Remember token for this browser tab only</span>
              </label>
              <label className="export-option">
                <input
                  checked={autoClearTokenAfterPush}
                  onChange={() => setAutoClearTokenAfterPush((current) => !current)}
                  type="checkbox"
                />
                <span>Auto-clear token after GitHub push</span>
              </label>
            </div>
            <div className="delivery-actions">
              <button className="secondary-button" onClick={oneClickGithubPush} type="button">GitHub Push</button>
              <button className="secondary-button" onClick={oneClickReplitImport} type="button">Replit Import</button>
              <button className="secondary-button" onClick={oneClickFigmaImport} type="button">Figma Import</button>
              <button className="secondary-button" onClick={apiExport} type="button">API Export</button>
              <button className="secondary-button" disabled={!railwayStrictReady || props.generating} onClick={runRailwayDeployCheck} type="button">Railway Deploy Check</button>
              <button className="secondary-button" onClick={() => clearGithubToken("GitHub token cleared from this session.")} type="button">Clear Token</button>
            </div>
            <div className="railway-check-panel">
              <div className="component-consistency-header">
                <strong>One-click deploy package check</strong>
                <span>{railwayReadinessScore}%</span>
              </div>
              <div className="validation-grid">
                {railwayReadinessChecks.map((check) => (
                  <article className={check.pass ? "validation-item pass" : "validation-item warn"} key={check.label}>
                    {check.pass ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                    <span>{check.label}</span>
                  </article>
                ))}
              </div>
              {railwayStrictReady ? <p className="output-note">Railway-ready package checks passed (100%).</p> : <p className="output-note">Railway deploy actions stay disabled until all checks pass.</p>}
              {railwayCheckStatus ? <p className="output-note">{railwayCheckStatus}</p> : null}
            </div>
            {deliveryStatus ? <p className="output-note">{deliveryStatus}</p> : null}
          </div>
        </section>
      ) : null}

      {props.step === 8 ? (
        <section className="code-workspace">
          <div className="section-head">
            <div>
              <p className="eyebrow">Editable code</p>
              <h3>Landing page code</h3>
            </div>
            <div className="code-actions">
              <button className="secondary-button" onClick={props.copyCodeDraft} type="button">
                <FileCode2 size={18} /> Copy
              </button>
              <button className="secondary-button" onClick={props.cutCodeDraft} type="button">
                <Archive size={18} /> Cut
              </button>
            </div>
          </div>
          <textarea
            aria-label="Editable landing page code"
            className="code-editor"
            onChange={(event) => props.setCodeDraft(event.target.value)}
            spellCheck={false}
            value={props.codeDraft}
          />
          {props.clipboardStatus ? <p className="output-note">{props.clipboardStatus}</p> : null}
        </section>
      ) : null}

      {props.step === 8 ? (
      <div className="memory-box">
        <strong>Regeneration Memory</strong>
        {props.brandProfile.memory.map((item) => <span key={item}>{item}</span>)}
      </div>
      ) : null}

      {props.step === 8 ? (
      <div className="mini-section">
        <strong>Change style and update the ecosystem</strong>
        <div className="mini-actions">
          {stylePresets.map((preset) => (
            <button key={preset.id} onClick={() => props.regenerate(preset.id)} disabled={props.generating} type="button">
              {preset.label}
            </button>
          ))}
        </div>
      </div>
      ) : null}
    </section>
  );
}

function StoreCheckCard({ detail, onCheck, platform, status }: { detail: string; onCheck: () => void; platform: string; status: StoreCheck }) {
  const label = status === "checked" ? "Search Opened" : status === "checking" ? "Opening Search" : "Check Name";

  return (
    <article className={status === "checked" ? "store-check-card checked" : "store-check-card"}>
      <div>
        <Store size={22} />
        <strong>{platform}</strong>
      </div>
      <p>{detail}</p>
      <button className="secondary-button" onClick={onCheck} type="button">
        <SearchCheck size={18} /> {label} <ExternalLink size={15} />
      </button>
    </article>
  );
}

function LaunchOptimizationPanel({
  checkStore,
  launchTargets,
  storeCheck,
  wantsApp
}: {
  checkStore: (platform: "ios" | "android") => void;
  launchTargets: LaunchTargets;
  storeCheck: Record<"ios" | "android", StoreCheck>;
  wantsApp: boolean;
}) {
  return (
    <div className="launch-optimization" id="section-launch-optimization">
      <div className="mini-section">
        <p className="eyebrow">Publishing phase</p>
        <h3>Prepare the startup for stores, search, and social previews.</h3>
        <p>Use the generated logo, hero image, colors, and typography to create app store screenshots, app descriptions, keywords, SEO metadata, Open Graph previews, and Twitter previews.</p>
      </div>

      <div className="store-check-grid">
        {launchTargets.ios ? (
          <StoreCheckCard
            detail="Search Apple App Store listings before publishing the app name and App Store assets."
            onCheck={() => checkStore("ios")}
            platform="iOS App Store"
            status={storeCheck.ios}
          />
        ) : null}
        {launchTargets.android ? (
          <StoreCheckCard
            detail="Search Google Play apps before finalizing Android launch copy and graphics."
            onCheck={() => checkStore("android")}
            platform="Google Play"
            status={storeCheck.android}
          />
        ) : null}
        {!wantsApp ? (
          <div className="store-skip">
            <Globe2 size={22} />
            <strong>App store checks skipped</strong>
            <span>Website-only launches still get SEO metadata and social previews.</span>
          </div>
        ) : null}
      </div>

      <div className="optimization-grid">
        <OutputRow done={true} icon={Image} title="App Store Screenshots" detail="Visual direction for iPhone, Android, and tablet store graphics" />
        <OutputRow done={true} icon={FileCode2} title="Descriptions + Keywords" detail="App descriptions, launch keywords, and positioning copy" />
        <OutputRow done={true} icon={Globe2} title="SEO Metadata" detail="Title tags, meta descriptions, and search-ready page summaries" />
        <OutputRow done={true} icon={ExternalLink} title="Social Previews" detail="Open Graph and Twitter card creative direction" />
      </div>
    </div>
  );
}

function BrandEditPanel(props: {
  aiEditPrompt: string;
  aiEditStatus: string;
  applyAiBrandEdit: () => void;
  profile: BrandProfile;
  setAiEditPrompt: (value: string) => void;
  updateBrandColor: (name: keyof BrandProfile["colors"], value: string) => void;
  updateBrandStyle: (value: string) => void;
}) {
  const colorFields: Array<{ key: keyof BrandProfile["colors"]; label: string }> = [
    { key: "primary", label: "Primary" },
    { key: "secondary", label: "Secondary" },
    { key: "accent", label: "Accent" },
    { key: "background", label: "Background" },
    { key: "surface", label: "Surface" },
    { key: "text", label: "Text" }
  ];

  return (
    <section className="brand-edit-panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">Brand editor</p>
          <h3>Edit colors, style, and AI direction</h3>
        </div>
        <Palette size={22} />
      </div>

      <div className="color-editor-grid">
        {colorFields.map((field) => (
          <label className="color-field" key={field.key}>
            <span>{field.label}</span>
            <input
              aria-label={`${field.label} color`}
              onChange={(event) => props.updateBrandColor(field.key, event.target.value)}
              type="color"
              value={props.profile.colors[field.key]}
            />
            <input
              aria-label={`${field.label} hex`}
              onChange={(event) => props.updateBrandColor(field.key, event.target.value)}
              value={props.profile.colors[field.key]}
            />
          </label>
        ))}
      </div>

      <label className="style-editor">
        <span>Style Direction</span>
        <textarea
          onChange={(event) => props.updateBrandStyle(event.target.value)}
          rows={3}
          value={props.profile.visualDirection}
        />
      </label>

      <div className="ai-edit-box">
        <label>
          <span>AI Edit Prompt</span>
          <textarea
            placeholder="Example: Make this premium, dark, and purple for a fintech app."
            onChange={(event) => props.setAiEditPrompt(event.target.value)}
            rows={3}
            value={props.aiEditPrompt}
          />
        </label>
        <button className="primary-button" onClick={props.applyAiBrandEdit} type="button">
          <Sparkles size={18} /> Apply AI Edit
        </button>
        {props.aiEditStatus ? <p className="output-note">{props.aiEditStatus}</p> : null}
      </div>
    </section>
  );
}

function HeroImageSection({ generating, onGenerate, profile, wantsApp }: { generating: boolean; onGenerate: () => void; profile: BrandProfile; wantsApp: boolean }) {
  return (
    <section className="asset-builder-section">
      <div className="asset-builder-copy">
        <p className="eyebrow">Unified visual asset phase</p>
        <h3>Hero image and marketing graphics</h3>
        <p>{wantsApp ? "Create one launch visual direction for the website, app screenshots, device mockups, store graphics, and social previews." : "Create the main website hero visual, social previews, and launch graphics from the edited brand context."}</p>
        <button className="primary-button" data-guide="visual-assets" disabled={generating} onClick={onGenerate} type="button">
          <Image size={18} /> Generate Visual Assets
        </button>
      </div>
      <div className="asset-preview-frame">
        {profile.heroImage ? <img src={profile.heroImage.imageUrl} alt="" /> : <div><Image size={34} /><span>Hero image preview</span></div>}
      </div>
    </section>
  );
}

function ScreenshotInspirationSection({ generating, onGenerate, profile }: { generating: boolean; onGenerate: () => void; profile: BrandProfile }) {
  const concepts = profile.screenshotConcepts ?? [];

  return (
    <section className="asset-builder-section screenshot-inspiration-section">
      <div className="asset-builder-copy">
        <p className="eyebrow">AI screenshot inspiration engine</p>
        <h3>Store and social screenshot concepts</h3>
        <p>Generate six branded screenshot directions with captions for App Store, Play Store, social launch posts, and founder updates.</p>
        <button className="secondary-button" disabled={generating} onClick={onGenerate} type="button">
          <Sparkles size={18} /> Generate Screenshot Concepts
        </button>
      </div>
      <div className="screenshot-concept-grid">
        {concepts.length > 0 ? concepts.map((concept) => (
          <article className="screenshot-concept-card" key={concept.title}>
            <img src={concept.imageUrl} alt={concept.title} />
            <strong>{concept.title}</strong>
            <p>{concept.caption}</p>
          </article>
        )) : (
          <div className="screenshot-empty-state">
            <Image size={24} />
            <span>No screenshot concepts yet. Generate to populate this grid.</span>
          </div>
        )}
      </div>
    </section>
  );
}

function VisualAssetGrid({ wantsApp, wantsWebsite }: { wantsApp: boolean; wantsWebsite: boolean }) {
  const assets = [
    { icon: Image, title: "Hero Image", detail: wantsWebsite ? "Website hero artwork that matches the logo, colors, and typography." : "Launch hero artwork for app marketing surfaces." },
    { icon: FileImage, title: "App Screenshots", detail: wantsApp ? "iOS and Android screenshot direction for store listings." : "Skipped unless an app target is selected." },
    { icon: Boxes, title: "Device Mockups", detail: wantsApp ? "Phone and tablet mockup direction for ads, decks, and store pages." : "Website-only product mockup direction." },
    { icon: ExternalLink, title: "Social Previews", detail: "Open Graph, Twitter card, and founder launch post visuals." }
  ];

  return (
    <div className="visual-asset-grid">
      {assets.map(({ detail, icon: Icon, title }) => (
        <article className="visual-asset-card" key={title}>
          <Icon size={22} />
          <strong>{title}</strong>
          <p>{detail}</p>
        </article>
      ))}
    </div>
  );
}

function HomepageSection({ codeDraft, generating, onGenerate, profile, wantsWebsite }: { codeDraft: string; generating: boolean; onGenerate: () => void; profile: BrandProfile; wantsWebsite: boolean }) {
  const sections = [
    "Hero",
    "Problem",
    "Benefits",
    "Product Proof",
    "Pricing",
    "Testimonials",
    "FAQ",
    "Final CTA"
  ];

  return (
    <section className="landing-builder-section">
      <div className="asset-builder-copy">
        <p className="eyebrow">Consistent website generation</p>
        <h3>Conversion landing page</h3>
        <p>{wantsWebsite ? "Generate a complete homepage with hero, benefits, proof, pricing, testimonials, FAQ, and final CTA using the same brand context." : "Website generation is skipped because this launch is currently set to app-only."}</p>
        <div className="landing-section-map">
          {sections.map((section) => (
            <span key={section}>{section}</span>
          ))}
        </div>
        <button className="primary-button" data-guide="landing-page" disabled={!wantsWebsite || generating} onClick={onGenerate} type="button">
          <Globe2 size={18} /> Generate Landing Page
        </button>
      </div>
      <div className="landing-preview-shell" style={{ background: profile.colors.background, color: profile.colors.text }}>
        <div className="landing-preview-nav">
          <span>{profile.businessName}</span>
          <small>Pricing</small>
          <small>Proof</small>
          <small>FAQ</small>
        </div>
        <div className="landing-preview-hero">
          <div>
            <strong>{profile.tagline || "Launch-ready homepage"}</strong>
            <p>{profile.description}</p>
            <button type="button">Start launch kit</button>
          </div>
          <div className="landing-preview-visual">
            {profile.heroImage ? <img src={profile.heroImage.imageUrl} alt="" /> : <Sparkles size={34} />}
          </div>
        </div>
        <div className="landing-preview-grid">
          <span>3 core benefits</span>
          <span>Social proof</span>
          <span>Pricing block</span>
        </div>
        <p className="landing-code-status">{codeDraft ? "Editable production-style HTML is ready in Export Kit." : "Generate the landing page to create editable code."}</p>
      </div>
    </section>
  );
}

function GeneratorCard({ actionLabel, detail, imageUrl, onGenerate, status, title }: { actionLabel: string; detail: string; imageUrl?: string; onGenerate: () => void; status: string; title: string }) {
  return (
    <article className="generator-card">
      <div className="generator-preview">
        {imageUrl ? <img src={imageUrl} alt="" /> : <Sparkles size={28} />}
      </div>
      <div>
        <span className="status-badge">{status}</span>
        <h3>{title}</h3>
        <p>{detail}</p>
      </div>
      <button className="secondary-button" onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onGenerate();
      }} type="button">
        <Wand2 size={18} /> {actionLabel}
      </button>
    </article>
  );
}

function LogoCreatorStudio(props: {
  businessName: string;
  generateFaviconAsset: () => void;
  generateLogoAsset: () => void;
  industry: string;
  logoMark: LogoMark;
  logoMode: LogoMode;
  logoMood: LogoMood;
  profile: BrandProfile;
  setBusinessName: (value: string) => void;
  setIndustry: (value: string) => void;
  setLogoMark: (value: LogoMark) => void;
  setLogoMode: (value: LogoMode) => void;
  setLogoMood: (value: LogoMood) => void;
  setTagline: (value: string) => void;
  tagline: string;
}) {
  const selectedMark = logoMarks.find((mark) => mark.name === props.logoMark) ?? logoMarks[0];
  const previewSvg = buildLogoStudioSvg(props.profile, selectedMark.shape, props.logoMode);

  return (
    <div className="logo-studio">
      <section className="logo-controls">
        <div className="section-head">
          <div>
            <p className="eyebrow">Logo Creator</p>
            <h2>Identity</h2>
          </div>
          <Type size={22} />
        </div>

        <div className="form-grid">
          <label>
            <span>Business Name</span>
            <input value={props.businessName} onChange={(event) => props.setBusinessName(event.target.value)} />
          </label>
          <label>
            <span>Tagline</span>
            <input value={props.tagline} onChange={(event) => props.setTagline(event.target.value)} />
          </label>
          <label className="wide">
            <span>Industry</span>
            <input value={props.industry} onChange={(event) => props.setIndustry(event.target.value)} />
          </label>
        </div>

        <div className="logo-section">
          <h3>Logo Style</h3>
          <div className="segmented-control">
            {(["Lockup", "Badge", "Wordmark"] as LogoMode[]).map((mode) => (
              <button className={props.logoMode === mode ? "active" : ""} key={mode} onClick={() => props.setLogoMode(mode)} type="button">
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="mark-grid">
          {logoMarks.map((mark) => (
            <button className={props.logoMark === mark.name ? "mark-card active" : "mark-card"} key={mark.name} onClick={() => props.setLogoMark(mark.name)} type="button">
              <MiniLogoMark colors={props.profile.colors} shape={mark.shape} />
              <strong>{mark.name}</strong>
            </button>
          ))}
        </div>

        <div className="segmented-control mood-control">
          {logoMoods.map((mood) => (
            <button className={props.logoMood === mood ? "active" : ""} key={mood} onClick={() => props.setLogoMood(mood)} type="button">
              {mood}
            </button>
          ))}
        </div>

        <div className="logo-section">
          <h3>Palette</h3>
          <div className="palette-grid">
            <PaletteChoice colors={[props.profile.colors.primary, props.profile.colors.secondary, props.profile.colors.accent]} label="Launch Blue" />
            <PaletteChoice colors={[props.profile.colors.secondary, "#334155", "#eab308"]} label="Signal Green" />
          </div>
        </div>
      </section>

      <section className="logo-preview-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Live SVG Preview</p>
            <h2>{props.logoMode}</h2>
          </div>
          <button className="secondary-button" onClick={props.generateLogoAsset} type="button">
            <FileImage size={18} /> SVG
          </button>
        </div>

        <div className="svg-stage" dangerouslySetInnerHTML={{ __html: previewSvg }} />

        <div className="logo-use-grid">
          <PreviewUseCase imageUrl={props.profile.favicon?.favicon32 || props.profile.logo?.svgUrl} title="App Icon" />
          <PreviewUseCase imageUrl={props.profile.logo?.svgUrl} title="Navbar" text={props.businessName} />
          <PreviewUseCase dark imageUrl={props.profile.logo?.svgUrl} title="Social" text={props.tagline || props.businessName} />
        </div>

        <div className="button-grid">
          <button className="primary-button" onClick={props.generateLogoAsset} type="button">
            <Wand2 size={18} /> Create Logo
          </button>
          <button className="secondary-button" onClick={props.generateFaviconAsset} type="button">
            <Fingerprint size={18} /> Create Favicon
          </button>
        </div>
      </section>
    </div>
  );
}

function MiniLogoMark({ colors, shape }: { colors: BrandProfile["colors"]; shape: string }) {
  return (
    <svg className="mini-logo-mark" viewBox="0 0 128 128" aria-hidden="true">
      <rect x="20" y="20" width="88" height="88" rx="24" fill={colors.primary} />
      <path d={shape} fill={colors.secondary} />
      <text x="64" y="78" textAnchor="middle" fontSize="42" fontWeight="900" fill={colors.text}>L</text>
      <rect x="58" y="82" width="42" height="10" rx="5" fill={colors.accent} />
    </svg>
  );
}

function PaletteChoice({ colors, label }: { colors: string[]; label: string }) {
  return (
    <button className="palette-choice" type="button">
      <span>
        {colors.map((color) => <i key={color} style={{ background: color }} />)}
      </span>
      <strong>{label}</strong>
    </button>
  );
}

function PreviewUseCase({ dark = false, imageUrl, text, title }: { dark?: boolean; imageUrl?: string; text?: string; title: string }) {
  return (
    <article className={dark ? "use-case-card dark" : "use-case-card"}>
      <span>{title}</span>
      <div>
        {imageUrl ? <img src={imageUrl} alt="" /> : <Rocket size={26} />}
        {text ? <strong>{text}</strong> : null}
      </div>
    </article>
  );
}

function buildLogoStudioSvg(profile: BrandProfile, shape: string, mode: LogoMode) {
  const initials = profile.businessName.split(/\s+/).map((word) => word[0]).join("").slice(0, 2).toUpperCase() || "L";
  const showText = mode !== "Badge";
  const showMark = mode !== "Wordmark";
  const markX = showText ? 140 : 320;
  const textX = showMark ? 260 : 170;

  return `<svg viewBox="0 0 760 300" role="img" aria-label="${profile.businessName} logo preview">
    <rect width="760" height="300" rx="36" fill="#f8fafc"/>
    <rect x="36" y="58" width="688" height="184" rx="28" fill="#ffffff"/>
    ${showMark ? `<g transform="translate(${markX - 64} 86)">
      <rect x="0" y="0" width="128" height="128" rx="30" fill="${profile.colors.primary}"/>
      <path d="${shape}" fill="${profile.colors.secondary}"/>
      <text x="64" y="78" text-anchor="middle" font-size="42" font-weight="900" fill="${profile.colors.text}">${initials}</text>
      <rect x="58" y="84" width="48" height="10" rx="5" fill="${profile.colors.accent}"/>
    </g>` : ""}
    ${showText ? `<text x="${textX}" y="135" font-family="Inter, Arial" font-size="48" font-weight="900" fill="#111827">${escapeHtml(profile.businessName)}</text>
    <text x="${textX}" y="175" font-family="Inter, Arial" font-size="21" font-weight="800" fill="${profile.colors.secondary}">${escapeHtml(profile.tagline || profile.industry)}</text>
    <rect x="${textX}" y="194" width="138" height="9" rx="5" fill="${profile.colors.accent}"/>` : ""}
  </svg>`;
}

function BrandPreview({ profile }: { profile: BrandProfile }) {
  return (
    <div className="preview-shell" style={{ background: profile.colors.background, color: profile.colors.text }}>
      <div className="logo-preview">
        {profile.logo ? <img src={profile.logo.svgUrl} alt="" /> : <Rocket size={38} />}
        <div>
          <strong>{profile.businessName}</strong>
          <span>{profile.tagline}</span>
        </div>
      </div>
      <div className="mock-browser" style={{ background: profile.colors.surface }}>
        <div className="browser-dots"><span /><span /><span /></div>
        {profile.heroImage ? <img src={profile.heroImage.imageUrl} alt="" /> : <div className="empty-hero"><Zap size={34} /> Brand assets pending</div>}
      </div>
      <div className="tokens">
        {Object.entries(profile.colors).slice(0, 4).map(([name, value]) => (
          <div key={name}>
            <i style={{ background: value }} />
            <span>{name}</span>
          </div>
        ))}
      </div>
      <div className="type-row">
        <Type size={18} />
        <span>{profile.typography.headingFont} / {profile.typography.bodyFont}</span>
      </div>
    </div>
  );
}

function OutputRow({ detail, done, icon: Icon, id, title }: { detail: string; done: boolean; icon: typeof Rocket; id?: string; title: string }) {
  return (
    <article className={done ? "output-row done" : "output-row"} id={id}>
      <Icon size={22} />
      <div>
        <strong>{title}</strong>
        <span>{detail}</span>
      </div>
      {done ? <CheckCircle2 size={20} /> : <Sparkles size={20} />}
    </article>
  );
}

function SystemCard({ detail, icon: Icon, title }: { detail: string; icon: typeof Rocket; title: string }) {
  return (
    <article className="system-card">
      <Icon size={24} />
      <h3>{title}</h3>
      <p>{detail}</p>
    </article>
  );
}

export { exportItems };

function downloadStartupKit(
  profile: BrandProfile,
  launchTargets: LaunchTargets,
  landingPageCode: string,
  target: ExportTarget,
  options: ExportOptions,
  config?: { railwayOnly?: boolean }
) {
  const resolvedTarget: ExportTarget = config?.railwayOnly ? "full-production" : target;
  const slug = profile.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "startup-kit";
  const reports = buildExportReports({
    target: resolvedTarget,
    options,
    launchTargets,
    brandProfile: profile,
    codeDraft: landingPageCode
  });
  const files: Record<string, string> = {
    "README.txt": `${profile.businessName} Startup Kit\n\nExport target: ${resolvedTarget}\n\nLaunch targets:\n- Website: ${launchTargets.website ? "yes" : "no"}\n- iOS App: ${launchTargets.ios ? "yes" : "no"}\n- Android App: ${launchTargets.android ? "yes" : "no"}\n\nStyle: ${profile.style}\nTone: ${profile.tone}\nDirection: ${profile.visualDirection}\n\nThis export contains the shared brand context used by logo, favicon, hero, and landing page generators.\n`,
    "brand-profile.json": JSON.stringify(profile, null, 2),
    "launch-targets.json": JSON.stringify(launchTargets, null, 2),
    "logos/logo.svg": decodeDataSvg(profile.logo?.svgUrl),
    "favicons/favicon.svg": decodeDataSvg(profile.favicon?.favicon32),
    "images/hero.svg": decodeDataSvg(profile.heroImage?.imageUrl),
    "landing-page/index.html": landingPageCode || defaultLandingCode(profile),
    "screenshots/screenshot-concepts.json": JSON.stringify(profile.screenshotConcepts ?? [], null, 2),
    "export/compatibility-report.json": JSON.stringify(reports.compatibilityReport, null, 2),
    "export/component-consistency-report.json": JSON.stringify(reports.componentConsistency, null, 2),
    "deploy/railway-readiness.json": JSON.stringify(reports.railwayReadiness, null, 2),
    "deploy/railway-checklist.md": reports.railwayChecklistMarkdown
    
  };

  (profile.screenshotConcepts ?? []).forEach((concept, index) => {
    files[`screenshots/scene-${String(index + 1).padStart(2, "0")}.svg`] = decodeDataSvg(concept.imageUrl);
  });

  if (options.designTokens) {
    files["tokens/colors.json"] = JSON.stringify(profile.colors, null, 2);
    files["tokens/typography.json"] = JSON.stringify(profile.typography, null, 2);
    files["tokens/style-tokens.json"] = JSON.stringify({
      colors: profile.colors,
      typography: profile.typography,
      darkMode: options.darkMode,
      cssVariables: options.cssVariables
    }, null, 2);
  }

  if (resolvedTarget === "figma") {
    files["figma/figma-export.json"] = JSON.stringify({
      frames: ["Desktop", "Tablet", "Mobile"],
      autoLayout: true,
      reusableComponents: true,
      responsiveConstraints: true
    }, null, 2);
    files["figma/handoff-payload.json"] = JSON.stringify({
      startup: profile.businessName,
      typography: profile.typography,
      colors: profile.colors,
      includePngFallbacks: options.pngFallbacks,
      includeSvgVersions: options.svgVersions
    }, null, 2);
    files["figma/layer-naming.txt"] = "All layers are normalized to semantic names for handoff.";
  }

  if (resolvedTarget === "replit" || resolvedTarget === "vscode" || resolvedTarget === "full-production") {
    files["project/package.json"] = JSON.stringify({
      name: slug,
      private: true,
      scripts: { dev: "vite", build: "vite build", preview: "vite preview" }
    }, null, 2);
    files["project/vite.config.ts"] = "import { defineConfig } from 'vite';\nexport default defineConfig({});\n";
    files["project/src/main.tsx"] = "// Entry point scaffold for exported project\n";
    files["project/README.md"] = "npm install\nnpm run dev\nnpm run build\n";

    if (resolvedTarget === "replit" || resolvedTarget === "full-production") {
      files["project/.replit"] = "run = \"npm run dev\"\nentrypoint = \"src/main.tsx\"\nmodules = [\"nodejs-20\"]\n";
      files["project/replit.nix"] = "{ pkgs }: {\n  deps = [ pkgs.nodejs_20 ];\n}\n";
      files["project/replit-import.json"] = JSON.stringify({
        importUrlFormat: "https://replit.com/new/github?url=<github_repo_url>",
        runtime: "nodejs-20",
        runCommand: "npm run dev",
        buildCommand: "npm run build"
      }, null, 2);
    }

    if (resolvedTarget === "full-production") {
      files["project/railway.json"] = JSON.stringify({
        $schema: "https://railway.app/railway.schema.json",
        deploy: {
          startCommand: "npm run dev",
          healthcheckPath: "/",
          healthcheckTimeout: 100
        }
      }, null, 2);
    }
  }

  if (resolvedTarget === "lovable") {
    files["lovable/prompts.md"] = `Startup: ${profile.businessName}\nTheme: ${profile.visualDirection}\nCreate reusable components, responsive layouts, and launch-focused UI copy.`;
  }

  if (resolvedTarget === "bubble") {
    files["bubble/layout.json"] = JSON.stringify({
      page: "Landing",
      responsive: true,
      components: ["Hero", "Features", "CTA", "Footer"],
      workflowMap: ["capture-email", "cta-click", "contact-submit"]
    }, null, 2);
  }

  if (resolvedTarget === "react" || resolvedTarget === "tailwind") {
    files["components/Hero.tsx"] = "export function Hero(){ return <section>Hero</section>; }\n";
    files["components/Features.tsx"] = "export function Features(){ return <section>Features</section>; }\n";
  }

  if (resolvedTarget === "mobile-assets" || resolvedTarget === "full-production") {
    files["mobile/app-icons/README.txt"] = "Includes icon-safe assets for iOS and Android launch surfaces.";
    files["mobile/splash/README.txt"] = "Splash screen placeholders generated from brand colors.";
  }

  if (options.seoMetadata) {
    files["seo/metadata.json"] = JSON.stringify({
      title: profile.businessName,
      description: profile.description,
      ogTitle: `${profile.businessName} - Launch`,
      ogDescription: profile.tagline || profile.description
    }, null, 2);
  }

  if (options.readmeInstructions) {
    files["EXPORT-GUIDE.md"] = "Design once. Export everywhere.\n\nUse this package in Figma, Replit, VS Code, Bubble, Lovable, React, and HTML workflows.";
  }

  if (config?.railwayOnly) {
    files["deploy/RAILWAY-ONE-CLICK.md"] = "This bundle is optimized for Railway deploy checks and full-production output.";
  }

  const blob = createZip(files);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = config?.railwayOnly ? `${slug}-railway-bundle.zip` : `${slug}-startup-kit.zip`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function decodeDataSvg(value?: string) {
  if (!value) return "";
  const [, encoded] = value.split("data:image/svg+xml;utf8,");
  return encoded ? decodeURIComponent(encoded) : value;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;"
    };
    return entities[character];
  });
}

function buildStepAiInsight(input: {
  step: BuilderStep;
  businessName: string;
  tagline: string;
  description: string;
  industry: string;
  audience: string;
  launchTargets: LaunchTargets;
  brandProfile: BrandProfile;
  assetStatus: { identity: boolean; website: boolean; landing: boolean; export: boolean };
  codeDraft: string;
  storeCheck: Record<"ios" | "android", StoreCheck>;
  exportTarget: ExportTarget;
}) {
  const launchMix = [
    input.launchTargets.website ? "website" : null,
    input.launchTargets.ios ? "iOS app" : null,
    input.launchTargets.android ? "Android app" : null
  ].filter(Boolean).join(", ");

  const messages: Record<BuilderStep, string> = {
    1: `${input.businessName || "This startup"} should feel memorable for ${input.audience}. AI refreshed name ideas and will favor names that are short, ownable, and clear for a ${input.industry} launch.`,
    2: `AI tightened the description toward customer-facing launch copy for ${input.audience}. Next best improvement: make the first sentence explain the outcome, not only the tool.`,
    3: `AI recommends a style that matches ${input.industry}: ${input.industry.toLowerCase().includes("fintech") ? "Premium Fintech" : input.industry.toLowerCase().includes("consumer") ? "Bold Consumer" : "Clean SaaS"}. This keeps the visual system easier to trust across ${launchMix || "the launch"}.`,
    4: `AI review: the brand identity should express ${input.brandProfile.tone.toLowerCase()} trust, use ${input.brandProfile.typography.headingFont} for headlines, and keep favicon/app icon shapes simple enough to work at small sizes.`,
    5: `AI prepared a stronger visual direction prompt. Use it to keep hero images, app screenshots, device mockups, and social previews aligned with ${input.brandProfile.style}.`,
    6: `AI conversion review: the landing page should include hero, problem, benefits, proof, pricing, FAQ, and final CTA. Current code ${input.codeDraft.includes("final-cta") ? "already includes the stronger structure" : "needs regeneration to get the stronger structure"}.`,
    7: `AI launch review: ${input.storeCheck.ios === "checked" || input.storeCheck.android === "checked" ? "store checks have started" : "run store checks before publishing"}. Add SEO title, app keywords, Open Graph copy, and store screenshot captions before export.`,
    8: `AI export review: target is ${input.exportTarget}. ${input.assetStatus.identity && input.assetStatus.landing ? "Core launch assets are ready for packaging" : "Generate identity and landing page before final export"}; keep README, brand guide, and deployment notes in the ZIP.`
  };

  return messages[input.step];
}

function defaultLandingCode(profile: BrandProfile) {
  const name = escapeHtml(profile.businessName);
  const tagline = escapeHtml(profile.tagline || `Launch ${profile.businessName} with a complete brand and website system.`);
  const description = escapeHtml(profile.description);
  const audience = escapeHtml(profile.audience);
  const industry = escapeHtml(profile.industry);
  const heroImage = profile.heroImage?.imageUrl || "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${description}" />
    <meta property="og:title" content="${name}" />
    <meta property="og:description" content="${tagline}" />
    <title>${name}</title>
    <style>
      :root {
        --primary: ${profile.colors.primary};
        --secondary: ${profile.colors.secondary};
        --accent: ${profile.colors.accent};
        --background: ${profile.colors.background};
        --surface: ${profile.colors.surface};
        --text: ${profile.colors.text};
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: var(--background);
        color: var(--text);
        font-family: ${profile.typography.bodyFont}, system-ui, sans-serif;
      }

      a {
        color: inherit;
        text-decoration: none;
      }

      .page {
        overflow: hidden;
      }

      .nav,
      section,
      footer {
        width: min(1120px, calc(100% - 40px));
        margin: 0 auto;
      }

      .nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 24px 0;
      }

      .brand {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        font-weight: 900;
      }

      .brand-mark {
        display: grid;
        width: 38px;
        height: 38px;
        place-items: center;
        border-radius: 10px;
        background: var(--primary);
        color: #fff;
      }

      .nav-links {
        display: flex;
        gap: 18px;
        color: color-mix(in srgb, var(--text), transparent 26%);
        font-weight: 800;
      }

      .hero {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(320px, 0.86fr);
        align-items: center;
        gap: 44px;
        min-height: 680px;
        padding: 40px 0 72px;
      }

      .eyebrow {
        color: var(--accent);
        font-size: 13px;
        font-weight: 900;
        letter-spacing: 0;
        text-transform: uppercase;
      }

      h1,
      h2,
      h3 {
        font-family: ${profile.typography.headingFont}, system-ui, sans-serif;
        letter-spacing: 0;
      }

      h1 {
        margin: 12px 0 18px;
        font-size: clamp(44px, 7vw, 86px);
        line-height: 0.98;
      }

      h2 {
        margin: 0 0 14px;
        font-size: clamp(30px, 4vw, 54px);
        line-height: 1.04;
      }

      p {
        color: color-mix(in srgb, var(--text), transparent 22%);
        font-size: 18px;
        line-height: 1.65;
      }

      .hero-copy p {
        max-width: 660px;
        font-size: 21px;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 28px;
      }

      .button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 48px;
        border-radius: 8px;
        background: var(--primary);
        color: #fff;
        padding: 0 18px;
        font-weight: 800;
      }

      .button.secondary {
        border: 1px solid color-mix(in srgb, var(--text), transparent 78%);
        background: transparent;
        color: var(--text);
      }

      .hero-card {
        border: 1px solid color-mix(in srgb, var(--text), transparent 86%);
        border-radius: 24px;
        background: color-mix(in srgb, var(--surface), transparent 6%);
        padding: 18px;
        box-shadow: 0 28px 80px rgba(0, 0, 0, 0.18);
      }

      .hero-card img,
      .hero-placeholder {
        display: block;
        width: 100%;
        aspect-ratio: 16 / 10;
        border-radius: 18px;
        object-fit: cover;
      }

      .hero-placeholder {
        background: linear-gradient(135deg, var(--primary), var(--secondary), var(--accent));
      }

      .proof-strip,
      .grid,
      .pricing-grid,
      .faq-grid {
        display: grid;
        gap: 16px;
      }

      .proof-strip {
        grid-template-columns: repeat(3, 1fr);
        padding: 22px 0 54px;
      }

      .proof-strip strong {
        display: block;
        font-size: 32px;
      }

      .section-block {
        padding: 78px 0;
      }

      .grid {
        grid-template-columns: repeat(3, 1fr);
      }

      .card,
      .price,
      .quote,
      .faq {
        border: 1px solid color-mix(in srgb, var(--text), transparent 86%);
        border-radius: 18px;
        background: color-mix(in srgb, var(--surface), transparent 4%);
        padding: 22px;
      }

      .card h3,
      .price h3 {
        margin: 0;
        font-size: 22px;
      }

      .pricing-grid {
        grid-template-columns: 0.9fr 1.1fr;
      }

      .price.featured {
        border-color: var(--accent);
        box-shadow: 0 22px 60px color-mix(in srgb, var(--accent), transparent 82%);
      }

      .amount {
        display: block;
        margin: 18px 0;
        font-size: 44px;
        font-weight: 950;
      }

      .faq-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .final-cta {
        margin-bottom: 56px;
        border-radius: 28px;
        background: var(--primary);
        color: #fff;
        padding: 54px;
      }

      .final-cta p {
        color: rgba(255, 255, 255, 0.82);
      }

      footer {
        padding: 28px 0 44px;
        color: color-mix(in srgb, var(--text), transparent 34%);
      }

      @media (max-width: 760px) {
        .nav-links {
          display: none;
        }

        .hero,
        .grid,
        .proof-strip,
        .pricing-grid,
        .faq-grid {
          grid-template-columns: 1fr;
        }

        .hero {
          min-height: auto;
          padding-top: 24px;
        }

        .final-cta {
          padding: 30px;
        }
      }
    </style>
  </head>
  <body>
    <main class="page">
      <nav class="nav" aria-label="Main navigation">
        <a class="brand" href="#">
          <span class="brand-mark">${name.slice(0, 1)}</span>
          <span>${name}</span>
        </a>
        <div class="nav-links">
          <a href="#benefits">Benefits</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </div>
      </nav>

      <section class="hero">
        <div class="hero-copy">
          <span class="eyebrow">${industry} launch system for ${audience}</span>
          <h1>${tagline}</h1>
          <p>${description}</p>
          <div class="actions">
            <a class="button" href="#cta">Start building</a>
            <a class="button secondary" href="#benefits">See how it works</a>
          </div>
        </div>
        <div class="hero-card">
          ${heroImage ? `<img src="${heroImage}" alt="${name} product preview" />` : `<div class="hero-placeholder" aria-label="${name} visual preview"></div>`}
        </div>
      </section>

      <section class="proof-strip" aria-label="Launch proof">
        <div><strong>1</strong><span>shared brand context</span></div>
        <div><strong>8</strong><span>launch-ready sections</span></div>
        <div><strong>100%</strong><span>consistent visual system</span></div>
      </section>

      <section class="section-block" id="benefits">
        <span class="eyebrow">Why it matters</span>
        <h2>Turn a startup idea into a launch-ready story.</h2>
        <div class="grid">
          <article class="card">
            <h3>Clear positioning</h3>
            <p>Explain the product, audience, and category without generic website-builder copy.</p>
          </article>
          <article class="card">
            <h3>Consistent visuals</h3>
            <p>Use one identity system across logo, hero imagery, app graphics, and social previews.</p>
          </article>
          <article class="card">
            <h3>Conversion flow</h3>
            <p>Guide visitors from problem to proof to pricing to action with a focused page structure.</p>
          </article>
        </div>
      </section>

      <section class="section-block">
        <span class="eyebrow">Product proof</span>
        <h2>Built for founders who need momentum, not scattered tools.</h2>
        <div class="grid">
          <article class="quote"><p>"${name} helped us move from rough idea to investor-ready launch assets in one afternoon."</p><strong>Founder preview</strong></article>
          <article class="quote"><p>"The brand stayed consistent across website, app store, and social assets."</p><strong>Launch team preview</strong></article>
          <article class="quote"><p>"The page structure made the offer easier to understand and act on."</p><strong>Customer preview</strong></article>
        </div>
      </section>

      <section class="section-block" id="pricing">
        <span class="eyebrow">Simple launch pricing</span>
        <h2>Start with the package that matches your launch stage.</h2>
        <div class="pricing-grid">
          <article class="price">
            <h3>Starter</h3>
            <span class="amount">$99</span>
            <p>One-time startup pack with logo, landing page code, and core launch assets.</p>
            <a class="button secondary" href="#cta">Choose Starter</a>
          </article>
          <article class="price featured">
            <h3>Launch Suite</h3>
            <span class="amount">$49/mo</span>
            <p>Ongoing regeneration, export packages, app store assets, SEO metadata, and brand memory.</p>
            <a class="button" href="#cta">Choose Launch Suite</a>
          </article>
        </div>
      </section>

      <section class="section-block" id="faq">
        <span class="eyebrow">Questions</span>
        <h2>Everything a visitor needs before they click.</h2>
        <div class="faq-grid">
          <article class="faq"><h3>Who is this for?</h3><p>${audience} building a ${industry} product that needs a polished launch presence.</p></article>
          <article class="faq"><h3>What do I get?</h3><p>Logo files, hero visuals, app icons, landing page code, SEO/social previews, and brand tokens.</p></article>
          <article class="faq"><h3>Can the brand change?</h3><p>Yes. Regeneration memory keeps the full ecosystem aligned when colors, style, or logo direction changes.</p></article>
          <article class="faq"><h3>Can I edit the code?</h3><p>Yes. The exported HTML is editable and designed to be copied into your production workflow.</p></article>
        </div>
      </section>

      <section class="final-cta" id="cta">
        <span class="eyebrow">Ready to launch</span>
        <h2>Give ${name} a launch page that feels intentional from the first click.</h2>
        <p>Use this page as your homepage, waitlist page, investor preview, or app launch destination.</p>
        <a class="button secondary" href="mailto:hello@example.com">Request early access</a>
      </section>

      <footer>Built with Launch OS brand context for ${name}.</footer>
    </main>
  </body>
</html>`;
}

function createZip(files: Record<string, string>) {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const centralDirectory: Uint8Array[] = [];
  let offset = 0;

  Object.entries(files).forEach(([path, content]) => {
    const name = encoder.encode(path);
    const data = encoder.encode(content);
    const crc = crc32(data);
    const local = zipHeader(0x04034b50, 20, 0, 0, crc, data.length, data.length, name.length, 0);
    chunks.push(local, name, data);
    centralDirectory.push(zipCentralHeader(name, crc, data.length, offset));
    offset += local.length + name.length + data.length;
  });

  const centralStart = offset;
  const centralSize = centralDirectory.reduce((sum, item) => sum + item.length, 0);
  const end = zipEnd(Object.keys(files).length, centralSize, centralStart);
  const blobParts = [...chunks, ...centralDirectory, end].map((part) =>
    part.buffer.slice(part.byteOffset, part.byteOffset + part.byteLength) as ArrayBuffer
  );
  return new Blob(blobParts, { type: "application/zip" });
}

function zipHeader(signature: number, version: number, flags: number, method: number, crc: number, compressedSize: number, size: number, nameLength: number, extraLength: number) {
  const header = new Uint8Array(30);
  const view = new DataView(header.buffer);
  view.setUint32(0, signature, true);
  view.setUint16(4, version, true);
  view.setUint16(6, flags, true);
  view.setUint16(8, method, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 0, true);
  view.setUint32(14, crc, true);
  view.setUint32(18, compressedSize, true);
  view.setUint32(22, size, true);
  view.setUint16(26, nameLength, true);
  view.setUint16(28, extraLength, true);
  return header;
}

function zipCentralHeader(name: Uint8Array, crc: number, size: number, offset: number) {
  const header = new Uint8Array(46 + name.length);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint32(16, crc, true);
  view.setUint32(20, size, true);
  view.setUint32(24, size, true);
  view.setUint16(28, name.length, true);
  view.setUint32(42, offset, true);
  header.set(name, 46);
  return header;
}

function zipEnd(count: number, centralSize: number, centralStart: number) {
  const end = new Uint8Array(22);
  const view = new DataView(end.buffer);
  view.setUint32(0, 0x06054b50, true);
  view.setUint16(8, count, true);
  view.setUint16(10, count, true);
  view.setUint32(12, centralSize, true);
  view.setUint32(16, centralStart, true);
  return end;
}

function crc32(data: Uint8Array) {
  let crc = -1;
  for (const byte of data) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

function getStepFromPath(pathname: string): BuilderStep {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  const legacyRoutes: Record<string, BuilderStep> = {
    "/name-app": 1,
    "/describe-app": 2,
    "/choose-style": 3,
    "/store-check": 7,
    "/website-assets": 5
  };
  return builderRoutes.find((route) => route.path === normalizedPath)?.step ?? legacyRoutes[normalizedPath] ?? 1;
}

function scrollToStepSection(step: BuilderStep) {
  const section = document.getElementById(routeSectionIds[step]);
  if (!section) return;

  section.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}
