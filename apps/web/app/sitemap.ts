import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://1of10-deploy.vercel.app";

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/impressum`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/datenschutz`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/agb`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/widerruf`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];
}
