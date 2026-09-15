// Runs before Vite development and production builds; writes public/sitemap.xml.
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnv } from "vite";

const BASE_URL = "https://conectamais.qbcamp.com.br";
const env = loadEnv(process.env.NODE_ENV || "production", process.cwd(), "");
const apiUrl = env.VITE_SUPABASE_URL;
const apiKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY;

interface SitemapEntry {
  path: string;
  lastmod?: string | null;
  changefreq?: "daily" | "weekly" | "monthly";
  priority?: string;
}

const entries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/marketplace", changefreq: "daily", priority: "0.9" },
  { path: "/empresas", changefreq: "weekly", priority: "0.9" },
  { path: "/servicos", changefreq: "monthly", priority: "0.8" },
  { path: "/oportunidades", changefreq: "daily", priority: "0.8" },
  { path: "/ranking", changefreq: "weekly", priority: "0.6" },
  { path: "/beneficios", changefreq: "weekly", priority: "0.7" },
  { path: "/eventos", changefreq: "daily", priority: "0.8" },
  { path: "/noticias", changefreq: "daily", priority: "0.9" },
  { path: "/sac", changefreq: "monthly", priority: "0.5" },
];

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character] || character);
}

async function readPublicRows(table: string, select: string, filters: string) {
  if (!apiUrl || !apiKey) return [];
  const response = await fetch(`${apiUrl}/rest/v1/${table}?select=${select}&${filters}`, {
    headers: { apikey: apiKey, Authorization: `Bearer ${apiKey}` },
  });
  if (!response.ok) throw new Error(`${table}: ${response.status}`);
  return response.json() as Promise<Array<Record<string, string | null>>>;
}

async function addDynamicEntries() {
  try {
    const [news, products, events, profiles] = await Promise.all([
      readPublicRows("news", "id,updated_at,published_at,profiles!inner(approved)", "status=eq.approved&profiles.approved=eq.true"),
      readPublicRows("products", "id,updated_at", "active=eq.true&moderation_status=eq.approved"),
      readPublicRows("events", "id,updated_at", "active=eq.true&moderation_status=eq.approved"),
      readPublicRows("profiles", "id,updated_at", "approved=eq.true"),
    ]);
    news.forEach((row) => entries.push({ path: `/noticias/${row.id}`, lastmod: row.updated_at || row.published_at }));
    products.forEach((row) => entries.push({ path: `/produto/${row.id}`, lastmod: row.updated_at }));
    events.forEach((row) => entries.push({ path: `/evento/${row.id}`, lastmod: row.updated_at }));
    profiles.forEach((row) => entries.push({ path: `/empresa/${row.id}`, lastmod: row.updated_at }));
  } catch (error) {
    console.warn("Dynamic sitemap entries unavailable; static public routes were generated.", error instanceof Error ? error.message : error);
  }
}

await addDynamicEntries();

const urls = entries.map((entry) => [
  "  <url>",
  `    <loc>${escapeXml(`${BASE_URL}${entry.path}`)}</loc>`,
  entry.lastmod ? `    <lastmod>${new Date(entry.lastmod).toISOString()}</lastmod>` : null,
  entry.changefreq ? `    <changefreq>${entry.changefreq}</changefreq>` : null,
  entry.priority ? `    <priority>${entry.priority}</priority>` : null,
  "  </url>",
].filter(Boolean).join("\n"));

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls,
  "</urlset>",
  "",
].join("\n");

writeFileSync(resolve("public/sitemap.xml"), sitemap);
console.log(`sitemap.xml written (${entries.length} entries)`);