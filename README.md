# ContentFlow — Content Workflow Studio

**ContentFlow** — это персональная CRM/Kanban-система для блогеров и контент-мейкеров.
Идеи → черновики → сценарии → публикации. С AI-ассистентом, видящим контекст каждой карточки.

Дизайн вдохновлён Notion и N8N: тёмная тема, плотная сетка, плавные анимации.

## Фичи

- 🗂 **Kanban-доска** со стадиями: 💡 Идея → ✏️ Черновик → 🎬 Сценарий → 🎨 Производство → 📤 Готово → ✅ Опубликовано
- 🖱 **Drag & drop** между колонками (`@dnd-kit`)
- 🎨 **Мультиплатформенность**: Instagram · YouTube · Threads · ВКонтакте (цветовые метки и фильтры)
- ✍️ **Rich-text редактор сценариев** на TipTap (жирный, курсив, H2, списки, цитаты)
- ✨ **AI-ассистент** (слайд-панель внутри карточки, не отдельная страница):
  - видит заголовок, идею, платформы и текущий сценарий
  - быстрые промпт-чипы: «Хук», «Структура», «Reels 60 сек», «Разверни идею», «Сократи»
  - стриминг ответов, «Применить к сценарию» одной кнопкой
  - работает в демо-режиме без ключа (детерминированные моки) или с OpenAI (`OPENAI_API_KEY`)
- 💾 Локальное хранилище (Zustand + `persist`) для моментального старта без бэкенда
- ☁️ Опциональная синхронизация через **Supabase** (SQL-схема в `supabase/schema.sql`)
- 🚀 Деплой одной командой на Vercel

## Стек

| Слой | Технология |
|---|---|
| Frontend | Next.js 14 (App Router) · TypeScript · React 18 |
| UI | Tailwind CSS · Lucide Icons |
| DnD | @dnd-kit/core · @dnd-kit/sortable |
| Editor | TipTap (StarterKit + Placeholder) |
| State | Zustand (+ persist) |
| Backend | Next.js API Routes |
| DB | Supabase (PostgreSQL) — опционально |
| AI | OpenAI API (gpt-4o-mini по умолчанию) — опционально |

## Быстрый старт

```bash
git clone https://github.com/kiosk84/Content-Workflow-CRM.git contentflow
cd contentflow
npm install
cp .env.example .env.local   # опционально заполни OPENAI_API_KEY / SUPABASE_*
npm run dev
```

Открой http://localhost:3000. Приложение стартует в **демо-режиме** с несколькими
примерами карточек — все изменения сохраняются в `localStorage`, интернет не нужен.

## Переменные окружения

```ini
# Supabase (опционально, для продакшн-хранения карточек)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# OpenAI (опционально, для живого AI; без него — демо-режим)
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

Без Supabase и без OpenAI приложение полностью работает локально (идеи, Kanban, AI-демо).

## Supabase

Чтобы подключить реальное хранилище, создай проект Supabase и выполни SQL из
[`supabase/schema.sql`](./supabase/schema.sql). Таблицы:

- `content_cards` — карточки контента
- `ai_conversations` — история AI-диалогов

API-роуты `/api/cards`, `/api/cards/[id]` автоматически подхватят Supabase,
если заданы `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Скрипты

```bash
npm run dev     # dev-сервер
npm run build   # production-сборка
npm start       # запуск собранного приложения
npm run lint    # ESLint
```

## Структура

```
contentflow/
├─ app/
│  ├─ page.tsx                      # главная (Kanban)
│  ├─ layout.tsx                    # dark root-layout
│  ├─ globals.css                   # Tailwind + темы
│  └─ api/
│     ├─ cards/route.ts             # GET/POST
│     ├─ cards/[id]/route.ts        # PATCH/DELETE
│     └─ ai/chat/route.ts           # стриминг AI-ответов
├─ components/
│  ├─ layout/ (Sidebar, Topbar)
│  ├─ kanban/ (KanbanBoard, KanbanColumn, ContentCardItem)
│  ├─ card-panel/ (CardPanel, ScriptEditor)
│  └─ ai/       (AIChatPanel)
├─ lib/
│  ├─ store.ts                      # Zustand + localStorage
│  ├─ supabase.ts                   # клиент Supabase
│  ├─ prompts.ts                    # быстрые промпты + системный
│  ├─ seed.ts                       # стартовые карточки
│  └─ utils.ts
├─ supabase/schema.sql              # SQL-миграция
├─ types/content.ts                 # типы + константы платформ/стадий
└─ .env.example
```

## Roadmap (v2)

- Календарь публикаций (Timeline / Calendar view)
- Авто-постинг через N8N → IG/YouTube/VK API
- Аналитика карточек (просмотры, охваты)
- Командная работа + Supabase Realtime
- Мобильное приложение (React Native)

## Лицензия

MIT
