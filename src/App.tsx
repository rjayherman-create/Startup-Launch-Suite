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

  async function generateWebsiteAssets() {
    setGenerating(true);
    await engine.generateHeroImage();
    setBrandProfile({ ...engine.getProfile() });
    setAssetStatus((current) => ({ ...current, website: true }));
    goToStep(6);
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
    setBrandProfile({ ...engine.getProfile() });
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
    downloadStartupKit(brandProfile, launchTargets);
    setAssetStatus((current) => ({ ...current, export: true }));
    goToStep(8);
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

        <section className="hero-band">
          <div className="hero-copy">
            <p className="eyebrow">Master app workflow</p>
            <h2>{brandProfile.businessName || "Your Startup"} is being assembled as one launch-ready ecosystem.</h2>
            <p>{brandProfile.description}</p>
            <div className="hero-actions">
              <button className="primary-button" onClick={generateIdentity} disabled={generating} type="button">
                <Wand2 size={18} /> Generate Brand Identity
              </button>
              <button className="secondary-button" onClick={() => regenerate(presetId)} disabled={generating || !assetStatus.identity} type="button">
                <RefreshCw size={18} /> Regenerate Ecosystem
              </button>
            </div>
          </div>
          <BrandPreview profile={brandProfile} />
        </section>

        <div className="content-grid two">
          <BuilderPanel
            audience={audience}
            businessName={businessName}
            checkStore={checkStore}
            description={description}
            generateNameIdeas={generateNameIdeas}
            industry={industry}
            launchTargets={launchTargets}
            nameIdeas={nameIdeas}
            presetId={presetId}
            selectName={selectName}
            setAudience={setAudience}
            setBusinessName={setBusinessName}
            setDescription={setDescription}
            setIndustry={setIndustry}
            setPresetId={setPresetId}
            setTagline={setTagline}
            step={step}
            storeCheck={storeCheck}
            tagline={tagline}
            toggleLaunchTarget={toggleLaunchTarget}
          />
          <OutputPanel
            assetStatus={assetStatus}
            brandProfile={brandProfile}
            exportStartupKit={exportStartupKit}
            generateLandingPage={generateLandingPage}
            generateWebsiteAssets={generateWebsiteAssets}
            generating={generating}
            regenerate={regenerate}
            wantsApp={wantsApp}
            wantsWebsite={wantsWebsite}
          />
        </div>

        <section className="pipeline-band">
          {pipeline.map((item, index) => (
            <article key={item}>
              <span>{index + 1}</span>
              <strong>{item}</strong>
              {index < pipeline.length - 1 ? <ChevronRight size={18} /> : <CheckCircle2 size={18} />}
            </article>
          ))}
        </section>

        <section className="system-section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Smart technical setup</p>
              <h2>Built as one product with isolated generation engines.</h2>
            </div>
          </div>
          <div className="content-grid four">
            {systemCards.map((card) => <SystemCard key={card.title} {...card} />)}
          </div>
        </section>
      </section>
    </main>
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

  return (
    <section className="panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">Startup builder flow</p>
          <h2>Brand Context Engine</h2>
        </div>
        <Workflow size={24} />
      </div>

      <div className="form-grid">
        <label>
          <span>App Name</span>
          <input value={props.businessName} onChange={(event) => props.setBusinessName(event.target.value)} />
        </label>
        <label>
          <span>Tagline</span>
          <input value={props.tagline} onChange={(event) => props.setTagline(event.target.value)} />
        </label>
        <label>
          <span>Industry</span>
          <input value={props.industry} onChange={(event) => props.setIndustry(event.target.value)} />
        </label>
        <label>
          <span>Audience</span>
          <input value={props.audience} onChange={(event) => props.setAudience(event.target.value)} />
        </label>
        <label className="wide">
          <span>Describe App</span>
          <textarea value={props.description} onChange={(event) => props.setDescription(event.target.value)} rows={5} />
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
        <div className="store-check-grid">
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
      </div>

      <div className="preset-grid">
        {stylePresets.map((preset) => (
          <button className={props.presetId === preset.id ? "preset active" : "preset"} key={preset.id} onClick={() => props.setPresetId(preset.id)} type="button">
            <span style={{ background: preset.colors.primary }} />
            <strong>{preset.label}</strong>
            <small>{preset.direction}</small>
          </button>
        ))}
      </div>

      <pre className="context-preview">{JSON.stringify({
        businessName: props.businessName,
        launchTargets: props.launchTargets,
        storeNameChecks: props.storeCheck,
        style: stylePresets.find((item) => item.id === props.presetId)?.label,
        audience: props.audience,
        industry: props.industry,
        activeStep: props.step
      }, null, 2)}</pre>
    </section>
  );
}

function OutputPanel(props: {
  assetStatus: { identity: boolean; website: boolean; landing: boolean; export: boolean };
  brandProfile: BrandProfile;
  exportStartupKit: () => void;
  generateLandingPage: () => void;
  generateWebsiteAssets: () => void;
  generating: boolean;
  regenerate: (preset: StylePresetId) => void;
  wantsApp: boolean;
  wantsWebsite: boolean;
}) {
  const canExport = props.assetStatus.identity
    && (!props.wantsApp || props.assetStatus.website)
    && (!props.wantsWebsite || props.assetStatus.landing)
    && !props.generating;

  return (
    <section className="panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">Generated outputs</p>
          <h2>Complete startup kit</h2>
        </div>
        <Archive size={24} />
      </div>

      <div className="output-stack">
        <OutputRow done={props.assetStatus.identity} icon={Palette} title="Brand Identity" detail="Logo, favicon, colors, typography, style direction" />
        <OutputRow done={props.assetStatus.website} icon={Image} title={props.wantsApp ? "Website/App Assets" : "Website Assets"} detail={props.wantsApp ? "Hero image, app icon direction, launch visuals, mockup system" : "Hero image, illustrations, mockup visual system"} />
        {props.wantsWebsite ? (
          <OutputRow done={props.assetStatus.landing} icon={Layers3} title="Landing Page" detail="Homepage, CTA sections, pricing blocks, testimonials" />
        ) : (
          <OutputRow done={true} icon={Layers3} title="Landing Page Skipped" detail="App-only launch kits do not require a website landing page." />
        )}
        <OutputRow done={props.assetStatus.export} icon={Download} title="ZIP Export" detail="Logos, SVGs, code, favicon package, palette, fonts" />
      </div>

      <div className="button-grid">
        <button className="secondary-button" disabled={!props.assetStatus.identity || props.generating} onClick={props.generateWebsiteAssets} type="button">
          <Image size={18} /> {props.wantsApp ? "Generate Launch Assets" : "Generate Website Assets"}
        </button>
        <button className="secondary-button" disabled={!props.wantsWebsite || !props.assetStatus.website || props.generating} onClick={props.generateLandingPage} type="button">
          <Globe2 size={18} /> Generate Landing Page
        </button>
        <button className="primary-button" disabled={!canExport} onClick={props.exportStartupKit} type="button">
          <Download size={18} /> Export Startup Kit
        </button>
      </div>

      {!props.wantsWebsite ? (
        <p className="output-note">Landing page generation is disabled because this kit is set to app-only.</p>
      ) : null}

      <div className="memory-box">
        <strong>Regeneration Memory</strong>
        {props.brandProfile.memory.map((item) => <span key={item}>{item}</span>)}
      </div>

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

function OutputRow({ detail, done, icon: Icon, title }: { detail: string; done: boolean; icon: typeof Rocket; title: string }) {
  return (
    <article className={done ? "output-row done" : "output-row"}>
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

function downloadStartupKit(profile: BrandProfile, launchTargets: LaunchTargets) {
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
    "landing-page/index.html": profile.landingPage?.html ?? "<main><h1>Generate landing page first</h1></main>"
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
