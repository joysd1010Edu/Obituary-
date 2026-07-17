import type { MetadataRoute } from "next";
import { apiUrl, siteUrl } from "./seo";

type MemorialSitemapItem = {
  _id?: string;
  publicationDate?: string;
  submittedAt?: string;
  deathDate?: string;
};

function staticPages(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/obituary`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/memorials`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/memorial`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}

function toDate(value?: string): Date | undefined {
  if (!value) return undefined;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = staticPages();

  try {
    const response = await fetch(`${apiUrl}/memorials`, {
      next: { revalidate: 60 * 60 },
    });

    if (!response.ok) {
      return pages;
    }

    const data = (await response.json()) as {
      memorials?: MemorialSitemapItem[];
    };

    const memorialPages =
      data.memorials
        ?.filter((memorial) => memorial._id)
        .map((memorial) => ({
          url: `${siteUrl}/obituary/${memorial._id}`,
          lastModified:
            toDate(memorial.publicationDate) ??
            toDate(memorial.submittedAt) ??
            toDate(memorial.deathDate) ??
            new Date(),
          changeFrequency: "monthly" as const,
          priority: 0.7,
        })) ?? [];

    return [...pages, ...memorialPages];
  } catch {
    return pages;
  }
}
