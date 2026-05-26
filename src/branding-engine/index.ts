export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
}

export interface BrandTypography {
  headingFont: string;
  bodyFont: string;
}

export interface LogoAsset {
  pngUrl: string;
  svgUrl: string;
  mark: string;
}

export interface FaviconAsset {
  favicon16: string;
  favicon32: string;
  appleTouchIcon: string;
}

export interface HeroImageAsset {
  imageUrl: string;
  prompt: string;
}

export interface ScreenshotConcept {
  title: string;
  caption: string;
  imageUrl: string;
}

export interface LandingPageAsset {
  html: string;
  sections: string[];
}

export interface BrandProfile {
  businessName: string;
  tagline?: string;
  description: string;
  industry: string;
  audience: string;
  tone: string;
  style: string;
  visualDirection: string;
  colors: BrandColors;
  typography: BrandTypography;
  logo?: LogoAsset;
  favicon?: FaviconAsset;
  heroImage?: HeroImageAsset;
  screenshotConcepts?: ScreenshotConcept[];
  landingPage?: LandingPageAsset;
  generatedAt?: string;
  revision: number;
  memory: string[];
}

export type StylePresetId = "startup-dark" | "clean-saas" | "bold-consumer" | "premium-fintech";

export interface StylePreset {
  id: StylePresetId;
  label: string;
  direction: string;
  tone: string;
  colors: BrandColors;
  typography: BrandTypography;
}

export const stylePresets: StylePreset[] = [
  {
    id: "startup-dark",
    label: "Startup Dark",
    direction: "high-contrast SaaS, luminous product surfaces, confident founder energy",
    tone: "Modern",
    colors: {
      primary: "#2563eb",
      secondary: "#14b8a6",
      accent: "#f97316",
      background: "#08111f",
      surface: "#111827",
      text: "#f8fafc"
    },
    typography: { headingFont: "Inter", bodyFont: "DM Sans" }
  },
  {
    id: "clean-saas",
    label: "Clean SaaS",
    direction: "bright operational workspace, crisp panels, trustworthy product clarity",
    tone: "Clear",
    colors: {
      primary: "#0f766e",
      secondary: "#2563eb",
      accent: "#eab308",
      background: "#f8fafc",
      surface: "#ffffff",
      text: "#172033"
    },
    typography: { headingFont: "Sora", bodyFont: "Inter" }
  },
  {
    id: "bold-consumer",
    label: "Bold Consumer",
    direction: "approachable launch brand, energetic shapes, direct conversion copy",
    tone: "Energetic",
    colors: {
      primary: "#e11d48",
      secondary: "#0891b2",
      accent: "#84cc16",
      background: "#fff7ed",
      surface: "#ffffff",
      text: "#1f2937"
    },
    typography: { headingFont: "Space Grotesk", bodyFont: "Inter" }
  },
  {
    id: "premium-fintech",
    label: "Premium Fintech",
    direction: "precise trust cues, calm contrast, investor-ready polish",
    tone: "Premium",
    colors: {
      primary: "#14532d",
      secondary: "#334155",
      accent: "#d97706",
      background: "#f7f5ef",
      surface: "#ffffff",
      text: "#111827"
    },
    typography: { headingFont: "Aptos Display", bodyFont: "Aptos" }
  }
];

export function createBrandProfile(input: {
  businessName: string;
  tagline?: string;
  description: string;
  industry: string;
  audience: string;
  presetId: StylePresetId;
}): BrandProfile {
  const preset = stylePresets.find((item) => item.id === input.presetId) ?? stylePresets[0];

  return {
    businessName: input.businessName,
    tagline: input.tagline,
    description: input.description,
    industry: input.industry,
    audience: input.audience,
    tone: preset.tone,
    style: preset.label,
    visualDirection: preset.direction,
    colors: preset.colors,
    typography: preset.typography,
    revision: 1,
    memory: [`Brand context created with ${preset.label} direction.`]
  };
}

export class StartupBrandingEngine {
  private brandProfile: BrandProfile;

  constructor(initialProfile: BrandProfile) {
    this.brandProfile = initialProfile;
  }

  getProfile() {
    return this.brandProfile;
  }

  updateProfile(updates: Partial<BrandProfile>, reason = "Brand profile updated") {
    this.brandProfile = {
      ...this.brandProfile,
      ...updates,
      revision: this.brandProfile.revision + 1,
      memory: [reason, ...this.brandProfile.memory].slice(0, 8)
    };
  }

  async generateLogo() {
    const initials = this.brandProfile.businessName
      .split(/\s+/)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const svg = encodeSvg(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
      <rect width="512" height="512" rx="96" fill="${this.brandProfile.colors.primary}"/>
      <path d="M96 332c58-118 148-176 320-176-62 42-104 90-126 144 42-10 78-8 108 6-70 58-167 80-302 26Z" fill="${this.brandProfile.colors.accent}"/>
      <text x="256" y="294" text-anchor="middle" font-family="Inter, Arial" font-size="132" font-weight="800" fill="${this.brandProfile.colors.text}">${initials}</text>
    </svg>`);

    const data = {
      pngUrl: svg,
      svgUrl: svg,
      mark: initials
    };

    this.brandProfile.logo = data;
    this.touch("Logo generated from current brand context.");
    return data;
  }

  async generateFavicon() {
    const mark = this.brandProfile.logo?.mark ?? this.brandProfile.businessName[0].toUpperCase();
    const icon = encodeSvg(`<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
      <rect width="180" height="180" rx="40" fill="${this.brandProfile.colors.primary}"/>
      <circle cx="132" cy="48" r="24" fill="${this.brandProfile.colors.accent}"/>
      <text x="90" y="116" text-anchor="middle" font-family="Inter, Arial" font-size="72" font-weight="900" fill="${this.brandProfile.colors.text}">${mark}</text>
    </svg>`);

    const data = {
      favicon16: icon,
      favicon32: icon,
      appleTouchIcon: icon
    };

    this.brandProfile.favicon = data;
    this.touch("Favicon package regenerated from latest logo and colors.");
    return data;
  }

  async generateHeroImage() {
    const prompt = `${this.brandProfile.businessName}: ${this.brandProfile.visualDirection}. Show the product helping ${this.brandProfile.audience} launch a ${this.brandProfile.industry} startup.`;
    const imageUrl = encodeSvg(`<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="900" viewBox="0 0 1440 900">
      <rect width="1440" height="900" fill="${this.brandProfile.colors.background}"/>
      <rect x="90" y="118" width="1260" height="664" rx="42" fill="${this.brandProfile.colors.surface}" opacity=".92"/>
      <rect x="146" y="176" width="430" height="62" rx="18" fill="${this.brandProfile.colors.primary}"/>
      <rect x="146" y="278" width="520" height="34" rx="12" fill="${this.brandProfile.colors.secondary}" opacity=".72"/>
      <rect x="146" y="338" width="410" height="34" rx="12" fill="${this.brandProfile.colors.accent}" opacity=".78"/>
      <rect x="768" y="180" width="426" height="300" rx="28" fill="${this.brandProfile.colors.primary}" opacity=".18"/>
      <rect x="822" y="236" width="318" height="42" rx="14" fill="${this.brandProfile.colors.primary}"/>
      <rect x="822" y="316" width="242" height="34" rx="12" fill="${this.brandProfile.colors.secondary}"/>
      <rect x="822" y="382" width="190" height="34" rx="12" fill="${this.brandProfile.colors.accent}"/>
      <path d="M240 692c164-112 358-162 584-150 174 10 302-28 384-114v184c-148 98-320 134-516 108-184-24-334-6-452 54Z" fill="${this.brandProfile.colors.accent}" opacity=".82"/>
      <text x="146" y="604" font-family="Inter, Arial" font-size="58" font-weight="900" fill="${this.brandProfile.colors.text}">${escapeSvg(this.brandProfile.businessName)}</text>
    </svg>`);

    const data = { imageUrl, prompt };
    this.brandProfile.heroImage = data;
    this.touch("Hero image regenerated with shared visual direction.");
    return data;
  }

  async generateLandingPage() {
    const sections = ["Hero", "Problem", "Benefits", "Product Proof", "Pricing", "Testimonials", "FAQ", "Final CTA"];
    const name = escapeHtml(this.brandProfile.businessName);
    const tagline = escapeHtml(this.brandProfile.tagline || `Launch ${this.brandProfile.businessName} with a complete brand system.`);
    const description = escapeHtml(this.brandProfile.description);
    const audience = escapeHtml(this.brandProfile.audience);
    const industry = escapeHtml(this.brandProfile.industry);
    const heroImage = this.brandProfile.heroImage?.imageUrl || "";
    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${description}" />
    <title>${name}</title>
    <style>
      :root {
        --primary: ${this.brandProfile.colors.primary};
        --secondary: ${this.brandProfile.colors.secondary};
        --accent: ${this.brandProfile.colors.accent};
        --background: ${this.brandProfile.colors.background};
        --surface: ${this.brandProfile.colors.surface};
        --text: ${this.brandProfile.colors.text};
      }
      * { box-sizing: border-box; }
      body { margin: 0; background: var(--background); color: var(--text); font-family: ${this.brandProfile.typography.bodyFont}, system-ui, sans-serif; }
      a { color: inherit; text-decoration: none; }
      .nav, section, footer { width: min(1120px, calc(100% - 40px)); margin: 0 auto; }
      .nav { display: flex; align-items: center; justify-content: space-between; padding: 24px 0; }
      .brand { display: inline-flex; align-items: center; gap: 10px; font-weight: 900; }
      .brand-mark { display: grid; width: 38px; height: 38px; place-items: center; border-radius: 10px; background: var(--primary); color: #fff; }
      .nav-links { display: flex; gap: 18px; font-weight: 800; opacity: 0.76; }
      .hero { display: grid; grid-template-columns: minmax(0, 1fr) minmax(320px, 0.86fr); align-items: center; gap: 44px; min-height: 680px; padding: 40px 0 72px; }
      .eyebrow { color: var(--accent); font-size: 13px; font-weight: 900; text-transform: uppercase; }
      h1, h2, h3 { font-family: ${this.brandProfile.typography.headingFont}, system-ui, sans-serif; letter-spacing: 0; }
      h1 { margin: 12px 0 18px; font-size: clamp(44px, 7vw, 86px); line-height: 0.98; }
      h2 { margin: 0 0 14px; font-size: clamp(30px, 4vw, 54px); line-height: 1.04; }
      p { font-size: 18px; line-height: 1.65; opacity: 0.78; }
      .hero-copy p { max-width: 660px; font-size: 21px; }
      .actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 28px; }
      .button { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; border-radius: 8px; background: var(--primary); color: #fff; padding: 0 18px; font-weight: 800; }
      .button.secondary { border: 1px solid rgba(255,255,255,0.28); background: transparent; color: var(--text); }
      .hero-card, .card, .price, .quote, .faq { border: 1px solid rgba(148,163,184,0.28); border-radius: 18px; background: var(--surface); padding: 22px; }
      .hero-card { border-radius: 24px; padding: 18px; box-shadow: 0 28px 80px rgba(0,0,0,0.18); }
      .hero-card img, .hero-placeholder { display: block; width: 100%; aspect-ratio: 16 / 10; border-radius: 18px; object-fit: cover; }
      .hero-placeholder { background: linear-gradient(135deg, var(--primary), var(--secondary), var(--accent)); }
      .proof-strip, .grid, .pricing-grid, .faq-grid { display: grid; gap: 16px; }
      .proof-strip { grid-template-columns: repeat(3, 1fr); padding: 22px 0 54px; }
      .proof-strip strong { display: block; font-size: 32px; }
      .section-block { padding: 78px 0; }
      .grid { grid-template-columns: repeat(3, 1fr); }
      .pricing-grid { grid-template-columns: 0.9fr 1.1fr; }
      .price.featured { border-color: var(--accent); box-shadow: 0 22px 60px rgba(249,115,22,0.18); }
      .amount { display: block; margin: 18px 0; font-size: 44px; font-weight: 950; }
      .faq-grid { grid-template-columns: repeat(2, 1fr); }
      .final-cta { margin-bottom: 56px; border-radius: 28px; background: var(--primary); color: #fff; padding: 54px; }
      footer { padding: 28px 0 44px; opacity: 0.72; }
      @media (max-width: 760px) {
        .nav-links { display: none; }
        .hero, .grid, .proof-strip, .pricing-grid, .faq-grid { grid-template-columns: 1fr; }
        .hero { min-height: auto; padding-top: 24px; }
        .final-cta { padding: 30px; }
      }
    </style>
  </head>
  <body>
    <main>
      <nav class="nav" aria-label="Main navigation">
        <a class="brand" href="#"><span class="brand-mark">${name.slice(0, 1)}</span><span>${name}</span></a>
        <div class="nav-links"><a href="#benefits">Benefits</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a></div>
      </nav>
      <section class="hero">
        <div class="hero-copy">
          <span class="eyebrow">${industry} launch system for ${audience}</span>
          <h1>${tagline}</h1>
          <p>${description}</p>
          <div class="actions"><a class="button" href="#cta">Start building</a><a class="button secondary" href="#benefits">See how it works</a></div>
        </div>
        <div class="hero-card">${heroImage ? `<img src="${heroImage}" alt="${name} product preview" />` : `<div class="hero-placeholder"></div>`}</div>
      </section>
      <section class="proof-strip"><div><strong>1</strong><span>shared brand context</span></div><div><strong>8</strong><span>launch-ready sections</span></div><div><strong>100%</strong><span>consistent visual system</span></div></section>
      <section class="section-block" id="benefits"><span class="eyebrow">Why it matters</span><h2>Turn a startup idea into a launch-ready story.</h2><div class="grid"><article class="card"><h3>Clear positioning</h3><p>Explain the product, audience, and category without generic copy.</p></article><article class="card"><h3>Consistent visuals</h3><p>Use one identity system across logo, hero imagery, app graphics, and social previews.</p></article><article class="card"><h3>Conversion flow</h3><p>Guide visitors from problem to proof to pricing to action.</p></article></div></section>
      <section class="section-block"><span class="eyebrow">Product proof</span><h2>Built for founders who need momentum, not scattered tools.</h2><div class="grid"><article class="quote"><p>"${name} helped us move from rough idea to launch assets in one afternoon."</p><strong>Founder preview</strong></article><article class="quote"><p>"The brand stayed consistent across website, app store, and social assets."</p><strong>Launch team preview</strong></article><article class="quote"><p>"The page structure made the offer easier to understand."</p><strong>Customer preview</strong></article></div></section>
      <section class="section-block" id="pricing"><span class="eyebrow">Simple launch pricing</span><h2>Start with the package that matches your launch stage.</h2><div class="pricing-grid"><article class="price"><h3>Starter</h3><span class="amount">$99</span><p>One-time startup pack with logo, landing page code, and core launch assets.</p><a class="button secondary" href="#cta">Choose Starter</a></article><article class="price featured"><h3>Launch Suite</h3><span class="amount">$49/mo</span><p>Ongoing regeneration, export packages, app store assets, SEO metadata, and brand memory.</p><a class="button" href="#cta">Choose Launch Suite</a></article></div></section>
      <section class="section-block" id="faq"><span class="eyebrow">Questions</span><h2>Everything a visitor needs before they click.</h2><div class="faq-grid"><article class="faq"><h3>Who is this for?</h3><p>${audience} building a ${industry} product that needs a polished launch presence.</p></article><article class="faq"><h3>What do I get?</h3><p>Logo files, hero visuals, app icons, landing page code, SEO/social previews, and brand tokens.</p></article><article class="faq"><h3>Can the brand change?</h3><p>Yes. Regeneration memory keeps the full ecosystem aligned.</p></article><article class="faq"><h3>Can I edit the code?</h3><p>Yes. The exported HTML is editable for your production workflow.</p></article></div></section>
      <section class="final-cta" id="cta"><span class="eyebrow">Ready to launch</span><h2>Give ${name} a launch page that feels intentional from the first click.</h2><p>Use this page as your homepage, waitlist page, investor preview, or app launch destination.</p><a class="button secondary" href="mailto:hello@example.com">Request early access</a></section>
      <footer>Built with Launch OS brand context for ${name}.</footer>
    </main>
  </body>
</html>`;

    const data = { html, sections };
    this.brandProfile.landingPage = data;
    this.touch("Landing page regenerated with current logo, colors, typography, and hero.");
    return data;
  }

  async generateScreenshotInspiration() {
    const scenes = [
      { title: "Welcome Flow", caption: "First-run onboarding with one decisive action and trust cues." },
      { title: "Dashboard Value", caption: "Outcome-focused dashboard that surfaces momentum and progress." },
      { title: "Feature Drilldown", caption: "Clear module detail view with contextual actions and quick wins." },
      { title: "Mobile Capture", caption: "Phone-first interaction snapshot for App Store and Play listing." },
      { title: "Social Proof", caption: "Testimonial + metric composition for conversion-oriented campaigns." },
      { title: "Pricing CTA", caption: "Plan comparison plus high-clarity CTA above fold." }
    ];

    const concepts = scenes.map((scene, index) => {
      const imageUrl = encodeSvg(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
        <rect width="1200" height="675" fill="${this.brandProfile.colors.background}"/>
        <rect x="48" y="42" width="1104" height="591" rx="28" fill="${this.brandProfile.colors.surface}"/>
        <rect x="86" y="84" width="360" height="34" rx="10" fill="${this.brandProfile.colors.primary}" opacity="0.92"/>
        <rect x="86" y="138" width="520" height="20" rx="8" fill="${this.brandProfile.colors.secondary}" opacity="0.55"/>
        <rect x="86" y="178" width="460" height="20" rx="8" fill="${this.brandProfile.colors.accent}" opacity="0.65"/>
        <rect x="86" y="238" width="1028" height="300" rx="20" fill="${this.brandProfile.colors.primary}" opacity="0.12"/>
        <rect x="116" y="270" width="300" height="210" rx="16" fill="${this.brandProfile.colors.primary}" opacity="0.75"/>
        <rect x="442" y="270" width="320" height="210" rx="16" fill="${this.brandProfile.colors.secondary}" opacity="0.35"/>
        <rect x="786" y="270" width="300" height="210" rx="16" fill="${this.brandProfile.colors.accent}" opacity="0.46"/>
        <text x="86" y="590" font-family="Inter, Arial" font-size="30" font-weight="800" fill="${this.brandProfile.colors.text}">${escapeSvg(this.brandProfile.businessName)} - ${scene.title}</text>
        <text x="86" y="622" font-family="Inter, Arial" font-size="20" font-weight="600" fill="${this.brandProfile.colors.text}" opacity="0.72">${escapeSvg(scene.caption)}</text>
        <text x="1120" y="620" text-anchor="end" font-family="Inter, Arial" font-size="18" font-weight="700" fill="${this.brandProfile.colors.text}" opacity="0.58">Scene ${index + 1}/6</text>
      </svg>`);

      return {
        title: scene.title,
        caption: scene.caption,
        imageUrl
      };
    });

    this.brandProfile.screenshotConcepts = concepts;
    this.touch("Screenshot inspiration pack generated with shared brand direction.");
    return concepts;
  }

  async generateStartupKit() {
    await this.generateLogo();
    await this.generateFavicon();
    await this.generateHeroImage();
    await this.generateScreenshotInspiration();
    await this.generateLandingPage();
    return {
      success: true,
      profile: {
        ...this.brandProfile,
        generatedAt: new Date().toISOString()
      }
    };
  }

  async regenerateBranding(newStyle: StylePresetId) {
    const preset = stylePresets.find((item) => item.id === newStyle) ?? stylePresets[0];
    this.updateProfile(
      {
        style: preset.label,
        tone: preset.tone,
        colors: preset.colors,
        typography: preset.typography,
        visualDirection: preset.direction
      },
      `Regenerated ecosystem around ${preset.label}.`
    );
    return this.generateStartupKit();
  }

  private touch(message: string) {
    this.brandProfile = {
      ...this.brandProfile,
      generatedAt: new Date().toISOString(),
      memory: [message, ...this.brandProfile.memory].slice(0, 8)
    };
  }
}

function encodeSvg(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}`;
}

function escapeSvg(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&apos;"
    };
    return entities[character];
  });
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
