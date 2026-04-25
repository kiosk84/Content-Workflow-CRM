import type { SourceSnapshot } from "@/types/content";

/** Naive but fast HTML → SourceSnapshot parser. No external deps. */

const META = (html: string, re: RegExp) => {
  const m = html.match(re);
  return m ? decodeHtmlEntities(m[1].trim()) : undefined;
};

function decodeHtmlEntities(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x27;/g, "'");
}

function extractMeta(html: string, property: string): string | undefined {
  const re1 = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
    "i"
  );
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
    "i"
  );
  return META(html, re1) ?? META(html, re2);
}

function detectKind(url: string): SourceSnapshot["kind"] {
  const u = url.toLowerCase();
  if (u.includes("youtube.com/") || u.includes("youtu.be/")) return "youtube";
  if (
    u.includes("instagram.com/") ||
    u.includes("threads.net/") ||
    u.includes("tiktok.com/") ||
    u.includes("vk.com/") ||
    u.includes("x.com/") ||
    u.includes("twitter.com/") ||
    u.includes("t.me/")
  )
    return "social";
  return "article";
}

/** Strip tags, scripts, styles; normalize whitespace; cap length. */
export function extractReadableText(html: string, maxChars = 4000): string {
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<aside[\s\S]*?<\/aside>/gi, " ");

  const main = cleaned.match(/<(article|main)[\s\S]*?<\/\1>/i)?.[0] ?? cleaned;

  const text = main
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return decodeHtmlEntities(text).slice(0, maxChars);
}

export async function fetchSnapshot(
  rawUrl: string,
  signal?: AbortSignal
): Promise<SourceSnapshot> {
  const url = rawUrl.trim();
  if (!/^https?:\/\//i.test(url)) {
    throw new Error("URL должен начинаться с http(s)://");
  }

  const res = await fetch(url, {
    signal,
    redirect: "follow",
    headers: {
      // A human-ish UA so that sites don't bounce us to robots pages.
      "User-Agent":
        "Mozilla/5.0 (compatible; ContentFlowBot/1.0; +https://github.com/kiosk84/Content-Workflow-CRM)",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "ru,en;q=0.8",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

  const html = await res.text();

  const title =
    extractMeta(html, "og:title") ??
    extractMeta(html, "twitter:title") ??
    META(html, /<title[^>]*>([^<]+)<\/title>/i);

  const description =
    extractMeta(html, "og:description") ??
    extractMeta(html, "twitter:description") ??
    extractMeta(html, "description");

  const image =
    extractMeta(html, "og:image") ?? extractMeta(html, "twitter:image");

  const site =
    extractMeta(html, "og:site_name") ?? new URL(url).hostname.replace(/^www\./, "");

  const author =
    extractMeta(html, "article:author") ??
    extractMeta(html, "author") ??
    extractMeta(html, "twitter:creator");

  const published_at =
    extractMeta(html, "article:published_time") ??
    extractMeta(html, "og:updated_time");

  const duration = extractMeta(html, "og:video:duration");

  const language =
    META(html, /<html[^>]+lang=["']([^"']+)["']/i) ??
    extractMeta(html, "og:locale");

  const kind = detectKind(url);

  const text = extractReadableText(html);

  return {
    url,
    fetched_at: new Date().toISOString(),
    site,
    kind,
    title,
    description,
    image,
    author,
    published_at,
    duration,
    language,
    text,
  };
}

/** Render a SourceSnapshot into a compact string for LLM context. */
export function snapshotForPrompt(snap: SourceSnapshot): string {
  const parts: string[] = [];
  parts.push(`ИСТОЧНИК: ${snap.url}`);
  if (snap.site) parts.push(`Сайт: ${snap.site}`);
  if (snap.kind) parts.push(`Тип: ${snap.kind}`);
  if (snap.title) parts.push(`Заголовок: ${snap.title}`);
  if (snap.author) parts.push(`Автор: ${snap.author}`);
  if (snap.published_at) parts.push(`Опубликовано: ${snap.published_at}`);
  if (snap.duration) parts.push(`Длительность: ${snap.duration}s`);
  if (snap.description) parts.push(`Описание: ${snap.description}`);
  if (snap.text) {
    // Keep it tight — most LLMs do fine with 1-2 KB of context.
    const body = snap.text.slice(0, 1800);
    parts.push(`Содержание (фрагмент):\n${body}`);
  }
  return parts.join("\n");
}
