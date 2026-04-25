"use client";

import { useState, useEffect } from "react";
import { X, Webhook, Sparkles, BellDot, Shield } from "lucide-react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: Props) {
  const settings = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);
  const [local, setLocal] = useState(settings);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (open) setLocal(settings);
  }, [open, settings]);

  if (!open) return null;

  const save = () => {
    setSettings(local);
    toast.success("Настройки сохранены");
    onClose();
  };

  const testWebhook = async () => {
    if (!local.n8n_webhook_url) {
      toast.error("Сначала укажи URL вебхука");
      return;
    }
    setTesting(true);
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          card: {
            id: "test",
            title: "ContentFlow → n8n test ping",
            idea_text: "Тестовое сообщение из настроек",
            script_text: "",
            platform: ["youtube"],
            stage: "ready",
            priority: "low",
            deadline: null,
            tags: ["test", "contentflow"],
            attachments: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          platforms: ["youtube"],
          settings: {
            webhook_url: local.n8n_webhook_url,
            secret: local.n8n_secret,
          },
        }),
      });
      const json = await res.json();
      if (res.ok && json.ok) toast.success("Вебхук отвечает — всё ок");
      else if (json.demo) toast.message("Демо-режим: URL не задан на сервере");
      else toast.error(`n8n ответил: ${res.status}`);
    } catch (err) {
      toast.error(`Ошибка: ${err instanceof Error ? err.message : err}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,640px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-background shadow-panel animate-fadeIn">
        <div className="flex items-center gap-2 border-b border-border px-5 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/15 text-accent">
            <Shield size={16} />
          </div>
          <div>
            <div className="text-sm font-semibold">Настройки ContentFlow</div>
            <div className="text-[11px] text-muted-foreground">
              Интеграции, AI-модель, авто-публикация
            </div>
          </div>
          <button className="btn-ghost ml-auto" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[72vh] space-y-5 overflow-y-auto px-5 py-4">
          <Section
            icon={<Webhook size={14} />}
            title="n8n webhook"
            subtitle="URL сценария n8n для публикации карточек"
          >
            <label className="grid gap-1">
              <span className="text-[11px] text-muted-foreground">
                Webhook URL
              </span>
              <input
                className="input"
                placeholder="https://n8n.example.com/webhook/contentflow"
                value={local.n8n_webhook_url}
                onChange={(e) =>
                  setLocal({ ...local, n8n_webhook_url: e.target.value })
                }
              />
            </label>
            <label className="grid gap-1">
              <span className="text-[11px] text-muted-foreground">
                Shared secret (опц., заголовок <code>X-ContentFlow-Secret</code>)
              </span>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={local.n8n_secret}
                onChange={(e) =>
                  setLocal({ ...local, n8n_secret: e.target.value })
                }
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={local.auto_publish_on_ready}
                onChange={(e) =>
                  setLocal({
                    ...local,
                    auto_publish_on_ready: e.target.checked,
                  })
                }
                className="h-4 w-4 accent-accent"
              />
              <span>
                Авто-публикация при переводе карточки в{" "}
                <b>«Готово к публикации»</b>
              </span>
            </label>
            <button
              className={cn(
                "btn-outline w-fit",
                testing && "opacity-60 pointer-events-none"
              )}
              onClick={testWebhook}
            >
              <BellDot size={13} />
              {testing ? "Отправка…" : "Тест: отправить ping"}
            </button>
          </Section>

          <Section
            icon={<Sparkles size={14} />}
            title="AI-модель"
            subtitle="Модель OpenAI для чата и промптов"
          >
            <label className="grid gap-1">
              <span className="text-[11px] text-muted-foreground">Model</span>
              <select
                className="input"
                value={local.openai_model}
                onChange={(e) =>
                  setLocal({ ...local, openai_model: e.target.value })
                }
              >
                <option value="gpt-4o-mini">gpt-4o-mini (дешёвая, быстрая)</option>
                <option value="gpt-4o">gpt-4o (точнее)</option>
                <option value="gpt-4.1-mini">gpt-4.1-mini</option>
                <option value="gpt-5-mini">gpt-5-mini</option>
              </select>
              <span className="text-[11px] text-muted-foreground">
                Реальный выбор модели требует <code>OPENAI_API_KEY</code> в env.
                Без ключа работает демо-режим.
              </span>
            </label>
          </Section>
        </div>

        <div className="flex items-center gap-2 border-t border-border bg-muted/10 px-5 py-3">
          <span className="text-[11px] text-muted-foreground">
            Настройки сохраняются в браузере (localStorage)
          </span>
          <div className="ml-auto flex gap-2">
            <button className="btn-ghost" onClick={onClose}>
              Отмена
            </button>
            <button className="btn-primary" onClick={save}>
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Section({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-2.5 rounded-xl border border-border bg-muted/10 p-4">
      <header className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded bg-accent/15 text-accent">
          {icon}
        </span>
        <div>
          <div className="text-sm font-medium">{title}</div>
          {subtitle && (
            <div className="text-[11px] text-muted-foreground">{subtitle}</div>
          )}
        </div>
      </header>
      <div className="grid gap-2.5">{children}</div>
    </section>
  );
}
