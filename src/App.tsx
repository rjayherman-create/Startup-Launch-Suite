import {
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

type BuilderStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type StoreCheck = "unchecked" | "checking" | "checked";
type LaunchTargets = {
  website: boolean;
  ios: boolean;
  android: boolean;
};

const builderRoutes: Array<{ step: BuilderStep; label: string; path: string }> = [
  { step: 1, label: "Name App", path: "/name-app" },
  { step: 2, label: "Describe App", path: "/describe-app" },
  { step: 3, label: "Choose Style", path: "/choose-style" },
  { step: 4, label: "Store Check", path: "/store-check" },
  { step: 5, label: "Brand Identity", path: "/brand-identity" },
  { step: 6, label: "Website Assets", path: "/website-assets" },
  { step: 7, label: "Landing Page", path: "/landing-page" },
  { step: 8, label: "Export Kit", path: "/export-kit" }
];

const routeSectionIds: Record<BuilderStep, string> = {
  1: "section-name-app",
  2: "section-describe-app",
  3: "section-choose-style",
  4: "section-store-check",
  5: "section-brand-identity",
  6: "section-website-assets",
  7: "section-landing-page",
  8: "section-export-kit"
};

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
  "Name app and store check",
  "Generate logo",
  "Extract colors, typography, style direction",
  "Send brand context to generators",
  "Assemble startup kit"
];

const namingAngles = ["Pilot", "Forge", "Stack", "Kit", "Signal", "Studio", "Base", "Lift"];

export function App() {
  const [step, setStep] = useState<BuilderStep>(() => getStepFromPath(window.location.pathname));
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
  const [presetId, setPresetId] = useState<StylePresetId>("startup-dark");
  const [brandProfile, setBrandProfile] = useState<BrandProfile>(defaultProfile);
  const [nameIdeas, setNameIdeas] = useState<string[]>(["LaunchPilot", "FounderForge", "StartupLift", "BrandStack"]);
  const [storeCheck, setStoreCheck] = useState<Record<"ios" | "android", StoreCheck>>({
    ios: "unchecked",
    android: "unchecked"
  });
  const [codeDraft, setCodeDraft] = useState(defaultLandingCode(defaultProfile));
  const [clipboardStatus, setClipboardStatus] = useState("");
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

  function generateNameIdeas() {
    const words = `${description} ${industry} ${audience}`
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3 && !["that", "with", "from", "this", "your", "startup", "platform"].includes(word));
    const seed = words.slice(0, 4).map((word) => word[0].toUpperCase() + word.slice(1));
    const ideas = [...seed, "Launch"].flatMap((word, index) => [
      `${word}${namingAngles[index % namingAngles.length]}`,
      `${namingAngles[(index + 2) % namingAngles.length]}${word}`
    ]);

    setNameIdeas([...new Set(ideas)].slice(0, 8));
    goToStep(1);
  }

  function selectName(name: string) {
    setBusinessName(name);
    setStoreCheck({ ios: "unchecked", android: "unchecked" });
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
      ? `https://apps.apple.com/us/search?term=${query}`
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
    goToStep(5);
    setGenerating(false);
  }

  async function generateLogoAsset() {
    setGenerating(true);
    const profile = createBrandProfile({ businessName, tagline, description, industry, audience, presetId });
    const nextEngine = new StartupBrandingEngine(profile);
    await nextEngine.generateLogo();
    setBrandProfile(nextEngine.getProfile());
    setAssetStatus((current) => ({ ...current, identity: false }));
    goToStep(5);
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
    goToStep(5);
    setGenerating(false);
  }

  async function generateWebsiteAssets() {
    setGenerating(true);
    await engine.generateHeroImage();
    setBrandProfile({ ...engine.getProfile() });
    setAssetStatus((current) => ({ ...current, website: true }));
    goToStep(6);
    setGenerating(false);
  }

  async function generateHeroImageAsset() {
    setGenerating(true);
    const nextEngine = new StartupBrandingEngine(brandProfile);
    await nextEngine.generateHeroImage();
    setBrandProfile({ ...nextEngine.getProfile() });
    setAssetStatus((current) => ({ ...current, website: true }));
    if (window.location.pathname !== "/website-assets") {
      window.history.pushState({ step: 6 }, "", "/website-assets");
    }
    setStep(6);
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
    goToStep(7);
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

  function exportStartupKit() {
    downloadStartupKit(brandProfile, launchTargets, codeDraft);
    setAssetStatus((current) => ({ ...current, export: true }));
    goToStep(8);
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

  const progress = Math.round((Object.values(assetStatus).filter(Boolean).length / 4) * 100);

  return (
    <main className="app-shell">
      <aside className="rail">
        <div className="brand-lockup">
          <div className="brand-mark"><Rocket size={24} /></div>
          <div>
            <strong>Launch OS</strong>
            <span>Startup Launch Suite</span>
          </div>
        </div>

        <nav className="step-list" aria-label="Startup builder steps">
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
        <header className="topbar">
          <div>
            <p className="eyebrow">Startup-focused branding system</p>
            <h1>Launch a consistent brand identity, website kit, and landing page from one brand context.</h1>
          </div>
          <div className="progress-card">
            <span>Startup kit</span>
            <strong>{progress}%</strong>
            <div><i style={{ width: `${progress}%` }} /></div>
          </div>
        </header>

        <StepPage
          assetStatus={assetStatus}
          audience={audience}
          brandProfile={brandProfile}
          businessName={businessName}
          checkStore={checkStore}
          clipboardStatus={clipboardStatus}
          codeDraft={codeDraft}
          copyCodeDraft={copyCodeDraft}
          cutCodeDraft={cutCodeDraft}
          description={description}
          exportStartupKit={exportStartupKit}
          generateIdentity={generateIdentity}
          generateFaviconAsset={generateFaviconAsset}
          generateHeroImageAsset={generateHeroImageAsset}
          generateLandingPage={generateLandingPage}
          generateLogoAsset={generateLogoAsset}
          generateNameIdeas={generateNameIdeas}
          generateWebsiteAssets={generateWebsiteAssets}
          generating={generating}
          industry={industry}
          launchTargets={launchTargets}
          nameIdeas={nameIdeas}
          presetId={presetId}
          regenerate={regenerate}
          selectName={selectName}
          setAudience={setAudience}
          setBusinessName={setBusinessName}
          setCodeDraft={setCodeDraft}
          setDescription={setDescription}
          setIndustry={setIndustry}
          setPresetId={setPresetId}
          setTagline={setTagline}
          step={step}
          storeCheck={storeCheck}
          tagline={tagline}
          toggleLaunchTarget={toggleLaunchTarget}
          wantsApp={wantsApp}
          wantsWebsite={wantsWebsite}
        />
      </section>
    </main>
  );
}

function StepPage(props: {
  assetStatus: { identity: boolean; website: boolean; landing: boolean; export: boolean };
  audience: string;
  brandProfile: BrandProfile;
  businessName: string;
  checkStore: (platform: "ios" | "android") => void;
  clipboardStatus: string;
  codeDraft: string;
  copyCodeDraft: () => void;
  cutCodeDraft: () => void;
  description: string;
  exportStartupKit: () => void;
  generateIdentity: () => void;
  generateFaviconAsset: () => void;
  generateHeroImageAsset: () => void;
  generateLandingPage: () => void;
  generateLogoAsset: () => void;
  generateNameIdeas: () => void;
  generateWebsiteAssets: () => void;
  generating: boolean;
  industry: string;
  launchTargets: LaunchTargets;
  nameIdeas: string[];
  presetId: StylePresetId;
  regenerate: (preset: StylePresetId) => void;
  selectName: (name: string) => void;
  setAudience: (value: string) => void;
  setBusinessName: (value: string) => void;
  setCodeDraft: (value: string) => void;
  setDescription: (value: string) => void;
  setIndustry: (value: string) => void;
  setPresetId: (value: StylePresetId) => void;
  setTagline: (value: string) => void;
  step: BuilderStep;
  storeCheck: Record<"ios" | "android", StoreCheck>;
  tagline: string;
  toggleLaunchTarget: (target: keyof LaunchTargets) => void;
  wantsApp: boolean;
  wantsWebsite: boolean;
}) {
  if (props.step <= 4) {
    return (
      <div className="step-page">
        <BuilderPanel
          audience={props.audience}
          businessName={props.businessName}
          checkStore={props.checkStore}
          description={props.description}
          generateNameIdeas={props.generateNameIdeas}
          industry={props.industry}
          launchTargets={props.launchTargets}
          nameIdeas={props.nameIdeas}
          presetId={props.presetId}
          selectName={props.selectName}
          setAudience={props.setAudience}
          setBusinessName={props.setBusinessName}
          setDescription={props.setDescription}
          setIndustry={props.setIndustry}
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

  if (props.step === 5) {
    return (
      <section className="hero-band step-page" id="section-brand-identity">
        <div className="hero-copy">
          <p className="eyebrow">Brand identity</p>
          <h2>{props.brandProfile.businessName || "Your App"} is ready for its first visual system.</h2>
          <p>{props.brandProfile.description}</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={props.generateIdentity} disabled={props.generating} type="button">
              <Wand2 size={18} /> Generate Brand Identity
            </button>
            <button className="secondary-button" onClick={() => props.regenerate(props.presetId)} disabled={props.generating || !props.assetStatus.identity} type="button">
              <RefreshCw size={18} /> Regenerate Ecosystem
            </button>
          </div>
        </div>
        <div className="brand-generator-stack">
          <BrandPreview profile={props.brandProfile} />
          <div className="generator-grid">
            <GeneratorCard
              actionLabel="Create Logo"
              detail="Pulls app name, style, colors, industry, and tone from the shared brand context."
              imageUrl={props.brandProfile.logo?.svgUrl}
              onGenerate={props.generateLogoAsset}
              status={props.brandProfile.logo ? "Created" : "Not created"}
              title="Logo Creator"
            />
            <GeneratorCard
              actionLabel="Create Favicon"
              detail="Uses the current logo and palette to produce favicon sizes and Apple touch icon source."
              imageUrl={props.brandProfile.favicon?.favicon32}
              onGenerate={props.generateFaviconAsset}
              status={props.brandProfile.favicon ? "Created" : "Waiting for logo"}
              title="Favicon Creator"
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="step-page">
      <OutputPanel
        assetStatus={props.assetStatus}
        brandProfile={props.brandProfile}
        clipboardStatus={props.clipboardStatus}
        codeDraft={props.codeDraft}
        copyCodeDraft={props.copyCodeDraft}
        cutCodeDraft={props.cutCodeDraft}
        exportStartupKit={props.exportStartupKit}
        generateLandingPage={props.generateLandingPage}
        generateWebsiteAssets={props.generateHeroImageAsset}
        generating={props.generating}
        regenerate={props.regenerate}
        setCodeDraft={props.setCodeDraft}
        step={props.step}
        wantsApp={props.wantsApp}
        wantsWebsite={props.wantsWebsite}
      />
    </div>
  );
}

function BuilderPanel(props: {
  audience: string;
  businessName: string;
  checkStore: (platform: "ios" | "android") => void;
  description: string;
  generateNameIdeas: () => void;
  industry: string;
  launchTargets: LaunchTargets;
  nameIdeas: string[];
  presetId: StylePresetId;
  selectName: (name: string) => void;
  setAudience: (value: string) => void;
  setBusinessName: (value: string) => void;
  setDescription: (value: string) => void;
  setIndustry: (value: string) => void;
  setPresetId: (value: StylePresetId) => void;
  setTagline: (value: string) => void;
  step: BuilderStep;
  storeCheck: Record<"ios" | "android", StoreCheck>;
  tagline: string;
  toggleLaunchTarget: (target: keyof LaunchTargets) => void;
}) {
  const wantsApp = props.launchTargets.ios || props.launchTargets.android;
  const stepTitles: Record<BuilderStep, string> = {
    1: "Name App",
    2: "Describe App",
    3: "Choose Style",
    4: "Store Check",
    5: "Brand Identity",
    6: "Website Assets",
    7: "Landing Page",
    8: "Export Kit"
  };

  return (
    <section className="panel single-step-panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">Startup builder flow</p>
          <h2>{stepTitles[props.step]}</h2>
        </div>
        <Workflow size={24} />
      </div>

      {props.step === 1 ? (
        <>
      <div className="form-grid">
        <label id="section-name-app">
          <span>App Name</span>
          <input value={props.businessName} onChange={(event) => props.setBusinessName(event.target.value)} />
        </label>
        <label>
          <span>Tagline</span>
          <input value={props.tagline} onChange={(event) => props.setTagline(event.target.value)} />
        </label>
      </div>

      <div className="naming-lab">
        <div>
          <p className="eyebrow">AI app naming assistant</p>
          <h3>Find an app name before generating the brand.</h3>
        </div>
        <button className="secondary-button" onClick={props.generateNameIdeas} type="button">
          <Sparkles size={18} /> Generate App Names
        </button>
        <div className="name-chip-grid">
          {props.nameIdeas.map((name) => (
            <button className={props.businessName === name ? "name-chip active" : "name-chip"} key={name} onClick={() => props.selectName(name)} type="button">
              {name}
            </button>
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
            <label className="wide" id="section-describe-app">
              <span>Describe App</span>
              <textarea value={props.description} onChange={(event) => props.setDescription(event.target.value)} rows={6} />
            </label>
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
      <div className="preset-grid" id="section-choose-style">
        {stylePresets.map((preset) => (
          <button className={props.presetId === preset.id ? "preset active" : "preset"} key={preset.id} onClick={() => props.setPresetId(preset.id)} type="button">
            <span style={{ background: preset.colors.primary }} />
            <strong>{preset.label}</strong>
            <small>{preset.direction}</small>
          </button>
        ))}
      </div>
      ) : null}

      {props.step === 4 ? (
        <div className="store-check-grid" id="section-store-check">
          {props.launchTargets.ios ? (
            <StoreCheckCard
              detail="Search Apple App Store listings and app-name collisions before committing to brand assets."
              onCheck={() => props.checkStore("ios")}
              platform="iOS App Store"
              status={props.storeCheck.ios}
            />
          ) : null}
          {props.launchTargets.android ? (
            <StoreCheckCard
              detail="Search Google Play apps so the Android launch path does not inherit a name conflict."
              onCheck={() => props.checkStore("android")}
              platform="Google Play"
              status={props.storeCheck.android}
            />
          ) : null}
          {!wantsApp ? (
            <div className="store-skip">
              <Globe2 size={22} />
              <strong>App store checks skipped</strong>
              <span>Website-only projects do not need iOS or Android name checks.</span>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function OutputPanel(props: {
  assetStatus: { identity: boolean; website: boolean; landing: boolean; export: boolean };
  brandProfile: BrandProfile;
  clipboardStatus: string;
  codeDraft: string;
  copyCodeDraft: () => void;
  cutCodeDraft: () => void;
  exportStartupKit: () => void;
  generateLandingPage: () => void;
  generateWebsiteAssets: () => void;
  generating: boolean;
  regenerate: (preset: StylePresetId) => void;
  setCodeDraft: (value: string) => void;
  step: BuilderStep;
  wantsApp: boolean;
  wantsWebsite: boolean;
}) {
  const canExport = props.assetStatus.identity
    && (!props.wantsApp || props.assetStatus.website)
    && (!props.wantsWebsite || props.assetStatus.landing)
    && !props.generating;

  return (
    <section className="panel single-step-panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">Generated outputs</p>
          <h2>{props.step === 6 ? "Website/App Assets" : props.step === 7 ? "Landing Page" : "Export Kit"}</h2>
        </div>
        <Archive size={24} />
      </div>

      <div className="output-stack">
        {props.step === 6 ? (
          <div className="hero-generator-panel" id="section-website-assets">
            <GeneratorCard
              actionLabel="Create Hero Image"
              detail={props.wantsApp ? "Pulls app name, audience, style, typography, colors, and tone into the hero image generator." : "Pulls app name, audience, style, typography, colors, and tone into the website hero generator."}
              imageUrl={props.brandProfile.heroImage?.imageUrl}
              onGenerate={props.generateWebsiteAssets}
              status={props.brandProfile.heroImage ? "Created" : "Not created"}
              title="Hero Image Creator"
            />
            <OutputRow done={props.assetStatus.website} icon={Image} title={props.wantsApp ? "Website/App Assets" : "Website Assets"} detail={props.wantsApp ? "Hero image, app icon direction, launch visuals, mockup system" : "Hero image, illustrations, mockup visual system"} />
          </div>
        ) : null}
        {props.step === 7 && props.wantsWebsite ? (
          <OutputRow done={props.assetStatus.landing} icon={Layers3} id="section-landing-page" title="Landing Page" detail="Homepage, CTA sections, pricing blocks, testimonials" />
        ) : null}
        {props.step === 7 && !props.wantsWebsite ? (
          <OutputRow done={true} icon={Layers3} id="section-landing-page" title="Landing Page Skipped" detail="App-only launch kits do not require a website landing page." />
        ) : null}
        {props.step === 8 ? (
          <OutputRow done={props.assetStatus.export} icon={Download} id="section-export-kit" title="ZIP Export" detail="Logos, SVGs, code, favicon package, palette, fonts" />
        ) : null}
      </div>

      <div className="button-grid">
        {props.step === 6 && !props.assetStatus.identity ? (
          <p className="output-note">Generate the brand identity first so the hero image can pull the logo, colors, typography, and style direction.</p>
        ) : null}
        {props.step === 7 ? (
        <button className="secondary-button" disabled={!props.wantsWebsite || !props.assetStatus.website || props.generating} onClick={props.generateLandingPage} type="button">
          <Globe2 size={18} /> Generate Landing Page
        </button>
        ) : null}
        {props.step === 8 ? (
        <button className="primary-button" disabled={!canExport} onClick={props.exportStartupKit} type="button">
          <Download size={18} /> Export Startup Kit
        </button>
        ) : null}
      </div>

      {props.step === 7 && !props.wantsWebsite ? (
        <p className="output-note">Landing page generation is disabled because this kit is set to app-only.</p>
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

function downloadStartupKit(profile: BrandProfile, launchTargets: LaunchTargets, landingPageCode: string) {
  const slug = profile.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "startup-kit";
  const files = {
    "README.txt": `${profile.businessName} Startup Kit\n\nLaunch targets:\n- Website: ${launchTargets.website ? "yes" : "no"}\n- iOS App: ${launchTargets.ios ? "yes" : "no"}\n- Android App: ${launchTargets.android ? "yes" : "no"}\n\nStyle: ${profile.style}\nTone: ${profile.tone}\nDirection: ${profile.visualDirection}\n\nThis export contains the shared brand context used by logo, favicon, hero, and landing page generators.\n`,
    "brand-profile.json": JSON.stringify(profile, null, 2),
    "launch-targets.json": JSON.stringify(launchTargets, null, 2),
    "tokens/colors.json": JSON.stringify(profile.colors, null, 2),
    "tokens/typography.json": JSON.stringify(profile.typography, null, 2),
    "logos/logo.svg": decodeDataSvg(profile.logo?.svgUrl),
    "favicons/favicon.svg": decodeDataSvg(profile.favicon?.favicon32),
    "images/hero.svg": decodeDataSvg(profile.heroImage?.imageUrl),
    "landing-page/index.html": landingPageCode || defaultLandingCode(profile)
  };

  const blob = createZip(files);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${slug}-startup-kit.zip`;
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

function defaultLandingCode(profile: BrandProfile) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${profile.businessName}</title>
    <style>
      body {
        margin: 0;
        background: ${profile.colors.background};
        color: ${profile.colors.text};
        font-family: ${profile.typography.bodyFont}, system-ui, sans-serif;
      }

      main {
        display: grid;
        min-height: 100vh;
        place-items: center;
        padding: 48px;
      }

      section {
        max-width: 880px;
      }

      h1 {
        margin: 0 0 16px;
        font-family: ${profile.typography.headingFont}, system-ui, sans-serif;
        font-size: clamp(44px, 8vw, 96px);
        line-height: 0.95;
      }

      p {
        max-width: 680px;
        color: ${profile.colors.text};
        font-size: 20px;
        line-height: 1.6;
        opacity: 0.82;
      }

      a {
        display: inline-flex;
        margin-top: 24px;
        border-radius: 8px;
        background: ${profile.colors.primary};
        color: ${profile.colors.text};
        padding: 14px 18px;
        font-weight: 800;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <main>
      <section>
        <h1>${profile.businessName}</h1>
        <p>${profile.tagline || profile.description}</p>
        <a href="#cta">Start now</a>
      </section>
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
  return builderRoutes.find((route) => route.path === normalizedPath)?.step ?? 1;
}

function scrollToStepSection(step: BuilderStep) {
  const section = document.getElementById(routeSectionIds[step]);
  if (!section) return;

  section.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}
