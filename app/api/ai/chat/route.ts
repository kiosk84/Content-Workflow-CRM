import { NextRequest } from "next/server";
import OpenAI from "openai";
import { buildSystemPrompt } from "@/lib/prompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatPayload {
  messages: { role: "user" | "assistant" | "system"; content: string }[];
  card: {
    title: string;
    idea_text: string;
    script_text: string;
    platform: string[];
  };
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as ChatPayload;
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const system = buildSystemPrompt({
    title: body.card.title,
    idea_text: body.card.idea_text,
    script_text: body.card.script_text,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    platform: body.card.platform as any,
  });

  if (!apiKey) {
    // Demo mode — return a deterministic mock stream so the UI works.
    return streamPlain(mockAnswer(body));
  }

  const client = new OpenAI({ apiKey });
  const completion = await client.chat.completions.create({
    model,
    stream: true,
    temperature: 0.7,
    messages: [
      { role: "system", content: system },
      ...body.messages.map((m) => ({ role: m.role, content: m.content })),
    ],
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of completion) {
          const delta = chunk.choices?.[0]?.delta?.content ?? "";
          if (delta) controller.enqueue(encoder.encode(delta));
        }
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            `\n\n[Ошибка OpenAI: ${err instanceof Error ? err.message : "unknown"}]`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

function chunkString(text: string, size: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < text.length; i += size) {
    out.push(text.slice(i, i + size));
  }
  return out.length ? out : [text];
}

function streamPlain(text: string) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const chunks = chunkString(text, 24);
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
        await new Promise((r) => setTimeout(r, 18));
      }
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

function mockAnswer(body: ChatPayload): string {
  const last = body.messages[body.messages.length - 1]?.content ?? "";
  const title = body.card.title || "без названия";
  const platforms = body.card.platform?.length
    ? body.card.platform.join(", ")
    : "все платформы";

  if (/хук/i.test(last)) {
    return [
      `5 хуков для «${title}» (${platforms}):`,
      "",
      "1. Большинство думают X — но на самом деле Y.",
      "2. За 30 секунд я покажу то, что меняет всё.",
      "3. Если ты до сих пор делаешь это — срочно смотри.",
      "4. Вот как за 1 день я получил результат Z.",
      "5. Не пролистывай — именно это ты искал.",
    ].join("\n");
  }

  if (/структур|scenario|сценар/i.test(last)) {
    return [
      `Структура сценария для «${title}»:`,
      "",
      "Хук (0–3 сек) — резкая фраза, вопрос или цифра.",
      "Проблема (3–10 сек) — боль зрителя, узнаваемая ситуация.",
      "Развитие (10–35 сек) — 2–3 тезиса с примерами.",
      "Пик (35–50 сек) — самый сильный инсайт или демонстрация.",
      "CTA (50–60 сек) — подписка/сохранение/коммент.",
    ].join("\n");
  }

  if (/reels|60|short|адаптир/i.test(last)) {
    return [
      `Адаптация «${title}» под Reels 60 секунд:`,
      "",
      "Сцена 1 (0–3): крупный план, хук-вопрос.",
      "Сцена 2 (3–15): быстрый монтаж проблемы.",
      "Сцена 3 (15–40): три тезиса, текст на экране.",
      "Сцена 4 (40–55): лайфхак/результат.",
      "Сцена 5 (55–60): финал + CTA.",
    ].join("\n");
  }

  if (/сократ|упрост/i.test(last)) {
    return `Короткая версия «${title}»: один сильный тезис + один пример + один призыв. Всё лишнее — в комментарии.`;
  }

  return [
    `(демо-режим — задай OPENAI_API_KEY в .env.local)`,
    "",
    `По карточке «${title}» (${platforms}):`,
    "",
    "• Идея выглядит перспективно. Сфокусируйся на одной боли зрителя.",
    "• Добавь неожиданный поворот в середине.",
    "• Заверши сильным CTA под целевую платформу.",
  ].join("\n");
}
