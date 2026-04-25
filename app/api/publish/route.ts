import { NextRequest, NextResponse } from "next/server";
import type { ContentCard, Platform } from "@/types/content";
import { buildPublishEnvelope } from "@/lib/publish-adapters";
import { uid } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PublishRequest {
  card: ContentCard;
  platforms?: Platform[];
  settings?: {
    webhook_url?: string;
    secret?: string;
  };
}

export async function POST(req: NextRequest) {
  let body: PublishRequest;
  try {
    body = (await req.json()) as PublishRequest;
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const { card, platforms, settings } = body;
  if (!card?.id || !card.title) {
    return NextResponse.json(
      { error: "card.id and card.title are required" },
      { status: 400 }
    );
  }

  const targetPlatforms = (platforms?.length ? platforms : card.platform) ?? [];
  if (targetPlatforms.length === 0) {
    return NextResponse.json(
      { error: "no platforms selected for publishing" },
      { status: 400 }
    );
  }

  const runId = uid();
  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    req.nextUrl.origin;
  const envelope = buildPublishEnvelope(card, targetPlatforms, {
    runId,
    cardUrl: `${origin}/?card=${card.id}`,
  });

  const webhook = settings?.webhook_url || process.env.N8N_WEBHOOK_URL;
  const secret = settings?.secret || process.env.N8N_WEBHOOK_SECRET;

  if (!webhook) {
    return NextResponse.json({
      enabled: false,
      demo: true,
      run_id: runId,
      envelope,
      message:
        "N8N_WEBHOOK_URL не задан — возвращён подготовленный envelope в демо-режиме.",
    });
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "X-ContentFlow-Secret": secret } : {}),
      },
      body: JSON.stringify(envelope),
      cache: "no-store",
    });

    const contentType = res.headers.get("content-type") ?? "";
    const parsed: unknown = contentType.includes("application/json")
      ? await res.json()
      : await res.text();

    if (!res.ok) {
      return NextResponse.json(
        {
          enabled: true,
          ok: false,
          run_id: runId,
          status: res.status,
          response: parsed,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      enabled: true,
      ok: true,
      run_id: runId,
      response: parsed,
    });
  } catch (err) {
    return NextResponse.json(
      {
        enabled: true,
        ok: false,
        run_id: runId,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 502 }
    );
  }
}
