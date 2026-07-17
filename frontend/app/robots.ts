import type { MetadataRoute } from "next";
import { siteUrl } from "./seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/profile",
          "/profile/create",
          "/login",
          "/register",
          "/register/verify",
          "/forgot-password",
          "/api",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
