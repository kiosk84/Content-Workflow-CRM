"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { publishCard } from "@/lib/publish-client";
import { toast } from "sonner";

/**
 * Watches card stages and — when `settings.auto_publish_on_ready` is on —
 * fires an n8n publish when a card transitions into the "ready" stage.
 */
export function useAutoPublish() {
  const cards = useStore((s) => s.cards);
  const autoPublish = useStore((s) => s.settings.auto_publish_on_ready);
  const prevStages = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!autoPublish) {
      const snapshot: Record<string, string> = {};
      for (const c of cards) snapshot[c.id] = c.stage;
      prevStages.current = snapshot;
      return;
    }

    const next: Record<string, string> = {};
    for (const c of cards) {
      next[c.id] = c.stage;
      const prev = prevStages.current[c.id];
      if (prev && prev !== "ready" && c.stage === "ready") {
        if (c.platform.length === 0) {
          toast.message(`«${c.title}» в «Готово», но платформы не выбраны`);
        } else {
          toast.message(`Авто-публикация: «${c.title}» → n8n`);
          void publishCard(c, c.platform, { silent: true });
        }
      }
    }
    prevStages.current = next;
  }, [cards, autoPublish]);
}
