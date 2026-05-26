import { describe, expect, it } from "vitest";
import { createBrandProfile } from "./branding-engine";
import {
  buildComponentConsistencyChecks,
  buildExportReports,
  buildRailwayReadinessChecks,
  isRailwayReady,
  scoreChecks,
  type ExportOptions,
  type LaunchTargets
} from "./export-checks";

describe("export check snapshots", () => {
  const profile = createBrandProfile({
    businessName: "LaunchPilot",
    tagline: "AI Startup Launch System",
    description: "AI platform for startup launch assets.",
    industry: "SaaS",
    audience: "founders",
    presetId: "startup-dark"
  });

  profile.logo = {
    pngUrl: "data:image/svg+xml;utf8,logo",
    svgUrl: "data:image/svg+xml;utf8,logo",
    mark: "LP"
  };
  profile.favicon = {
    favicon16: "data:image/svg+xml;utf8,f16",
    favicon32: "data:image/svg+xml;utf8,f32",
    appleTouchIcon: "data:image/svg+xml;utf8,f180"
  };
  profile.heroImage = {
    imageUrl: "data:image/svg+xml;utf8,hero",
    prompt: "hero prompt"
  };

  const launchTargets: LaunchTargets = {
    website: true,
    ios: true,
    android: false
  };

  const exportOptions: ExportOptions = {
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
  };

  it("snapshots component and railway checks", () => {
    const componentChecks = buildComponentConsistencyChecks({
      brandProfile: profile,
      wantsWebsite: true,
      codeDraft: "<main>ok</main>",
      exportOptions
    });

    const railwayChecks = buildRailwayReadinessChecks({
      exportTarget: "full-production",
      launchTargets,
      brandProfile: profile,
      codeDraft: "<main>ok</main>",
      exportOptions
    });

    expect({
      componentChecks,
      componentScore: scoreChecks(componentChecks),
      railwayChecks,
      railwayScore: scoreChecks(railwayChecks),
      railwayReady: isRailwayReady(railwayChecks)
    }).toMatchSnapshot();
  });

  it("snapshots export reports", () => {
    const reports = buildExportReports({
      target: "full-production",
      options: exportOptions,
      launchTargets,
      brandProfile: profile,
      codeDraft: "<main>ok</main>"
    });

    expect(reports).toMatchSnapshot();
  });
});
