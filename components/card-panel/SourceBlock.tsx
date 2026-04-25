"use client";

import { useState } from "react";
import { Link2, RefreshCw, ExternalLink, X, Sparkles } from "lucide-react";
import type { ContentCard } from "@/types/content";
import { useStore } from "@/lib/store";
import { fetchSnapshot } from "@/lib/import-client";
import { cn } from "@/lib/utils";

interface Props {
  card: ContentCard;
  onRemix?: () => void;
}

export function SourceBlock({ card, onRemix }: Props) {
  const setCardSource = useStore((s) => s.setCardSource);
  const updateCard = useStore((s) => s.updateCard);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState("");

  const snap = card.source_snapshot;

  const reload = async () => {
    if (!card.source_url) return;
    setBusy(true);
    const s = await fetchSnapshot(card.source_url);
    setBusy(false);
    if (s) setCardSource(card.id, s);
  };

  const attach = async () => {
    const url = draft.trim();
    if (!url) return;
    setBusy(true);
    const s = await fetchSnapshot(url);
    setBusy(false);
    if (s) {
      setCardSource(card.id, s);
      setDraft("");
    }
  };

  const detach = () => {
    updateCard(card.id, {
      source_url: undefined,
      source_snapshot: undefined,
    });
  };

  if (!snap) {
    return (
      <div className="rounded-lg border border-dashed border-border/80 bg-background/30 p-3">
        <div className="flex items-center gap-2">
          <Link2 size={14} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Вставь ссылку на пост / видео / статью — AI проанализирует и
            переработает под твой контент.
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && attach()}
            placeholder="https://youtube.com/watch?v=…"
            className="input flex-1 py-1.5 text-xs"
          />
          <button
            onClick={attach}
            disabled={busy || !draft.trim()}
            className={cn(
              "btn-outline h-8 text-xs",
              (busy || !draft.trim()) && "opacity-60 pointer-events-none"
            )}
          >
            <Link2 size={12} />
            {busy ? "Разбор…" : "Добавить"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 p-3">
      <div className="flex items-start gap-3">
        {snap.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={snap.image}
            alt=""
            className="h-12 w-12 flex-shrink-0 rounded object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded bg-violet-500/15 text-violet-300">
            <Link2 size={16} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
            <span>{kindLabel(snap.kind)}</span>
            {snap.site && <span>· {snap.site}</span>}
            {snap.author && <span>· {snap.author}</span>}
          </div>
          <div className="mt-0.5 line-clamp-1 text-[13px] font-medium">
            {snap.title || snap.url}
          </div>
          {snap.description && (
            <div className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
              {snap.description}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex gap-1">
            <a
              href={snap.url}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost h-7 w-7 justify-center p-0"
              title="Открыть источник"
            >
              <ExternalLink size={12} />
            </a>
            <button
              className="btn-ghost h-7 w-7 justify-center p-0"
              onClick={reload}
              disabled={busy}
              title="Перечитать"
            >
              <RefreshCw size={12} className={busy ? "animate-spin" : ""} />
            </button>
            <button
              className="btn-ghost h-7 w-7 justify-center p-0"
              onClick={detach}
              title="Убрать источник"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      </div>

      {onRemix && (
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={onRemix}
            className="btn h-8 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:opacity-90"
            title="AI сделает ремикс источника под твои платформы"
          >
            <Sparkles size={13} />
            Переработать в новый пост
          </button>
          <span className="text-[10px] text-muted-foreground">
            AI-ассистент уже видит источник в контексте
          </span>
        </div>
      )}
    </div>
  );
}

function kindLabel(k: string) {
  switch (k) {
    case "youtube":
      return "YouTube";
    case "social":
      return "Соцсеть";
    case "article":
      return "Статья";
    default:
      return "Страница";
  }
}
