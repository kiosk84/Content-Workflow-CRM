import { NextRequest, NextResponse } from "next/server";
import { fetchSnapshot } from "@/lib/url-importer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { url?: string };
  const url = (body.url ?? "").trim();
  if (!url) {
    return NextResponse.json(
      { ok: false, error: "url обязателен" },
      { status: 400 }
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const snapshot = await fetchSnapshot(url, controller.signal);
    return NextResponse.json({ ok: true, snapshot });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "unknown",
      },
      { status: 502 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
