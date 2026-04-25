"use client";

import { toast } from "sonner";
import type { ContentCard, Platform, PublishRecord } from "@/types/content";
import { useStore, type Settings } from "@/lib/store";

interface PublishOptions {
  silent?: boolean;
}

export async function publishCard(
  card: ContentCard,
  platforms: Platform[],
  opts: PublishOptions = {}
): Promise<{ ok: boolean; demo?: boolean; runId?: string }> {
  const setStatus = useStore.getState().setPublishStatus;
  const settings: Settings = useStore.getState().settings;

  if (platforms.length === 0) {
    if (!opts.silent) toast.error("Не выбраны платформы для публикации");
    return { ok: false };
  }

  platforms.forEach((p) => {
    setStatus(card.id, p, { status: "pending" });
  });

  const promise = (async () => {
    const res = await fetch("/api/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        card,
        platforms,
        settings: {
          webhook_url: settings.n8n_webhook_url,
          secret: settings.n8n_secret,
        },
      }),
    });
    const json = await res.json();
    return { res, json };
  })();

  let result: { ok: boolean; demo?: boolean; runId?: string } = { ok: false };

  try {
    if (!opts.silent) {
      await toast.promise(promise, {
        loading: `Отправляю в n8n (${platforms.length} платформ)…`,
        success: (data) => {
          const { res, json } = data;
          if (json?.demo) {
            return "Демо-режим: payload готов (укажи N8N_WEBHOOK_URL для реальной отправки)";
          }
          return res.ok ? "Отправлено в n8n" : `Ошибка ${res.status}`;
        },
        error: "Не удалось отправить в n8n",
      });
    }

    const { res, json } = await promise;
    const posted_at = new Date().toISOString();

    if (res.ok) {
      const record: PublishRecord = json?.demo
        ? { status: "pending", posted_at }
        : { status: "posted", posted_at };
      platforms.forEach((p) => setStatus(card.id, p, record));
      result = { ok: true, demo: !!json?.demo, runId: json?.run_id };
    } else {
      platforms.forEach((p) =>
        setStatus(card.id, p, {
          status: "failed",
          error: json?.error ?? `HTTP ${res.status}`,
        })
      );
    }
  } catch (err) {
    platforms.forEach((p) =>
      setStatus(card.id, p, {
        status: "failed",
        error: err instanceof Error ? err.message : String(err),
      })
    );
  }

  return result;
}
