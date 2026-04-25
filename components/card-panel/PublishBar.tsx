"use client";

import { useState } from "react";
import { Send, Webhook, CheckCircle2, Clock3, AlertTriangle, Settings2 } from "lucide-react";
import type { ContentCard, Platform, PublishStatus } from "@/types/content";
import { PLATFORMS } from "@/types/content";
import { useStore } from "@/lib/store";
import { publishCard } from "@/lib/publish-client";
import { cn } from "@/lib/utils";

interface Props {
  card: ContentCard;
  onOpenSettings?: () => void;
}

export function PublishBar({ card, onOpenSettings }: Props) {
  const settings = useStore((s) => s.settings);
  const [busy, setBusy] = useState(false);

  const platforms = card.platform;
  const hasWebhook = Boolean(settings.n8n_webhook_url);

  const handlePublish = async () => {
    setBusy(true);
    try {
      await publishCard(card, platforms);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-gradient-to-br from-muted/30 to-muted/10 p-3">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/15 text-accent">
          <Webhook size={15} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium leading-tight">
            Публикация через n8n
          </div>
          <div className="text-[11px] text-muted-foreground truncate">
            {hasWebhook
              ? "Webhook настроен — кнопка отправит карточку в ваш сценарий"
              : "Демо-режим: payload сформируется, но никуда не улетит"}
          </div>
        </div>
        <button
          onClick={onOpenSettings}
          className="btn-ghost h-8 px-2"
          title="Настройки n8n"
        >
          <Settings2 size={14} />
        </button>
        <button
          disabled={busy || platforms.length === 0}
          onClick={handlePublish}
          className={cn(
            "btn h-8",
            platforms.length === 0
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-90"
          )}
          title={
            platforms.length === 0
              ? "Добавьте хотя бы одну платформу"
              : "Отправить в n8n"
          }
        >
          <Send size={13} />
          {busy ? "Отправка…" : platforms.length ? `Отправить (${platforms.length})` : "Выберите платформу"}
        </button>
      </div>

      {platforms.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {platforms.map((p) => (
            <PlatformStatusPill key={p} platform={p} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}

function PlatformStatusPill({
  platform,
  card,
}: {
  platform: Platform;
  card: ContentCard;
}) {
  const meta = PLATFORMS.find((x) => x.id === platform)!;
  const status: PublishStatus =
    card.publish_status?.[platform]?.status ?? "idle";

  const label: Record<PublishStatus, string> = {
    idle: "не отправлено",
    pending: "в очереди",
    posted: "отправлено",
    failed: "ошибка",
  };

  const Icon =
    status === "posted"
      ? CheckCircle2
      : status === "pending"
        ? Clock3
        : status === "failed"
          ? AlertTriangle
          : Send;

  const cls =
    status === "posted"
      ? "text-emerald-400"
      : status === "pending"
        ? "text-amber-400"
        : status === "failed"
          ? "text-rose-400"
          : "text-muted-foreground";

  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-2 py-0.5 text-[11px]"
      title={card.publish_status?.[platform]?.error}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: meta.color }}
      />
      <span className="text-foreground">{meta.label}</span>
      <span className={cn("inline-flex items-center gap-0.5", cls)}>
        <Icon size={11} />
        {label[status]}
      </span>
    </div>
  );
}
