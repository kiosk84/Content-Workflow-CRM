"use client";

import { Search, Plus, Command as CommandIcon, Link2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { PLATFORMS } from "@/types/content";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { createCardFromUrl, isUrl } from "@/lib/import-client";

interface Props {
  onOpenPalette?: () => void;
}

export function Topbar({ onOpenPalette }: Props) {
  const platformFilter = useStore((s) => s.platformFilter);
  const setPlatformFilter = useStore((s) => s.setPlatformFilter);
  const createCard = useStore((s) => s.createCard);
  const setActiveCard = useStore((s) => s.setActiveCard);
  const search = useStore((s) => s.search);
  const setSearch = useStore((s) => s.setSearch);
  const setPaletteOpen = useStore((s) => s.setPaletteOpen);
  const [quick, setQuick] = useState("");

  const handleQuickAdd = () => {
    const raw = quick.trim();
    if (!raw) return;
    if (isUrl(raw)) {
      setQuick("");
      void createCardFromUrl(raw);
      return;
    }
    const c = createCard({ title: raw, stage: "idea" });
    setQuick("");
    setActiveCard(c.id);
  };

  const looksLikeUrl = isUrl(quick);

  return (
    <div className="sticky top-0 z-20 flex flex-col gap-3 border-b border-border bg-background/80 px-5 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-[15px] font-semibold tracking-tight">
            Контент-доска
          </h1>
          <p className="text-[11px] text-muted-foreground">
            Идеи → черновики → сценарии → публикации
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={search}
              data-shortcut="search"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по карточкам…"
              className="input pl-7 pr-10 py-1.5 w-56"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded bg-muted px-1 py-0.5 text-[10px] text-muted-foreground">
              /
            </kbd>
          </div>

          <button
            onClick={() => (onOpenPalette ? onOpenPalette() : setPaletteOpen(true))}
            className="hidden md:inline-flex btn-outline h-8"
            title="Командная панель (⌘K)"
          >
            <CommandIcon size={13} />
            Действия
            <kbd className="ml-1 rounded bg-muted px-1 py-0.5 text-[10px]">⌘K</kbd>
          </button>

          <div className="relative hidden md:block">
            {looksLikeUrl && (
              <Link2
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-violet-400"
              />
            )}
            <input
              value={quick}
              onChange={(e) => setQuick(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleQuickAdd();
              }}
              placeholder="Идея или https://… URL"
              className={cn(
                "input py-1.5 w-60",
                looksLikeUrl ? "pl-7 pr-3" : "px-3"
              )}
            />
          </div>

          <button
            className="btn-primary"
            onClick={handleQuickAdd}
            title={
              looksLikeUrl
                ? "Импорт по ссылке — AI проанализирует источник"
                : "Создать новую идею"
            }
          >
            {looksLikeUrl ? <Link2 size={13} /> : <Plus size={13} />}
            {looksLikeUrl ? "Импорт" : "Новая"}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <FilterChip
          active={platformFilter === "all"}
          onClick={() => setPlatformFilter("all")}
          label="Все платформы"
        />
        {PLATFORMS.map((p) => (
          <FilterChip
            key={p.id}
            active={platformFilter === p.id}
            onClick={() => setPlatformFilter(p.id)}
            label={p.label}
            color={p.color}
          />
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
        active
          ? "border-ring bg-accent/20 text-foreground"
          : "border-border bg-muted/30 text-muted-foreground hover:text-foreground"
      )}
    >
      {color && (
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: color, boxShadow: `0 0 6px ${color}80` }}
        />
      )}
      {label}
    </button>
  );
}
