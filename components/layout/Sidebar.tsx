"use client";

import {
  Layers,
  Inbox,
  Settings,
  Sparkles,
  Youtube,
  Instagram,
  AtSign,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { PLATFORMS } from "@/types/content";
import { cn } from "@/lib/utils";

const NAV = [
  { id: "board", label: "Доска", icon: Layers },
  { id: "inbox", label: "Идеи", icon: Inbox },
  { id: "settings", label: "Настройки", icon: Settings },
] as const;

export function Sidebar() {
  const platformFilter = useStore((s) => s.platformFilter);
  const setPlatformFilter = useStore((s) => s.setPlatformFilter);
  const cards = useStore((s) => s.cards);

  const countByPlatform = (p: string) =>
    cards.filter((c) => c.platform.includes(p as never)).length;

  return (
    <aside className="hidden md:flex h-screen w-60 shrink-0 flex-col border-r border-border bg-background/80">
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-panel">
          <Sparkles size={16} />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold">ContentFlow</div>
          <div className="text-[11px] text-muted-foreground">
            Workflow Studio
          </div>
        </div>
      </div>

      <nav className="px-2 pt-2">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 pb-1">
          Навигация
        </div>
        {NAV.map((item) => (
          <button
            key={item.id}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
              item.id === "board"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon size={15} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="px-2 pt-5">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 pb-1">
          Платформы
        </div>

        <button
          onClick={() => setPlatformFilter("all")}
          className={cn(
            "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
            platformFilter === "all"
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <span className="flex items-center gap-2">
            <span className="flex h-4 w-4 items-center justify-center rounded-sm bg-gradient-to-br from-neutral-500 to-neutral-700 text-[10px]">
              ∑
            </span>
            Все
          </span>
          <span className="text-[11px] text-muted-foreground">
            {cards.length}
          </span>
        </button>

        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPlatformFilter(p.id)}
            className={cn(
              "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
              platformFilter === p.id
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span className="flex items-center gap-2">
              <span
                className="flex h-4 w-4 items-center justify-center rounded-sm text-[10px] font-semibold"
                style={{
                  background: `${p.color}1f`,
                  color: p.color,
                  boxShadow: `inset 0 0 0 1px ${p.color}55`,
                }}
              >
                {iconFor(p.id)}
              </span>
              {p.label}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {countByPlatform(p.id)}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-auto px-3 py-3 text-[11px] text-muted-foreground">
        <div className="rounded-md border border-border bg-muted/30 p-2.5 leading-snug">
          <div className="font-medium text-foreground mb-0.5">
            ✨ AI помощник
          </div>
          Открой любую карточку и нажми кнопку <b>AI</b>, чтобы получить идею,
          хук или сценарий.
        </div>
      </div>
    </aside>
  );
}

function iconFor(id: string) {
  if (id === "youtube") return <Youtube size={11} />;
  if (id === "instagram") return <Instagram size={11} />;
  if (id === "threads") return <AtSign size={11} />;
  if (id === "vk") return <span className="text-[9px]">VK</span>;
  return null;
}
