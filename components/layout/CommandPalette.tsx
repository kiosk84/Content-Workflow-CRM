"use client";

import { Command } from "cmdk";
import { useMemo, useState } from "react";
import {
  Plus,
  Youtube,
  Instagram,
  AtSign,
  Layers,
  Settings,
  Search,
  Sparkles,
  Link2,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { PLATFORMS, STAGES } from "@/types/content";
import type { Platform } from "@/types/content";
import { cn } from "@/lib/utils";
import { createCardFromUrl, isUrl } from "@/lib/import-client";

interface Props {
  onOpenSettings: () => void;
}

export function CommandPalette({ onOpenSettings }: Props) {
  const open = useStore((s) => s.paletteOpen);
  const setOpen = useStore((s) => s.setPaletteOpen);
  const cards = useStore((s) => s.cards);
  const createCard = useStore((s) => s.createCard);
  const setActiveCard = useStore((s) => s.setActiveCard);
  const setPlatformFilter = useStore((s) => s.setPlatformFilter);
  const setAIOpen = useStore((s) => s.setAIOpen);

  const cardItems = useMemo(() => cards.slice(0, 30), [cards]);
  const [query, setQuery] = useState("");
  const queryIsUrl = isUrl(query);

  if (!open) return null;

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const iconFor = (id: Platform) =>
    id === "youtube"
      ? Youtube
      : id === "instagram"
        ? Instagram
        : id === "threads"
          ? AtSign
          : Layers;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={close}
      />
      <div className="fixed left-1/2 top-[15%] z-50 w-[min(92vw,680px)] -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-background shadow-panel animate-fadeIn">
        <Command
          className="text-sm"
          label="Command palette"
          shouldFilter
          loop
        >
          <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
            <Search size={14} className="text-muted-foreground" />
            <Command.Input
              autoFocus
              value={query}
              onValueChange={setQuery}
              placeholder="Поиск, действие или вставь URL…"
              className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground/70"
            />
            <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              ESC
            </kbd>
          </div>
          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="px-3 py-6 text-center text-xs text-muted-foreground">
              Ничего не найдено
            </Command.Empty>

            {queryIsUrl && (
              <Command.Group heading="Импорт по ссылке">
                <Item
                  icon={<Link2 size={13} />}
                  label={`Создать карточку из ${shortHost(query)}`}
                  sublabel="AI автоматически проанализирует источник"
                  onSelect={() => {
                    void createCardFromUrl(query);
                    close();
                  }}
                />
              </Command.Group>
            )}

            <Command.Group heading="Действия">
              <Item
                icon={<Plus size={13} />}
                label="Создать новую идею"
                hint="N"
                onSelect={() => {
                  const c = createCard({ title: "Новая идея", stage: "idea" });
                  close();
                  setActiveCard(c.id);
                }}
              />
              <Item
                icon={<Sparkles size={13} />}
                label="Открыть AI-помощник для активной карточки"
                onSelect={() => {
                  setAIOpen(true);
                  close();
                }}
              />
              <Item
                icon={<Settings size={13} />}
                label="Настройки"
                onSelect={() => {
                  onOpenSettings();
                  close();
                }}
              />
            </Command.Group>

            <Command.Group heading="Фильтры платформ">
              <Item
                icon={<Layers size={13} />}
                label="Все платформы"
                onSelect={() => {
                  setPlatformFilter("all");
                  close();
                }}
              />
              {PLATFORMS.map((p) => {
                const Icon = iconFor(p.id);
                return (
                  <Item
                    key={p.id}
                    icon={<Icon size={13} />}
                    label={`Только ${p.label}`}
                    onSelect={() => {
                      setPlatformFilter(p.id);
                      close();
                    }}
                  />
                );
              })}
            </Command.Group>

            <Command.Group heading={`Карточки (${cardItems.length})`}>
              {cardItems.map((c) => {
                const stage = STAGES.find((s) => s.id === c.stage);
                return (
                  <Item
                    key={c.id}
                    icon={<span className="text-[12px]">{stage?.icon}</span>}
                    label={c.title || "Без названия"}
                    sublabel={stage?.title}
                    onSelect={() => {
                      setActiveCard(c.id);
                      close();
                    }}
                  />
                );
              })}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </>
  );
}

function shortHost(u: string) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return "ссылки";
  }
}

function Item({
  icon,
  label,
  sublabel,
  hint,
  onSelect,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  hint?: string;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5",
        "text-foreground/90 aria-selected:bg-accent/20 aria-selected:text-foreground"
      )}
    >
      <span className="flex h-5 w-5 items-center justify-center text-muted-foreground">
        {icon}
      </span>
      <span className="truncate">{label}</span>
      {sublabel && (
        <span className="ml-1 truncate text-[11px] text-muted-foreground">
          · {sublabel}
        </span>
      )}
      {hint && (
        <kbd className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
          {hint}
        </kbd>
      )}
    </Command.Item>
  );
}
