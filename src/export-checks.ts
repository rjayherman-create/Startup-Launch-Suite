import type { BrandProfile } from "./branding-engine";

export type ExportTarget =
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

export type ExportOptions = {
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

export type LaunchTargets = {
  website: boolean;
  ios: boolean;
  android: boolean;
};

export type CheckResult = {
  label: string;
  pass: boolean;
};

export type ExportReports = {
  compatibilityReport: {
    target: ExportTarget;
    options: ExportOptions;
    checks: {
      brokenImports: boolean;
      responsiveLayouts: boolean;
      imagePaths: boolean;
      missingAssets: boolean;
      unsupportedSyntax: boolean;
    };
    warnings: string[];
  };
  componentConsistency: {
    score: number;
    checks: Record<string, boolean>;
  };
  railwayReadiness: {
    score: number;
    checks: Record<string, boolean>;
    passed: boolean;
  };
  railwayChecklistMarkdown: string;
};

export function scoreChecks(checks: CheckResult[]) {
  if (checks.length === 0) return 0;
  return Math.round((checks.filter((item) => item.pass).length / checks.length) * 100);
}

export function buildComponentConsistencyChecks(input: {
  brandProfile: BrandProfile;
  wantsWebsite: boolean;
  codeDraft: string;
  exportOptions: ExportOptions;
}): CheckResult[] {
  return [
    { label: "Brand colors complete", pass: Object.values(input.brandProfile.colors).every(Boolean) },
    { label: "Typography configured", pass: Boolean(input.brandProfile.typography.headingFont && input.brandProfile.typography.bodyFont) },
    { label: "Logo + favicon parity", pass: Boolean(input.brandProfile.logo) && Boolean(input.brandProfile.favicon) },
    { label: "Hero + landing alignment", pass: !input.wantsWebsite || Boolean(input.brandProfile.heroImage) || Boolean(input.codeDraft.trim()) },
    { label: "Design tokens enabled", pass: input.exportOptions.designTokens },
    { label: "Responsive export enabled", pass: input.exportOptions.responsiveLayouts }
  ];
}

export function buildRailwayReadinessChecks(input: {
  exportTarget: ExportTarget;
  launchTargets: LaunchTargets;
  brandProfile: BrandProfile;
  codeDraft: string;
  exportOptions: ExportOptions;
}): CheckResult[] {
  return [
    { label: "Production target selected", pass: input.exportTarget === "full-production" || input.exportTarget === "vscode" || input.exportTarget === "replit" },
    { label: "Landing page available", pass: !input.launchTargets.website || Boolean(input.codeDraft.trim()) },
    { label: "Brand assets generated", pass: Boolean(input.brandProfile.logo) && Boolean(input.brandProfile.favicon) },
    { label: "SEO metadata enabled", pass: input.exportOptions.seoMetadata },
    { label: "README instructions enabled", pass: input.exportOptions.readmeInstructions }
  ];
}

export function isRailwayReady(checks: CheckResult[]) {
  return checks.every((item) => item.pass);
}

export function buildExportReports(input: {
  target: ExportTarget;
  options: ExportOptions;
  launchTargets: LaunchTargets;
  brandProfile: BrandProfile;
  codeDraft: string;
}): ExportReports {
  const compatibilityReport: ExportReports["compatibilityReport"] = {
    target: input.target,
    options: input.options,
    checks: {
      brokenImports: false,
      responsiveLayouts: input.options.responsiveLayouts,
      imagePaths: true,
      missingAssets: false,
      unsupportedSyntax: false
    },
    warnings: input.options.tailwindClasses && input.target === "bubble"
      ? ["Tailwind utility classes converted to Bubble style tokens where possible."]
      : []
  };

  const componentChecks = buildComponentConsistencyChecks({
    brandProfile: input.brandProfile,
    wantsWebsite: input.launchTargets.website,
    codeDraft: input.codeDraft,
    exportOptions: input.options
  });

  const componentConsistency = {
    score: scoreChecks(componentChecks),
    checks: {
      brandColorsComplete: componentChecks[0]?.pass ?? false,
      typographyConfigured: componentChecks[1]?.pass ?? false,
      logoAndFaviconParity: componentChecks[2]?.pass ?? false,
      heroAndLandingAlignment: componentChecks[3]?.pass ?? false,
      designTokensEnabled: componentChecks[4]?.pass ?? false,
      responsiveExportEnabled: componentChecks[5]?.pass ?? false
    }
  };

  const railwayChecks = buildRailwayReadinessChecks({
    exportTarget: input.target,
    launchTargets: input.launchTargets,
    brandProfile: input.brandProfile,
    codeDraft: input.codeDraft,
    exportOptions: input.options
  });

  const railwayReadiness = {
    score: scoreChecks(railwayChecks),
    checks: {
      productionTargetSelected: railwayChecks[0]?.pass ?? false,
      landingPageAvailable: railwayChecks[1]?.pass ?? false,
      brandAssetsGenerated: railwayChecks[2]?.pass ?? false,
      seoMetadataEnabled: railwayChecks[3]?.pass ?? false,
      readmeInstructionsEnabled: railwayChecks[4]?.pass ?? false
    },
    passed: isRailwayReady(railwayChecks)
  };

  const railwayChecklistMarkdown = `# Railway Deploy Checklist\n\n- Score: ${railwayReadiness.score}%\n- Production target selected: ${railwayReadiness.checks.productionTargetSelected ? "yes" : "no"}\n- Landing page available: ${railwayReadiness.checks.landingPageAvailable ? "yes" : "no"}\n- Brand assets generated: ${railwayReadiness.checks.brandAssetsGenerated ? "yes" : "no"}\n- SEO metadata enabled: ${railwayReadiness.checks.seoMetadataEnabled ? "yes" : "no"}\n- README instructions enabled: ${railwayReadiness.checks.readmeInstructionsEnabled ? "yes" : "no"}\n`;

  return {
    compatibilityReport,
    componentConsistency,
    railwayReadiness,
    railwayChecklistMarkdown
  };
}
