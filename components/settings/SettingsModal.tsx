"use client";

import { useState, useEffect } from "react";
import {
  X,
  Webhook,
  Sparkles,
  BellDot,
  Shield,
  Cpu,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  PROVIDER_DEFAULTS,
  PROVIDER_LABELS,
  type AIProvider,
} from "@/lib/ai-providers";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: Props) {
  const settings = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);
  const [local, setLocal] = useState(settings);
  const [testing, setTesting] = useState(false);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setLocal(settings);
      setAvailableModels([]);
    }
  }, [open, settings]);

  if (!open) return null;

  const save = () => {
    setSettings(local);
    toast.success("Настройки сохранены");
    onClose();
  };

  const setProvider = (p: AIProvider) => {
    const def = PROVIDER_DEFAULTS[p];
    setLocal({
      ...local,
      ai_provider: p,
      // Only overwrite base_url/model if user didn't customize them for this provider.
      ai_base_url: def.base_url,
      ai_model: def.model,
    });
    setAvailableModels([]);
  };

  const fetchModels = async () => {
    setFetchingModels(true);
    try {
      const res = await fetch("/api/ai/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            ai_provider: local.ai_provider,
            ai_base_url: local.ai_base_url,
            ai_api_key: local.ai_api_key,
          },
        }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        models?: string[];
        error?: string;
      };
      if (!json.ok || !json.models) {
        toast.error(`Не удалось получить список: ${json.error ?? res.status}`);
        return;
      }
      if (json.models.length === 0) {
        toast.message("Моделей не найдено. Загрузите их в провайдере.");
      } else {
        toast.success(`Найдено моделей: ${json.models.length}`);
      }
      setAvailableModels(json.models);
    } catch (err) {
      toast.error(`Ошибка: ${err instanceof Error ? err.message : err}`);
    } finally {
      setFetchingModels(false);
    }
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

  const defaults = PROVIDER_DEFAULTS[local.ai_provider];

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,720px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-background shadow-panel animate-fadeIn">
        <div className="flex items-center gap-2 border-b border-border px-5 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/15 text-accent">
            <Shield size={16} />
          </div>
          <div>
            <div className="text-sm font-semibold">Настройки ContentFlow</div>
            <div className="text-[11px] text-muted-foreground">
              AI-провайдер, n8n, авто-публикация
            </div>
          </div>
          <button className="btn-ghost ml-auto" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[72vh] space-y-5 overflow-y-auto px-5 py-4">
          {/* AI Provider */}
          <Section
            icon={<Cpu size={14} />}
            title="AI провайдер"
            subtitle="OpenAI (cloud) или локальные LLM через Ollama / LM Studio"
          >
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(PROVIDER_LABELS) as AIProvider[]).map((p) => {
                const active = local.ai_provider === p;
                return (
                  <button
                    key={p}
                    onClick={() => setProvider(p)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-xs text-left transition",
                      active
                        ? "border-ring bg-accent/15 text-foreground"
                        : "border-border bg-muted/10 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className="font-medium">{PROVIDER_LABELS[p]}</div>
                    <div className="mt-0.5 text-[10px] opacity-70">
                      {p === "openai"
                        ? "облако, нужен API-ключ"
                        : p === "ollama"
                          ? "локально, port 11434"
                          : "локально, port 1234"}
                    </div>
                  </button>
                );
              })}
            </div>

            <label className="grid gap-1">
              <span className="text-[11px] text-muted-foreground">
                Base URL{" "}
                <span className="opacity-60">
                  (дефолт: {defaults.base_url || "SDK default"})
                </span>
              </span>
              <input
                className="input"
                placeholder={defaults.base_url || "https://api.openai.com/v1"}
                value={local.ai_base_url}
                onChange={(e) =>
                  setLocal({ ...local, ai_base_url: e.target.value })
                }
              />
            </label>

            <label className="grid gap-1">
              <span className="text-[11px] text-muted-foreground">
                {local.ai_provider === "openai"
                  ? "API key"
                  : "API key (обычно не нужен для локальных серверов)"}
              </span>
              <input
                className="input"
                type="password"
                placeholder={local.ai_provider === "openai" ? "sk-..." : "— можно оставить пустым —"}
                value={local.ai_api_key}
                onChange={(e) =>
                  setLocal({ ...local, ai_api_key: e.target.value })
                }
              />
            </label>

            <div className="grid gap-1">
              <span className="text-[11px] text-muted-foreground">Model</span>
              <div className="flex items-center gap-2">
                <input
                  className="input flex-1"
                  list="ai-models"
                  placeholder={defaults.model}
                  value={local.ai_model}
                  onChange={(e) =>
                    setLocal({ ...local, ai_model: e.target.value })
                  }
                />
                {availableModels.length > 0 && (
                  <datalist id="ai-models">
                    {availableModels.map((m) => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                )}
                <button
                  onClick={fetchModels}
                  disabled={fetchingModels}
                  className={cn(
                    "btn-outline h-9",
                    fetchingModels && "opacity-60 pointer-events-none"
                  )}
                  title="Запросить список моделей у провайдера"
                >
                  <RefreshCw
                    size={12}
                    className={fetchingModels ? "animate-spin" : ""}
                  />
                  {fetchingModels ? "Загрузка…" : "Подгрузить"}
                </button>
              </div>
              {availableModels.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {availableModels.slice(0, 14).map((m) => (
                    <button
                      key={m}
                      onClick={() => setLocal({ ...local, ai_model: m })}
                      className={cn(
                        "rounded-md border border-border bg-muted/10 px-2 py-0.5 text-[10px] hover:text-foreground",
                        local.ai_model === m
                          ? "border-ring text-foreground bg-accent/20"
                          : "text-muted-foreground"
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {local.ai_provider === "ollama" && (
              <ProviderHint>
                Убедись, что Ollama запущен: <code>ollama serve</code>, и
                загружена модель: <code>ollama pull llama3.1</code>.
                Подробности:{" "}
                <a
                  href={PROVIDER_DEFAULTS.ollama.docs}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent inline-flex items-center gap-0.5"
                >
                  OpenAI-compat docs <ExternalLink size={10} />
                </a>
              </ProviderHint>
            )}

            {local.ai_provider === "lmstudio" && (
              <ProviderHint>
                В LM Studio открой <b>Developer → Local Server</b> и нажми{" "}
                <b>Start Server</b>. Загрузи модель кнопкой «Load». Подробности:{" "}
                <a
                  href={PROVIDER_DEFAULTS.lmstudio.docs}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent inline-flex items-center gap-0.5"
                >
                  docs <ExternalLink size={10} />
                </a>
              </ProviderHint>
            )}
          </Section>

          {/* n8n */}
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

          <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/10 p-3 text-[11px] text-muted-foreground">
            <Sparkles size={12} className="mt-0.5 text-violet-400" />
            <div>
              Все настройки сохраняются в браузере (localStorage). Провайдер
              можно менять на лету — следующий запрос в AI-чате уйдёт в новый
              endpoint.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-border bg-muted/10 px-5 py-3">
          <span className="text-[11px] text-muted-foreground">
            Изменения вступают в силу после «Сохранить»
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

function ProviderHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[11px] text-amber-200/80">
      {children}
    </div>
  );
}
