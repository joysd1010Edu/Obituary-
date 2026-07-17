const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://orbelofy.com";
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL;
const serverApiUrl =
  rawApiUrl && /^https?:\/\//.test(rawApiUrl)
    ? rawApiUrl
    : process.env.INTERNAL_API_URL ?? "http://localhost:4000/api";

export const siteUrl = rawSiteUrl.replace(/\/$/, "");
export const apiUrl = serverApiUrl.replace(/\/$/, "");
export const siteName = "Orbelofy";

export const alternateDomains = [
  "https://orbelofy.com",
  "https://www.orbelofy.com",
  "https://orbelofy.co.uk",
  "https://www.orbelofy.co.uk",
  "https://orbelofy.ie",
  "https://www.orbelofy.ie",
];

export const defaultTitle = "Orbelofy | Online Memorials & Obituaries";
export const defaultDescription =
  "Create, discover, and share meaningful online memorials and obituary pages with photos, funeral notices, tributes, and donation options.";
export const defaultKeywords = [
  "online memorials",
  "obituaries",
  "digital memorial",
  "funeral notices",
  "memorial donations",
  "tribute pages",
  "Orbelofy",
];

export function absoluteUrl(path = "/") {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function truncateDescription(value: string, maxLength = 155) {
  const compact = value.replace(/\s+/g, " ").trim();

  if (compact.length <= maxLength) return compact;

  return `${compact.slice(0, maxLength - 3).trimEnd()}...`;
}
