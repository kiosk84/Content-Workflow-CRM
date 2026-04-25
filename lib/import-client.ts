"use client";

import { toast } from "sonner";
import type { SourceSnapshot } from "@/types/content";
import { useStore } from "./store";

/**
 * Fetch a URL snapshot via /api/fetch-url.
 * Returns the snapshot or null on failure (toast shown to user).
 */
export async function fetchSnapshot(url: string): Promise<SourceSnapshot | null> {
  const t = toast.loading(`Анализирую ${hostnameOf(url)}…`);
  try {
    const res = await fetch("/api/fetch-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const json = (await res.json()) as {
      ok: boolean;
      snapshot?: SourceSnapshot;
      error?: string;
    };
    if (!json.ok || !json.snapshot) {
      toast.error(`Не удалось открыть ссылку: ${json.error ?? res.status}`, {
        id: t,
      });
      return null;
    }
    toast.success(
      `Источник распознан: ${json.snapshot.title || json.snapshot.site || "готово"}`,
      { id: t }
    );
    return json.snapshot;
  } catch (err) {
    toast.error(`Ошибка: ${err instanceof Error ? err.message : err}`, { id: t });
    return null;
  }
}

/**
 * Create a new card directly from a URL: fetches snapshot, creates card with
 * pre-filled title + idea + source + platform hint.
 */
export async function createCardFromUrl(url: string): Promise<string | null> {
  const snap = await fetchSnapshot(url);
  if (!snap) return null;
  const { createCard, setActiveCard } = useStore.getState();
  const title = snap.title?.slice(0, 100) || snap.site || "Импорт по ссылке";
  const idea = [
    snap.description ?? "",
    snap.text ? `\n\nФрагмент:\n${snap.text.slice(0, 600)}` : "",
  ]
    .join("")
    .trim();

  const platformHint =
    snap.kind === "youtube"
      ? (["youtube"] as const)
      : snap.url.includes("instagram.com")
        ? (["instagram"] as const)
        : snap.url.includes("threads.net")
          ? (["threads"] as const)
          : snap.url.includes("vk.com")
            ? (["vk"] as const)
            : [];

  const card = createCard({
    title,
    idea_text: idea,
    platform: [...platformHint],
    source_url: snap.url,
    source_snapshot: snap,
  });
  setActiveCard(card.id);
  toast.success("Карточка создана из источника — AI уже видит контекст");
  return card.id;
}

function hostnameOf(u: string) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return "ссылку";
  }
}

export function isUrl(s: string): boolean {
  const t = s.trim();
  if (!/^https?:\/\//i.test(t)) return false;
  try {
    new URL(t);
    return true;
  } catch {
    return false;
  }
}
