"use client";

import {
  Layers,
  Inbox,
  Settings,
  Sparkles,
  Youtube,
  Instagram,
  AtSign,
  Command as CommandIcon,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { PLATFORMS } from "@/types/content";
import { cn } from "@/lib/utils";

interface Props {
  onOpenSettings?: () => void;
}

export function Sidebar({ onOpenSettings }: Props) {
  const platformFilter = useStore((s) => s.platformFilter);
  const setPlatformFilter = useStore((s) => s.setPlatformFilter);
  const cards = useStore((s) => s.cards);
  const setPaletteOpen = useStore((s) => s.setPaletteOpen);
  const settings = useStore((s) => s.settings);

  const countByPlatform = (p: string) =>
    cards.filter((c) => c.platform.includes(p as never)).length;
  const readyCount = cards.filter((c) => c.stage === "ready").length;

  return (
    <aside className="hidden md:flex h-screen w-60 shrink-0 flex-col border-r border-border bg-[hsl(0_0%_5%)]">
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 via-fuchsia-500 to-rose-500 text-white shadow-[0_4px_20px_-6px_rgba(168,85,247,0.6)]">
          <Sparkles size={16} />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight">
            ContentFlow
          </div>
          <div className="text-[11px] text-muted-foreground">
            Workflow Studio
          </div>
        </div>
      </div>

      <button
        onClick={() => setPaletteOpen(true)}
        className="mx-3 mb-2 flex items-center gap-2 rounded-md border border-border bg-muted/20 px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted/40 hover:text-foreground"
      >
        <CommandIcon size={13} />
        Поиск / действия
        <span className="ml-auto flex items-center gap-0.5 text-[10px]">
          <kbd className="rounded bg-background px-1 py-0.5">⌘</kbd>
          <kbd className="rounded bg-background px-1 py-0.5">K</kbd>
        </span>
      </button>

      <nav className="px-2 pt-1">
        <NavLabel>Навигация</NavLabel>
        <NavBtn active icon={Layers} label="Доска" badge={cards.length} />
        <NavBtn icon={Inbox} label="Идеи" badge={cards.filter((c) => c.stage === "idea").length} />
        <NavBtn
          icon={Settings}
          label="Настройки"
          onClick={onOpenSettings}
        />
      </nav>

      <div className="px-2 pt-5">
        <NavLabel>Платформы</NavLabel>

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
        <div className="relative overflow-hidden rounded-lg border border-border bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 p-2.5 leading-snug">
          <div className="flex items-center gap-1.5 text-foreground">
            <Sparkles size={11} className="text-violet-400" />
            <span className="font-medium">AI + n8n</span>
          </div>
          <div className="mt-0.5">
            Готовых к публикации: <b className="text-foreground">{readyCount}</b>
          </div>
          <div className="mt-0.5">
            n8n:{" "}
            <span
              className={cn(
                "inline-flex items-center gap-1",
                settings.n8n_webhook_url ? "text-emerald-400" : "text-amber-400"
              )}
            >
              <span
                className={cn(
                  "inline-block h-1.5 w-1.5 rounded-full",
                  settings.n8n_webhook_url ? "bg-emerald-400" : "bg-amber-400"
                )}
              />
              {settings.n8n_webhook_url ? "подключен" : "demo"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 pb-1">
      {children}
    </div>
  );
}

function NavBtn({
  icon: Icon,
  label,
  active,
  badge,
  onClick,
}: {
  icon: typeof Layers;
  label: string;
  active?: boolean;
  badge?: number;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon size={15} />
      <span>{label}</span>
      {badge != null && (
        <span className="ml-auto rounded bg-background/70 px-1.5 py-0.5 text-[10px] text-muted-foreground">
          {badge}
        </span>
      )}
    </button>
  );
}

function iconFor(id: string) {
  if (id === "youtube") return <Youtube size={11} />;
  if (id === "instagram") return <Instagram size={11} />;
  if (id === "threads") return <AtSign size={11} />;
  if (id === "vk") return <span className="text-[9px]">VK</span>;
  return null;
}
