import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/data/site";
import { locales } from "@/lib/i18n/config";

const PATHS = [
  { path: "", priority: 1 },
  { path: "/about", priority: 0.8 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.flatMap(({ path, priority }) =>
    locales.map((locale) => ({
      url: `${siteConfig.url}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, `${siteConfig.url}/${l}${path}`])),
      },
    }))
  );
}
