import type {
  DetectedProject,
} from "@/features/setup/types";

export const mockDetectedProjects: Record<
  string,
  DetectedProject
> = {
  nextjs: {
    framework:
      "nextjs",

    frameworkLabel:
      "Next.js",

    installCommand:
      "npm install",

    buildCommand:
      "npm run build",

    outputDirectory:
      ".next",
  },

  react: {
    framework:
      "react",

    frameworkLabel:
      "React / Vite",

    installCommand:
      "npm install",

    buildCommand:
      "npm run build",

    outputDirectory:
      "dist",
  },

  astro: {
    framework:
      "astro",

    frameworkLabel:
      "Astro",

    installCommand:
      "npm install",

    buildCommand:
      "npm run build",

    outputDirectory:
      "dist",
  },

  nuxt: {
    framework:
      "nuxt",

    frameworkLabel:
      "Nuxt",

    installCommand:
      "npm install",

    buildCommand:
      "npm run build",

    outputDirectory:
      ".output",
  },

  sveltekit: {
    framework:
      "sveltekit",

    frameworkLabel:
      "SvelteKit",

    installCommand:
      "npm install",

    buildCommand:
      "npm run build",

    outputDirectory:
      "build",
  },

  vue: {
    framework:
      "vue",

    frameworkLabel:
      "Vue",

    installCommand:
      "npm install",

    buildCommand:
      "npm run build",

    outputDirectory:
      "dist",
  },

  static: {
    framework:
      "static",

    frameworkLabel:
      "Static Website",

    installCommand:
      "",

    buildCommand:
      "",

    outputDirectory:
      ".",
  },

  unknown: {
    framework:
      "unknown",

    frameworkLabel:
      "Custom / Other",

    installCommand:
      "",

    buildCommand:
      "",

    outputDirectory:
      "",
  },
};

export function getMockDetectedProject(
  fileName?: string,
  repositoryUrl?: string
): DetectedProject {
  const source =
    `${fileName ?? ""} ${repositoryUrl ?? ""}`.toLowerCase();

  if (
    source.includes(
      "astro"
    )
  ) {
    return mockDetectedProjects.astro;
  }

  if (
    source.includes(
      "nuxt"
    )
  ) {
    return mockDetectedProjects.nuxt;
  }

  if (
    source.includes(
      "svelte"
    )
  ) {
    return mockDetectedProjects.sveltekit;
  }

  if (
    source.includes(
      "vue"
    )
  ) {
    return mockDetectedProjects.vue;
  }

  if (
    source.includes(
      "vite"
    ) ||
    source.includes(
      "react"
    )
  ) {
    return mockDetectedProjects.react;
  }

  if (
    source.includes(
      "static"
    ) ||
    source.includes(
      "html"
    )
  ) {
    return mockDetectedProjects.static;
  }

  return mockDetectedProjects.nextjs;
}