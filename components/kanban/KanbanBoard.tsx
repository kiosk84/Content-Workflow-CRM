"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useMemo, useState } from "react";
import { STAGES, type Stage } from "@/types/content";
import { useStore } from "@/lib/store";
import { KanbanColumn } from "./KanbanColumn";
import { ContentCardItem } from "./ContentCardItem";

export function KanbanBoard() {
  const cards = useStore((s) => s.cards);
  const platformFilter = useStore((s) => s.platformFilter);
  const moveCard = useStore((s) => s.moveCard);

  const filtered = useMemo(
    () =>
      platformFilter === "all"
        ? cards
        : cards.filter((c) => c.platform.includes(platformFilter)),
    [cards, platformFilter]
  );

  const byStage = useMemo(() => {
    const map = new Map<Stage, typeof cards>();
    for (const s of STAGES) map.set(s.id, []);
    for (const c of filtered) {
      map.get(c.stage)?.push(c);
    }
    return map;
  }, [filtered]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const activeCard = cards.find((c) => c.id === activeId) ?? null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const handleDragStart = (e: DragStartEvent) => {
    setActiveId(String(e.active.id));
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const overId = String(over.id);
    const activeCardId = String(active.id);

    // Dropped on column container
    if (overId.startsWith("col-")) {
      const targetStage = overId.slice(4) as Stage;
      const card = cards.find((c) => c.id === activeCardId);
      if (card && card.stage !== targetStage) {
        moveCard(activeCardId, targetStage);
      }
      return;
    }

    // Dropped on another card — move to that card's column
    const overCard = cards.find((c) => c.id === overId);
    if (overCard) {
      const card = cards.find((c) => c.id === activeCardId);
      if (card && card.stage !== overCard.stage) {
        moveCard(activeCardId, overCard.stage);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-3 overflow-x-auto p-4">
        {STAGES.map((s) => (
          <KanbanColumn
            key={s.id}
            stage={s.id}
            cards={byStage.get(s.id) ?? []}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeCard ? (
          <div className="w-[280px] rotate-[1deg] opacity-95">
            <ContentCardItem card={activeCard} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
