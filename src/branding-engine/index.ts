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
    const sections = ["Hero", "Founder problem", "Brand proof", "Pricing", "Testimonials", "CTA"];
    const html = `<main style="font-family:${this.brandProfile.typography.bodyFont};color:${this.brandProfile.colors.text};background:${this.brandProfile.colors.background}">
  <section>
    <h1 style="font-family:${this.brandProfile.typography.headingFont}">${this.brandProfile.businessName}</h1>
    <p>${this.brandProfile.tagline || this.brandProfile.description}</p>
    <button>Launch my startup kit</button>
  </section>
</main>`;

    const data = { html, sections };
    this.brandProfile.landingPage = data;
    this.touch("Landing page regenerated with current logo, colors, typography, and hero.");
    return data;
  }

  async generateStartupKit() {
    await this.generateLogo();
    await this.generateFavicon();
    await this.generateHeroImage();
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
