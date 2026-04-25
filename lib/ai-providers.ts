/**
 * AI provider abstraction.
 *
 * We unify three sources behind a single OpenAI-compatible API surface
 * (OpenAI SDK with a custom `baseURL`):
 *
 *  - OpenAI      — cloud, requires OPENAI_API_KEY
 *  - Ollama      — local daemon at http://localhost:11434 (OpenAI-compat at `/v1`)
 *  - LM Studio   — local desktop app at http://localhost:1234/v1
 */

export type AIProvider = "openai" | "ollama" | "lmstudio";

export interface ProviderSettings {
  ai_provider: AIProvider;
  ai_base_url: string;
  ai_model: string;
  ai_api_key: string;
}

export interface ResolvedProvider {
  provider: AIProvider;
  /** Fully qualified OpenAI-compatible base URL ending with /v1 (for OpenAI SDK). */
  baseURL: string | undefined;
  /** API key used by the SDK — for local providers a placeholder is fine. */
  apiKey: string;
  /** Model id passed to the provider. */
  model: string;
  /** `true` if remote and needs real credentials. */
  isCloud: boolean;
  /** Native root without the /v1 suffix (useful for non-OpenAI routes like Ollama /api/tags). */
  nativeRoot: string | undefined;
}

export const PROVIDER_LABELS: Record<AIProvider, string> = {
  openai: "OpenAI (cloud)",
  ollama: "Ollama (локальная LLM)",
  lmstudio: "LM Studio (локальная LLM)",
};

export const PROVIDER_DEFAULTS: Record<AIProvider, {
  base_url: string;
  model: string;
  docs: string;
}> = {
  openai: {
    base_url: "",
    model: "gpt-4o-mini",
    docs: "https://platform.openai.com/docs/models",
  },
  ollama: {
    base_url: "http://localhost:11434",
    model: "llama3.1",
    docs: "https://github.com/ollama/ollama/blob/main/docs/openai.md",
  },
  lmstudio: {
    base_url: "http://localhost:1234/v1",
    model: "local-model",
    docs: "https://lmstudio.ai/docs/api/openai-compat",
  },
};

function normalizeBaseUrl(provider: AIProvider, raw: string): {
  openai: string | undefined;
  native: string | undefined;
} {
  const url = (raw ?? "").trim().replace(/\/+$/, "");
  if (provider === "openai") {
    return { openai: url || undefined, native: url || undefined };
  }
  if (provider === "ollama") {
    const root = url || "http://localhost:11434";
    return { openai: `${root}/v1`, native: root };
  }
  // lmstudio — already OpenAI-compatible at /v1
  const root = url || "http://localhost:1234/v1";
  const openai = root.endsWith("/v1") ? root : `${root}/v1`;
  const native = openai.replace(/\/v1$/, "");
  return { openai, native };
}

/**
 * Resolve user + server config into the params needed to call the provider.
 * Server-side environment variables can act as fallbacks.
 */
export function resolveProvider(
  settings: Partial<ProviderSettings> | undefined,
  env: NodeJS.ProcessEnv = process.env
): ResolvedProvider {
  const provider: AIProvider =
    (settings?.ai_provider as AIProvider) ??
    ((env.AI_PROVIDER as AIProvider) || "openai");

  const rawBase =
    (settings?.ai_base_url ?? "") ||
    (provider === "openai"
      ? env.OPENAI_BASE_URL ?? ""
      : provider === "ollama"
        ? env.OLLAMA_BASE_URL ?? PROVIDER_DEFAULTS.ollama.base_url
        : env.LM_STUDIO_BASE_URL ?? PROVIDER_DEFAULTS.lmstudio.base_url);

  const { openai: baseURL, native: nativeRoot } = normalizeBaseUrl(
    provider,
    rawBase
  );

  const model =
    (settings?.ai_model ?? "") ||
    (provider === "openai"
      ? env.OPENAI_MODEL ?? PROVIDER_DEFAULTS.openai.model
      : provider === "ollama"
        ? env.OLLAMA_MODEL ?? PROVIDER_DEFAULTS.ollama.model
        : env.LM_STUDIO_MODEL ?? PROVIDER_DEFAULTS.lmstudio.model);

  const isCloud = provider === "openai";

  // Local OpenAI-compat servers usually ignore the key but the SDK demands
  // something non-empty. Use a fixed placeholder.
  const apiKey =
    (settings?.ai_api_key ?? "") ||
    (provider === "openai"
      ? env.OPENAI_API_KEY ?? ""
      : "local-no-auth");

  return { provider, baseURL, apiKey, model, isCloud, nativeRoot };
}

/**
 * Fetch the list of available models from a provider.
 *  - openai / lmstudio: `GET <baseURL>/models`
 *  - ollama: `GET <nativeRoot>/api/tags`
 */
export async function listProviderModels(
  r: ResolvedProvider,
  signal?: AbortSignal
): Promise<string[]> {
  if (r.provider === "ollama") {
    const root = r.nativeRoot ?? PROVIDER_DEFAULTS.ollama.base_url;
    const res = await fetch(`${root}/api/tags`, { signal });
    if (!res.ok) throw new Error(`Ollama ${res.status}`);
    const json = (await res.json()) as {
      models?: { name?: string; model?: string }[];
    };
    return (json.models ?? [])
      .map((m) => m.model || m.name || "")
      .filter(Boolean);
  }

  const baseURL = r.baseURL;
  if (!baseURL) throw new Error("base URL не задан");
  const res = await fetch(`${baseURL}/models`, {
    signal,
    headers: r.apiKey
      ? { Authorization: `Bearer ${r.apiKey}` }
      : undefined,
  });
  if (!res.ok) throw new Error(`${r.provider} ${res.status}`);
  const json = (await res.json()) as {
    data?: { id?: string }[];
  };
  return (json.data ?? []).map((m) => m.id || "").filter(Boolean);
}
