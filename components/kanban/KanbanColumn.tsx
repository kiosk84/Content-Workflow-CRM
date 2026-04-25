"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import type { ContentCard, Stage } from "@/types/content";
import { STAGES } from "@/types/content";
import { ContentCardItem } from "./ContentCardItem";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function KanbanColumn({
  stage,
  cards,
}: {
  stage: Stage;
  cards: ContentCard[];
}) {
  const meta = STAGES.find((s) => s.id === stage)!;
  const { setNodeRef, isOver } = useDroppable({
    id: `col-${stage}`,
    data: { stage, isColumn: true },
  });
  const createCard = useStore((s) => s.createCard);
  const setActiveCard = useStore((s) => s.setActiveCard);

  return (
    <div className="flex w-[300px] shrink-0 flex-col rounded-xl border border-border bg-background/30">
      <div
        className={cn(
          "sticky top-0 z-10 flex items-center gap-2 rounded-t-xl border-b border-border bg-gradient-to-b px-3 py-2.5 backdrop-blur",
          meta.accent
        )}
      >
        <span className="text-base">{meta.icon}</span>
        <div className="font-medium text-sm text-foreground">{meta.title}</div>
        <span className="ml-auto rounded-full bg-background/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          {cards.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[120px] flex-1 flex-col gap-2 p-2 transition-colors",
          isOver && "drag-over-column bg-accent/5"
        )}
      >
        <SortableContext
          items={cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((c) => (
            <ContentCardItem key={c.id} card={c} />
          ))}
        </SortableContext>

        {cards.length === 0 && (
          <div className="mt-2 flex flex-col items-center gap-2 rounded-lg border border-dashed border-border/80 bg-background/20 p-5 text-center text-[12px] text-muted-foreground">
            <span className="text-2xl opacity-60">{meta.icon}</span>
            <span>Пусто. Перетащи сюда или добавь.</span>
          </div>
        )}

        <button
          onClick={() => {
            const c = createCard({ stage, title: "Новая идея" });
            setActiveCard(c.id);
          }}
          className="mt-1 flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-border py-1.5 text-xs text-muted-foreground transition-colors hover:border-ring hover:bg-muted hover:text-foreground"
        >
          <Plus size={12} />
          Добавить
        </button>
      </div>
    </div>
  );
}
