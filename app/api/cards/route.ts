import { NextResponse } from "next/server";
import { getSupabase, supabaseEnabled } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!supabaseEnabled()) {
    return NextResponse.json({
      enabled: false,
      cards: [],
      message: "Supabase is not configured. Using local store.",
    });
  }
  const sb = getSupabase();
  if (!sb) return NextResponse.json({ enabled: false, cards: [] });
  const { data, error } = await sb
    .from("content_cards")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) {
    return NextResponse.json(
      { enabled: true, error: error.message },
      { status: 500 }
    );
  }
  return NextResponse.json({ enabled: true, cards: data ?? [] });
}

export async function POST(req: Request) {
  if (!supabaseEnabled()) {
    return NextResponse.json(
      { enabled: false, message: "Supabase is not configured." },
      { status: 501 }
    );
  }
  const sb = getSupabase();
  if (!sb) return NextResponse.json({ enabled: false }, { status: 501 });
  const body = await req.json();
  const { data, error } = await sb
    .from("content_cards")
    .insert(body)
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ card: data });
}
