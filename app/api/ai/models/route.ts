import { NextRequest, NextResponse } from "next/server";
import {
  listProviderModels,
  resolveProvider,
  type ProviderSettings,
} from "@/lib/ai-providers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    settings?: Partial<ProviderSettings>;
  };
  const resolved = resolveProvider(body.settings);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const models = await listProviderModels(resolved, controller.signal);
    return NextResponse.json({
      ok: true,
      provider: resolved.provider,
      models,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        provider: resolved.provider,
        error: err instanceof Error ? err.message : "unknown",
      },
      { status: 502 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
