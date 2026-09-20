import type {
  DashboardWebsite,
} from "@/features/websites/types";

import {
  findWebsiteById,
  findWebsitesForCurrentUser,
  softDeleteWebsite,
} from "@/server/repositories/website-repository";

export async function listWebsites(): Promise<
  DashboardWebsite[]
> {
  const websites =
    await findWebsitesForCurrentUser();

  return websites.map(
    (website) => ({
      id:
        website.id,

      name:
        website.name,

      domain:
        website.default_hostname,

      framework:
        getFrameworkLabel(
          website.framework
        ),

      status:
        website.operational_status,

      setupStatus:
        website.setup_status,

      storage:
        "0 MB",

      publicUrl:
        `https://${website.default_hostname}`,
    })
  );
}

export async function getWebsite(
  websiteId: string
) {
  const website =
    await findWebsiteById(
      websiteId
    );

  if (!website) {
    return null;
  }

  return {
    ...website,

    frameworkLabel:
      getFrameworkLabel(
        website.framework
      ),
  };
}

export async function deleteWebsite(
  websiteId: string
) {
  await softDeleteWebsite(
    websiteId
  );
}

function getFrameworkLabel(
  framework:
    | string
    | null
) {
  if (!framework) {
    return undefined;
  }

  if (
    framework ===
    "nextjs"
  ) {
    return "Next.js";
  }

  if (
    framework ===
    "react"
  ) {
    return "React / Vite";
  }

  if (
    framework ===
    "astro"
  ) {
    return "Astro";
  }

  if (
    framework ===
    "nuxt"
  ) {
    return "Nuxt";
  }

  if (
    framework ===
    "sveltekit"
  ) {
    return "SvelteKit";
  }

  if (
    framework ===
    "vue"
  ) {
    return "Vue";
  }

  if (
    framework ===
    "static"
  ) {
    return "Static";
  }

  return "Custom / Other";
}