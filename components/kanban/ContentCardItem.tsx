"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, CheckCircle2, Clock3, AlertTriangle } from "lucide-react";
import type { ContentCard, Platform, PublishStatus } from "@/types/content";
import { PLATFORMS, PRIORITIES } from "@/types/content";
import { useStore } from "@/lib/store";
import { cn, formatDate, relativeTime } from "@/lib/utils";
import { stripHtml } from "@/lib/prompts";

export function ContentCardItem({ card }: { card: ContentCard }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: { stage: card.stage } });

  const setActiveCard = useStore((s) => s.setActiveCard);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priority = PRIORITIES.find((p) => p.id === card.priority);
  const preview =
    stripHtml(card.idea_text).slice(0, 140) ||
    stripHtml(card.script_text).slice(0, 140);
  const primaryColor = card.platform[0]
    ? PLATFORMS.find((p) => p.id === card.platform[0])?.color
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        borderLeftColor: primaryColor ?? "transparent",
      }}
      {...attributes}
      {...listeners}
      onClick={() => setActiveCard(card.id)}
      className={cn(
        "group relative cursor-grab active:cursor-grabbing select-none rounded-lg border border-border border-l-[3px] bg-card p-3 text-sm shadow-card transition-all",
        "hover:bg-card-hover hover:border-ring/60 hover:shadow-[0_6px_24px_-12px_rgba(0,0,0,0.5)]",
        isDragging && "sortable-ghost"
      )}
    >
      {/* Platform strip */}
      <div className="mb-2 flex flex-wrap items-center gap-1">
        {card.platform.map((pid) => {
          const p = PLATFORMS.find((x) => x.id === pid);
          if (!p) return null;
          return (
            <span
              key={pid}
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium"
              style={{
                background: `${p.color}1a`,
                color: p.color,
                boxShadow: `inset 0 0 0 1px ${p.color}40`,
              }}
            >
              {p.label}
            </span>
          );
        })}
        {priority && (
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className={cn("h-1.5 w-1.5 rounded-full", priority.dot)} />
            {priority.label}
          </span>
        )}
      </div>

      <div className="font-medium text-foreground leading-snug">
        {card.title}
      </div>
      {preview && (
        <div className="mt-1 text-[12px] text-muted-foreground leading-snug line-clamp-2">
          {preview}
        </div>
      )}

      {/* Publish status row */}
      {card.platform.length > 0 && card.publish_status && (
        <div className="mt-2 flex flex-wrap gap-1">
          {card.platform.map((pid) => {
            const status = card.publish_status?.[pid]?.status;
            if (!status || status === "idle") return null;
            return <PublishDot key={pid} platform={pid} status={status} />;
          })}
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
        {card.tags.slice(0, 3).map((t) => (
          <span key={t} className="chip">
            #{t}
          </span>
        ))}
        {card.deadline && (
          <span className="chip">
            <Calendar size={10} />
            {formatDate(card.deadline)}
          </span>
        )}
        <span className="ml-auto text-[10px]">{relativeTime(card.updated_at)}</span>
      </div>
    </div>
  );
}

function PublishDot({
  platform,
  status,
}: {
  platform: Platform;
  status: PublishStatus;
}) {
  const meta = PLATFORMS.find((p) => p.id === platform)!;
  const Icon =
    status === "posted"
      ? CheckCircle2
      : status === "pending"
        ? Clock3
        : AlertTriangle;
  const color =
    status === "posted"
      ? "text-emerald-400"
      : status === "pending"
        ? "text-amber-400"
        : "text-rose-400";
  return (
    <span
      className="inline-flex items-center gap-0.5 rounded-full border border-border bg-background/60 px-1.5 py-0.5 text-[10px]"
      title={`${meta.label}: ${status}`}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: meta.color }}
      />
      <Icon size={10} className={color} />
    </span>
  );
}
