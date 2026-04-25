"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X, Sparkles, Trash2, Clock, Tag as TagIcon } from "lucide-react";
import type { Editor } from "@tiptap/react";
import { useStore } from "@/lib/store";
import { PLATFORMS, PRIORITIES, STAGES } from "@/types/content";
import type { Platform, Priority, Stage } from "@/types/content";
import { ScriptEditor } from "./ScriptEditor";
import { AIChatPanel } from "@/components/ai/AIChatPanel";
import { cn, relativeTime } from "@/lib/utils";

export function CardPanel() {
  const activeCardId = useStore((s) => s.activeCardId);
  const setActiveCard = useStore((s) => s.setActiveCard);
  const cards = useStore((s) => s.cards);
  const updateCard = useStore((s) => s.updateCard);
  const deleteCard = useStore((s) => s.deleteCard);
  const aiOpen = useStore((s) => s.aiOpen);
  const setAIOpen = useStore((s) => s.setAIOpen);

  const card = useMemo(
    () => cards.find((c) => c.id === activeCardId) ?? null,
    [cards, activeCardId]
  );

  const [tab, setTab] = useState<"idea" | "script" | "meta">("idea");
  const [local, setLocal] = useState(card);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editorRef = useRef<Editor | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    setLocal(card);
  }, [card]);

  useEffect(() => {
    if (!local || !card || local.id !== card.id) return;
    if (timer.current) clearTimeout(timer.current);
    const hasChanges =
      local.title !== card.title ||
      local.idea_text !== card.idea_text ||
      local.script_text !== card.script_text ||
      local.priority !== card.priority ||
      local.stage !== card.stage ||
      JSON.stringify(local.platform) !== JSON.stringify(card.platform) ||
      JSON.stringify(local.tags) !== JSON.stringify(card.tags);
    if (!hasChanges) return;
    timer.current = setTimeout(() => {
      updateCard(local.id, local);
      setSavedAt(new Date().toISOString());
    }, 800);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [local, card, updateCard]);

  if (!activeCardId) return null;
  if (!card || !local) return null;

  const togglePlatform = (p: Platform) => {
    const has = local.platform.includes(p);
    setLocal({
      ...local,
      platform: has
        ? local.platform.filter((x) => x !== p)
        : [...local.platform, p],
    });
  };

  const applyScript = (text: string, mode: "append" | "replace" = "append") => {
    const editor = editorRef.current;
    if (!editor) return;
    if (mode === "replace") {
      editor.commands.clearContent();
    } else {
      editor.commands.focus("end");
      if (editor.getHTML() && editor.getHTML() !== "<p></p>") {
        editor.commands.enter();
      }
    }
    for (const line of text.split("\n")) {
      editor.commands.insertContent(line);
      editor.commands.enter();
    }
    const html = editor.getHTML();
    setLocal({ ...local, script_text: html });
    setTab("script");
  };

  return (
    <>
      <div
        className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm animate-fadeIn"
        onClick={() => setActiveCard(null)}
      />
      <aside
        className={cn(
          "fixed right-0 top-0 z-40 flex h-screen w-full flex-col border-l border-border bg-background shadow-panel animate-slideIn",
          aiOpen ? "md:w-[min(95vw,1200px)]" : "md:w-[min(60vw,720px)]"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
          <select
            value={local.stage}
            onChange={(e) =>
              setLocal({ ...local, stage: e.target.value as Stage })
            }
            className="rounded-md bg-muted px-2 py-1 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring"
          >
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.icon} {s.title}
              </option>
            ))}
          </select>

          <div className="ml-2 text-[11px] text-muted-foreground">
            {savedAt ? (
              <span className="inline-flex items-center gap-1">
                <Clock size={11} />
                сохранено {relativeTime(savedAt)}
              </span>
            ) : (
              <span>авто-сохранение</span>
            )}
          </div>

          <button
            onClick={() => setAIOpen(!aiOpen)}
            className={cn(
              "ml-auto btn",
              aiOpen
                ? "bg-accent/20 border border-ring text-foreground"
                : "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:opacity-90"
            )}
          >
            <Sparkles size={14} />
            AI помощник
          </button>

          <button
            className="btn-ghost"
            onClick={() => {
              if (confirm("Удалить карточку?")) {
                deleteCard(card.id);
              }
            }}
            title="Удалить"
          >
            <Trash2 size={14} />
          </button>
          <button
            className="btn-ghost"
            onClick={() => setActiveCard(null)}
            title="Закрыть"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1">
          {/* Left: content */}
          <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
            <div className="px-5 pt-5">
              <input
                value={local.title}
                onChange={(e) =>
                  setLocal({ ...local, title: e.target.value })
                }
                placeholder="Заголовок идеи…"
                className="w-full bg-transparent text-2xl font-semibold outline-none placeholder:text-muted-foreground/60"
              />

              {/* Meta */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {PLATFORMS.map((p) => {
                  const active = local.platform.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => togglePlatform(p.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-colors"
                      )}
                      style={{
                        borderColor: active ? p.color : "hsl(var(--border))",
                        background: active ? `${p.color}20` : "transparent",
                        color: active ? p.color : "hsl(var(--muted-foreground))",
                      }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: p.color }}
                      />
                      {p.label}
                    </button>
                  );
                })}
                <select
                  value={local.priority}
                  onChange={(e) =>
                    setLocal({
                      ...local,
                      priority: e.target.value as Priority,
                    })
                  }
                  className="rounded-full border border-border bg-muted/30 px-2.5 py-1 text-[11px] text-muted-foreground outline-none"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p.id} value={p.id}>
                      Приоритет: {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <TagEditor
                tags={local.tags}
                onChange={(tags) => setLocal({ ...local, tags })}
              />
            </div>

            {/* Tabs */}
            <div className="mt-5 border-b border-border px-5">
              <div className="flex gap-1">
                <TabBtn
                  active={tab === "idea"}
                  onClick={() => setTab("idea")}
                  label="Идея"
                />
                <TabBtn
                  active={tab === "script"}
                  onClick={() => setTab("script")}
                  label="Сценарий"
                />
                <TabBtn
                  active={tab === "meta"}
                  onClick={() => setTab("meta")}
                  label="Детали"
                />
              </div>
            </div>

            <div className="flex-1 px-5 py-4">
              {tab === "idea" && (
                <textarea
                  value={local.idea_text}
                  onChange={(e) =>
                    setLocal({ ...local, idea_text: e.target.value })
                  }
                  placeholder="Опиши идею: о чём, для кого, какой формат, какой результат?"
                  className="textarea min-h-[240px] w-full"
                />
              )}

              {tab === "script" && (
                <ScriptEditor
                  docKey={local.id}
                  value={local.script_text}
                  onChange={(html) =>
                    setLocal((prev) =>
                      prev ? { ...prev, script_text: html } : prev
                    )
                  }
                  onEditorReady={(editor) => {
                    editorRef.current = editor;
                  }}
                />
              )}

              {tab === "meta" && (
                <div className="grid gap-4 text-sm">
                  <label className="grid gap-1.5">
                    <span className="text-xs text-muted-foreground">
                      Дедлайн
                    </span>
                    <input
                      type="date"
                      value={local.deadline ?? ""}
                      onChange={(e) =>
                        setLocal({
                          ...local,
                          deadline: e.target.value || null,
                        })
                      }
                      className="input max-w-xs"
                    />
                  </label>

                  <div className="grid gap-1.5">
                    <span className="text-xs text-muted-foreground">
                      История
                    </span>
                    <div className="rounded-md border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
                      Создана: {new Date(card.created_at).toLocaleString("ru-RU")}
                      <br />
                      Обновлена: {new Date(card.updated_at).toLocaleString("ru-RU")}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: AI chat panel */}
          {aiOpen && (
            <div className="hidden w-[420px] shrink-0 border-l border-border bg-background/60 md:flex md:flex-col">
              <AIChatPanel card={local} onApplyToScript={applyScript} />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function TabBtn({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-t-md border-b-2 px-3 py-2 text-sm transition-colors",
        active
          ? "border-accent text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}

function TagEditor({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (t: string[]) => void;
}) {
  const [val, setVal] = useState("");
  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5">
      <TagIcon size={13} className="text-muted-foreground" />
      {tags.map((t) => (
        <span
          key={t}
          className="chip cursor-pointer hover:text-foreground"
          onClick={() => onChange(tags.filter((x) => x !== t))}
        >
          #{t} ×
        </span>
      ))}
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && val.trim()) {
            e.preventDefault();
            const t = val.trim().replace(/^#/, "");
            if (!tags.includes(t)) onChange([...tags, t]);
            setVal("");
          }
        }}
        placeholder="добавить тег…"
        className="bg-transparent text-xs text-muted-foreground outline-none placeholder:text-muted-foreground/50"
      />
    </div>
  );
}
