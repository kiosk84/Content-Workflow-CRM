import { NextResponse } from "next/server";
import { getSupabase, supabaseEnabled } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!supabaseEnabled()) {
    return NextResponse.json({ enabled: false }, { status: 501 });
  }
  const sb = getSupabase();
  if (!sb) return NextResponse.json({ enabled: false }, { status: 501 });
  const body = await req.json();
  const { data, error } = await sb
    .from("content_cards")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", params.id)
    .select()
    .single();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ card: data });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  if (!supabaseEnabled()) {
    return NextResponse.json({ enabled: false }, { status: 501 });
  }
  const sb = getSupabase();
  if (!sb) return NextResponse.json({ enabled: false }, { status: 501 });
  const { error } = await sb
    .from("content_cards")
    .delete()
    .eq("id", params.id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
