"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Sparkles, Wand2, Trash2, Copy, Check } from "lucide-react";
import type { AIMessage, ContentCard } from "@/types/content";
import { useStore } from "@/lib/store";
import { QUICK_PROMPTS } from "@/lib/prompts";
import { uid } from "@/lib/utils";

const EMPTY_THREAD: AIMessage[] = [];

interface Props {
  card: ContentCard;
  onApplyToScript: (text: string, mode?: "append" | "replace") => void;
}

export function AIChatPanel({ card, onApplyToScript }: Props) {
  const threads = useStore((s) => s.aiThreads);
  const thread = useMemo(
    () => threads[card.id] ?? EMPTY_THREAD,
    [threads, card.id]
  );
  const appendMsg = useStore((s) => s.appendAIMessage);
  const updateLast = useStore((s) => s.updateLastAIMessage);
  const clearThread = useStore((s) => s.clearAIThread);
  const settings = useStore((s) => s.settings);

  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [thread.length, streaming]);

  const send = async (contentOverride?: string) => {
    const prompt = (contentOverride ?? input).trim();
    if (!prompt || streaming) return;
    const userMsg = {
      id: uid(),
      role: "user" as const,
      content: prompt,
      created_at: new Date().toISOString(),
    };
    appendMsg(card.id, userMsg);
    setInput("");

    const assistantMsg = {
      id: uid(),
      role: "assistant" as const,
      content: "",
      created_at: new Date().toISOString(),
    };
    appendMsg(card.id, assistantMsg);

    setStreaming(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...thread, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          card: {
            title: card.title,
            idea_text: card.idea_text,
            script_text: card.script_text,
            platform: card.platform,
          },
          settings: {
            ai_provider: settings.ai_provider,
            ai_base_url: settings.ai_base_url,
            ai_model: settings.ai_model,
            ai_api_key: settings.ai_api_key,
          },
        }),
      });
      if (!res.ok || !res.body) {
        updateLast(card.id, "⚠️ Ошибка запроса к AI.");
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        updateLast(card.id, acc);
      }
    } catch (err) {
      updateLast(
        card.id,
        `⚠️ ${err instanceof Error ? err.message : "неизвестная ошибка"}`
      );
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
          <Sparkles size={12} />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-medium">AI ассистент</div>
          <div className="text-[10px] text-muted-foreground">
            {providerLabel(settings.ai_provider)} · {settings.ai_model || "не задана"}
          </div>
        </div>
        <button
          className="ml-auto btn-ghost"
          onClick={() => clearThread(card.id)}
          title="Очистить чат"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 border-b border-border px-4 py-2">
        {QUICK_PROMPTS.map((q) => (
          <button
            key={q.label}
            onClick={() => send(q.prompt)}
            disabled={streaming}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-ring hover:bg-accent/10 hover:text-foreground disabled:opacity-60"
          >
            <span>{q.icon}</span>
            {q.label}
          </button>
        ))}
      </div>

      <div
        ref={scrollerRef}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4"
      >
        {thread.length === 0 && (
          <div className="mx-auto max-w-sm rounded-lg border border-dashed border-border p-4 text-center text-[12px] text-muted-foreground">
            <Sparkles size={16} className="mx-auto mb-2 opacity-60" />
            Попроси помочь: разверни идею, напиши хук, структуру сценария или
            адаптируй под Reels.
          </div>
        )}
        {thread.map((m) => (
          <MessageBubble
            key={m.id}
            role={m.role}
            content={m.content}
            onApply={(text) => onApplyToScript(text, "append")}
          />
        ))}
      </div>

      <div className="border-t border-border p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={2}
            placeholder="Спроси AI-ассистента…"
            className="textarea min-h-[44px] max-h-[160px] flex-1"
          />
          <button
            onClick={() => send()}
            disabled={streaming || !input.trim()}
            className="btn-primary h-10 w-10 p-0"
          >
            {streaming ? (
              <span className="flex gap-0.5">
                <span className="h-1 w-1 animate-pulseDot rounded-full bg-white" />
                <span className="h-1 w-1 animate-pulseDot rounded-full bg-white [animation-delay:150ms]" />
                <span className="h-1 w-1 animate-pulseDot rounded-full bg-white [animation-delay:300ms]" />
              </span>
            ) : (
              <Send size={14} />
            )}
          </button>
        </div>
        <div className="mt-1.5 text-[10px] text-muted-foreground">
          Enter — отправить, Shift+Enter — новая строка
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  role,
  content,
  onApply,
}: {
  role: "user" | "assistant" | "system";
  content: string;
  onApply: (text: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap rounded-lg bg-accent/30 px-3 py-2 text-sm">
          {content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1">
      <div className="max-w-[92%] whitespace-pre-wrap rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm leading-relaxed">
        {content || (
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-accent" />
            <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-accent [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-accent [animation-delay:300ms]" />
          </span>
        )}
      </div>
      {content && (
        <div className="flex items-center gap-1.5">
          <button
            className="btn-outline py-1 text-[11px]"
            onClick={() => onApply(content)}
            title="Применить к сценарию"
          >
            <Wand2 size={12} />
            Применить к сценарию
          </button>
          <button
            className="btn-ghost py-1 text-[11px]"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(content);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              } catch {}
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Скопировано" : "Копировать"}
          </button>
        </div>
      )}
    </div>
  );
}

function providerLabel(p: string) {
  if (p === "ollama") return "Ollama";
  if (p === "lmstudio") return "LM Studio";
  return "OpenAI";
}
