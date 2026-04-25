import type { ContentCard, Platform } from "@/types/content";
import { stripHtml } from "@/lib/prompts";

/** Output that we send to n8n in the `payloads[platform]` slot. */
export interface PlatformPayload {
  platform: Platform;
  caption: string;
  hashtags: string[];
  body: string;
  /** "video" for Reels/Shorts-class, "post" for text/carousel feeds. */
  format: "video" | "post";
  limits: { caption_max: number; hashtags_max: number };
  meta?: Record<string, unknown>;
}

export interface PublishEnvelope {
  run_id: string;
  card: {
    id: string;
    title: string;
    idea: string;
    script_html: string;
    script_text: string;
    priority: string;
    deadline: string | null;
    tags: string[];
    stage: string;
    updated_at: string;
    url?: string;
  };
  platforms: Platform[];
  payloads: Record<Platform, PlatformPayload>;
  requested_at: string;
}

const LIMITS: Record<
  Platform,
  { caption_max: number; hashtags_max: number; format: "video" | "post" }
> = {
  instagram: { caption_max: 2200, hashtags_max: 30, format: "video" },
  youtube: { caption_max: 5000, hashtags_max: 15, format: "video" },
  threads: { caption_max: 500, hashtags_max: 10, format: "post" },
  vk: { caption_max: 4000, hashtags_max: 20, format: "post" },
};

function extractHashtags(text: string, tags: string[]): string[] {
  const fromTags = tags.map((t) => (t.startsWith("#") ? t : `#${t}`));
  const inText = text.match(/#[\w\u0400-\u04FF]+/g) ?? [];
  return Array.from(new Set([...fromTags, ...inText]));
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

export function buildPayloadForPlatform(
  card: ContentCard,
  platform: Platform
): PlatformPayload {
  const { caption_max, hashtags_max, format } = LIMITS[platform];
  const scriptText = stripHtml(card.script_text || "");
  const body = scriptText || card.idea_text || card.title;

  const rawHashtags = extractHashtags(
    `${card.title} ${scriptText} ${card.idea_text}`,
    card.tags
  ).slice(0, hashtags_max);

  let caption = "";
  switch (platform) {
    case "instagram":
    case "youtube":
      caption = [card.title, scriptText].filter(Boolean).join("\n\n");
      break;
    case "threads":
      caption = [card.title, card.idea_text].filter(Boolean).join(" — ");
      break;
    case "vk":
      caption = [card.title, scriptText || card.idea_text]
        .filter(Boolean)
        .join("\n\n");
      break;
  }

  caption = truncate(caption, caption_max);

  return {
    platform,
    caption,
    hashtags: rawHashtags,
    body,
    format,
    limits: { caption_max, hashtags_max },
    meta: platform === "youtube" ? { kind: "short" } : undefined,
  };
}

export function buildPublishEnvelope(
  card: ContentCard,
  platforms: Platform[],
  opts: { runId: string; cardUrl?: string }
): PublishEnvelope {
  const payloads = {} as Record<Platform, PlatformPayload>;
  for (const p of platforms) {
    payloads[p] = buildPayloadForPlatform(card, p);
  }
  return {
    run_id: opts.runId,
    card: {
      id: card.id,
      title: card.title,
      idea: card.idea_text,
      script_html: card.script_text,
      script_text: stripHtml(card.script_text || ""),
      priority: card.priority,
      deadline: card.deadline,
      tags: card.tags,
      stage: card.stage,
      updated_at: card.updated_at,
      url: opts.cardUrl,
    },
    platforms,
    payloads,
    requested_at: new Date().toISOString(),
  };
}
