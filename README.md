# ContentFlow — Content Workflow Studio

**ContentFlow** — персональная CRM / Kanban-студия для блогеров и контент-мейкеров.
Идеи → черновики → сценарии → публикации. С AI-ассистентом, который видит контекст
каждой карточки, и авто-публикацией через **n8n** в Instagram, YouTube, Threads и ВКонтакте.

Дизайн вдохновлён Notion и N8N: тёмная тема, плотная сетка, плавные анимации.

- **Работает из коробки без интернета** — демо-режим, стартовые карточки, всё сохраняется в `localStorage`.
- **Подключи свой LLM локально** — через [Ollama](https://ollama.com) или [LM Studio](https://lmstudio.ai).
  Не зависишь от OpenAI и не платишь за API.
- **Подключи своё публикование** — через [n8n](https://n8n.io) и его адаптеры для соцсетей.

---

## ✨ Что умеет

### Kanban и контент
- 🗂 **Доска** со стадиями: 💡 Идея → ✏️ Черновик → 🎬 Сценарий → 🎨 Производство → 📤 Готово → ✅ Опубликовано
- 🖱 **Drag & drop** между колонками (`@dnd-kit`)
- 🎨 **Мультиплатформенность**: Instagram · YouTube · Threads · ВКонтакте (цветовые метки и фильтры)
- 🔎 **Поиск** по заголовкам, идеям, сценариям и тегам (шорткат `/`)
- ⌨️ **Палитра команд** на `Cmd/Ctrl+K`: действия, фильтры, быстрый переход к карточкам
- ⚡ **Шорткаты**: `N` — новая идея, `/` — фокус поиска, `Esc` — закрыть панель

### Карточка и редактор
- ✍️ **Rich-text** на TipTap (жирный/курсив, H2, списки, цитаты, checkbox)
- 🔁 **Автосохранение** (debounce 1.5 с) в локальный стор (+ опц. Supabase)
- 🏷 Теги, платформы, дедлайн, приоритет, вложения

### AI-ассистент (в боковой панели)
- Видит заголовок, идею, платформы, текущий сценарий и (если добавлен) **источник-ссылку**
- Быстрые промпт-чипы: «Хук», «Структура», «Reels 60 сек», «Разверни», «Сократи»,
  **«SEO-заголовок + описание»**, **«Топ-20 хештегов»**, **«Рекомендуй платформы»**,
  **«3 варианта CTA»**, **«Анализ хука»**, **«Ремикс из источника»**
- Стриминг ответов, «Применить к сценарию» одной кнопкой
- **Любой провайдер**: OpenAI / Ollama / LM Studio — переключается в Настройках на лету
- Кнопка «Подгрузить» сама подтянет список моделей провайдера
- **Persona-режимы**: универсальный / маркетолог / SEO-редактор / сценарист / продюсер —
  меняют стиль советов (воронки, SEO, драматургия или контент-план)
- **Алгоритмы соцсетей в системном промпте**: IG тянется на saves+shares,
  YouTube Shorts — на retention, Threads — discourse, VK — репосты/сохранения.
  AI советует под реальные метрики площадки, а не «в воздух».

### Импорт и ремикс по ссылке (NEW)
- Вставь URL поста / видео / статьи в поле быстрого добавления или в ⌘K-палитру
- Сервер тянет страницу, парсит OG-теги и читаемый текст, определяет тип
  (YouTube / соцсеть / статья)
- Карточка создаётся со снапшотом источника — AI сразу видит контекст в системном промпте
- Кнопка **«Переработать в новый пост»** в панели карточки отправит AI запрос
  на полноценный ремикс (новый хук, структура, текст под твои платформы, без дословного
  копирования)

### Авто-публикация через n8n
- Статус карточки «📤 Готово к публикации» → триггер в n8n webhook
- Per-platform адаптеры с лимитами (Instagram 2 200 / YouTube 5 000 / Threads 500 / VK 4 000 симв.)
- Статус публикации в реальном времени: `pending → posted / failed`
- Кнопка «Тест: отправить ping» прямо из настроек
- Опциональный `X-ContentFlow-Secret` для проверки запросов в n8n

---

## 🧩 Стек

| Слой | Технология |
|---|---|
| Frontend | Next.js 14 (App Router) · TypeScript · React 18 |
| UI | Tailwind CSS · Lucide · cmdk (command palette) · sonner (toasts) |
| DnD | @dnd-kit/core · @dnd-kit/sortable |
| Editor | TipTap (StarterKit + Placeholder) |
| State | Zustand (+ persist + migrate) |
| Backend | Next.js API Routes (Node runtime, streaming) |
| AI | OpenAI SDK → OpenAI · Ollama · LM Studio (OpenAI-совместимо) |
| DB | Supabase (PostgreSQL) — опционально |

---

## 🚀 Быстрый старт (локально)

### 1. Клонировать и установить

```bash
git clone https://github.com/kiosk84/Content-Workflow-CRM.git contentflow
cd contentflow
npm install
```

Требуется Node.js **≥ 18** (рекомендуется 20 или 22).

### 2. (Опционально) создать .env.local

```bash
cp .env.example .env.local
```

Всё опциональное — без этого файла проект работает в демо-режиме.

### 3. Запустить dev-сервер

```bash
npm run dev
```

Открой **http://localhost:3000**. Увидишь Kanban с несколькими стартовыми карточками.
Всё сохраняется в `localStorage` твоего браузера.

### 4. Production

```bash
npm run build
npm start
```

### Деплой на Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kiosk84/Content-Workflow-CRM)

Добавь нужные env (OpenAI, n8n, Supabase) в настройках проекта — и готово.

---

## 🧠 Подключаем AI: три варианта

Выбирается в **Настройки (⌘K → «Настройки»)** → секция «AI провайдер».
Все поля (Base URL / API key / Model) можно оставить по умолчанию.

### Вариант A — OpenAI (cloud)

1. Получи ключ: https://platform.openai.com/api-keys
2. В UI: провайдер `OpenAI`, API key = `sk-...`, Model = `gpt-4o-mini` (или любой другой).
3. Альтернативно — задай в `.env.local`:

```ini
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

### Вариант B — Ollama (локальная LLM)

Полностью офлайн, бесплатно, твои данные никуда не уходят.

1. Установи: https://ollama.com/download
2. Запусти демон и скачай модель:
   ```bash
   ollama serve                   # в отдельном терминале
   ollama pull llama3.1           # или qwen2.5, mistral, phi3, gemma2 и т.д.
   ```
3. В UI: провайдер `Ollama`, Base URL = `http://localhost:11434`,
   Model = `llama3.1` (или любая из `ollama list`).
   Нажми **«Подгрузить»** — кнопка автоматически подтянет список твоих моделей из `/api/tags`.
4. Альтернативно — через env:
   ```ini
   AI_PROVIDER=ollama
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=llama3.1
   ```

Под капотом ContentFlow общается с Ollama через её **OpenAI-совместимый endpoint**
(`http://localhost:11434/v1/chat/completions`), так что стриминг работает как у облака.

### Вариант C — LM Studio (локальная LLM)

Удобный UI-инструмент для macOS/Windows/Linux.

1. Установи: https://lmstudio.ai
2. В LM Studio выбери модель (GGUF) и нажми **Load**.
3. Открой вкладку **Developer → Local Server** и нажми **Start Server**
   (по умолчанию `http://localhost:1234`).
4. В UI: провайдер `LM Studio`, Base URL = `http://localhost:1234/v1`,
   Model = id из LM Studio (например `qwen2.5-7b-instruct`) или просто `local-model` —
   LM Studio использует текущую загруженную модель.
5. Нажми **«Подгрузить»** — список моделей придёт через `/v1/models`.

---

## 📡 Подключаем авто-публикацию через n8n

**n8n** — бесплатный open-source workflow-автоматизатор (типа Zapier, только self-hosted и
полностью контролируемый). ContentFlow отправляет payload в твой n8n-воркфлоу, а n8n уже
сам раскидывает контент по соцсетям через их API.

> **Важно:** ContentFlow **не** публикует в соцсети напрямую — мы форвардим готовый
> payload в n8n, а n8n делает фактические API-вызовы (Meta Graph, YouTube Data API, VK API).
> Это нужно, чтобы ты **не хранил токены соцсетей в этом проекте** и мог менять каналы
> публикации без правок кода.

### 1. Поднимаем n8n локально (Docker, 2 команды)

Самый быстрый способ — через Docker:

```bash
# 1) создать volume, чтобы workflow'ы не пропали
docker volume create n8n_data

# 2) запустить n8n
docker run -d --name n8n \
  -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  -e N8N_SECURE_COOKIE=false \
  -e N8N_HOST=localhost \
  -e WEBHOOK_URL=http://localhost:5678/ \
  n8nio/n8n
```

Открой http://localhost:5678, создай owner-аккаунт — всё, n8n готов.

> Альтернатива без Docker: `npx n8n` (потребуется Node 20+).

### 2. Создаём webhook-воркфлоу в n8n

1. В n8n: **Workflows → New**.
2. Добавь ноду **Webhook** (поиск: `webhook`):
   - HTTP Method: `POST`
   - Path: `contentflow` (можно любое)
   - Respond: `When last node finishes` (чтобы ContentFlow получил результаты)
3. Нажми **Execute workflow** и скопируй **Test URL** — он нужен только для отладки.
   Для реальной работы после активации будет **Production URL** вида
   `http://localhost:5678/webhook/contentflow`.
4. Сохрани workflow, переключи тумблер **Active** в верхнем правом углу.

Готовый минимальный workflow можно импортировать из
[`docs/n8n-sample-workflow.json`](./docs/n8n-sample-workflow.json):
**Workflows → Import from File**.

### 3. Подключаем n8n в ContentFlow

- Открой **⌘K → Настройки → n8n webhook**
- Вставь URL (`http://localhost:5678/webhook/contentflow`)
- При желании добавь **Shared secret** — он прилетит в n8n в заголовке
  `X-ContentFlow-Secret`. В n8n прямо в ноде Webhook включи **Authentication → Header Auth**
  и сверяй этот заголовок.
- Включи галку **«Авто-публикация при переводе карточки в Готово»** — теперь
  любая карточка, перетащенная в колонку «📤 Готово», автоматически уйдёт в n8n.
- Нажми **«Тест: отправить ping»** — в n8n в Executions должен появиться запрос.

### 4. Формат payload, который получит n8n

```json
{
  "run_id": "pub_1730000000000_a1b2c3",
  "card": { "id": "...", "title": "...", "idea_text": "...", "script_text": "...",
            "platform": ["instagram","youtube"], "stage": "ready",
            "tags": [], "deadline": null, "priority": "medium", "card_url": "http://localhost:3000/?card=..." },
  "platforms": ["instagram","youtube"],
  "envelope": [
    {
      "platform": "instagram",
      "caption": "Заголовок\n\n… до 2 200 симв.",
      "hashtags": ["#контент","#reels"],
      "body": "plain text без html",
      "format": "video",
      "limits": { "caption_max": 2200, "hashtags_max": 30 },
      "meta": { "title": "...", "deadline": null }
    },
    { "platform": "youtube", "caption": "…", "limits": { "caption_max": 5000 }, "...": "..." }
  ]
}
```

Дальше n8n разруливает сам: по каждому `envelope[i]` подключай нужный node
(Instagram Graph, YouTube Data API, VK API, Threads API), используя caption / body /
hashtags / meta.

### 4. Статусы в UI

- `idle` — карточка ещё не публиковалась на платформе
- `pending` — запрос улетел в n8n, ждём
- `posted` — n8n ответил успехом (в карточке появится зелёный бейдж + `post_url`, если ты вернёшь его)
- `failed` — ошибка, в тултипе виден `error`

`/api/publish` ждёт от n8n JSON вида:

```json
{
  "ok": true,
  "results": [
    { "platform": "instagram", "url": "https://..." },
    { "platform": "youtube",   "url": "https://youtu.be/..." }
  ]
}
```

Если `ok !== true` — все платформы помечаются `failed`.

Если `N8N_WEBHOOK_URL` не задан и в UI пусто — `/api/publish` вернёт **demo envelope**
без реальной отправки. Удобно, чтобы посмотреть формат.

### 6. Рецепты публикации на каждую соцсеть

Внутри n8n после Webhook-ноды обычно идёт **Switch** (или If) по `envelope[i].platform`,
и дальше отдельная ветка на каждую площадку. Ниже — быстрые ориентиры.

#### Instagram (Reels / Feed)
- Нужен бизнес/креатор-аккаунт Instagram, привязанный к Facebook Page
- Получить токен Meta Graph API: https://developers.facebook.com/docs/instagram-api
- В n8n можно использовать ноду **HTTP Request** с вызовами Graph API:
  1. `POST /{ig-user-id}/media` (создать media container с `video_url` / `image_url` + `caption`)
  2. Подождать `status_code === FINISHED` (Polling)
  3. `POST /{ig-user-id}/media_publish` с `creation_id`
- Для caption используй `envelope.caption` + `envelope.hashtags.join(" ")`

#### YouTube (Shorts / видео)
- Включить YouTube Data API v3 в Google Cloud Console
- В n8n есть встроенная нода **YouTube** → OAuth2 credential
- Операция **Video → Upload**: `title` = первые 100 символов `caption`,
  `description` = `envelope.body`, `tags` = `envelope.hashtags`

#### ВКонтакте (VK)
- Получить VK access token: https://dev.vk.com/api/access-token
- В n8n используй **HTTP Request** к `https://api.vk.com/method/wall.post`
  с параметрами `owner_id`, `message = envelope.body`, `v = 5.199`

#### Threads (Meta)
- Threads API (Meta): https://developers.facebook.com/docs/threads
- Через **HTTP Request** на `POST /{threads-user-id}/threads` → ждать → `POST /media_publish`
- Лимит 500 символов — мы уже обрезаем `envelope.caption` под этот размер

После публикации рекомендуется собрать URL в `results[i].url` и вернуть в ответе — этот
URL пойдёт в карточку ContentFlow как `post_url` и отобразится как кликабельный бейдж.

### 7. Troubleshooting

- **n8n не получает запрос** → проверь, что workflow **Active**, а не в режиме Test.
  Test URL ловит только при нажатии «Execute workflow».
- **CORS / mixed content** → если n8n на https, а ContentFlow локально на http —
  браузер ничего не сломает (мы вызываем /api/publish на сервере), но n8n должен
  принять запрос. Обычно проблем нет.
- **Auth** → Shared secret не обязателен, но если включил — в n8n добавь Authentication → Header Auth.
- **Demo envelope вместо реального** → `/api/publish` падает в демо, если ни в env,
  ни в настройках нет URL. Проверь оба источника.

---

## 🗃 Supabase (опционально)

Для продакшн-хранилища создай проект в [Supabase](https://supabase.com), выполни
SQL из [`supabase/schema.sql`](./supabase/schema.sql) и задай:

```ini
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

API-роуты `/api/cards` и `/api/cards/[id]` автоматически подхватят Supabase,
если переменные заданы, иначе вернут заглушки — и работает локальный стор.

Таблицы:
- `content_cards` — карточки контента
- `ai_conversations` — история AI-диалогов

---

## ⌨️ Шорткаты

| Клавиша | Действие |
|---|---|
| `⌘K` / `Ctrl+K` | Открыть палитру команд |
| `N` | Новая идея (сразу откроет панель) |
| `/` | Фокус на поиск |
| `Esc` | Закрыть палитру / панель карточки |

---

## 🏗 Архитектура

```
User UI (Kanban, CardPanel, AIChatPanel, CommandPalette, SettingsModal, SourceBlock)
        │
        ├── Zustand store ── localStorage ── cards / threads / settings
        │
        ├─> /api/ai/chat     → OpenAI SDK → { OpenAI | Ollama /v1 | LM Studio /v1 }
        │                       (резолвер lib/ai-providers.ts, persona из prompts.ts)
        ├─> /api/ai/models   → /v1/models (OpenAI-compat) или /api/tags (Ollama)
        ├─> /api/fetch-url   → парсит OG-теги + текст источника (ссылки)
        ├─> /api/publish     → n8n webhook (per-platform adapters)
        └─> /api/cards*      → Supabase (если задан) или in-memory
```

Ключевые файлы:

```
contentflow/
├─ app/
│  ├─ page.tsx                          # главная (Kanban + панели)
│  ├─ layout.tsx                        # тёмный root + sonner toaster
│  └─ api/
│     ├─ cards/route.ts                 # GET/POST
│     ├─ cards/[id]/route.ts            # PATCH/DELETE
│     ├─ ai/chat/route.ts               # стриминг AI
│     ├─ ai/models/route.ts             # список моделей провайдера
│     ├─ fetch-url/route.ts             # скрейп источника по URL
│     └─ publish/route.ts               # n8n webhook
├─ components/
│  ├─ layout/ (Sidebar, Topbar, CommandPalette)
│  ├─ kanban/ (KanbanBoard, KanbanColumn, ContentCardItem)
│  ├─ card-panel/ (CardPanel, ScriptEditor, PublishBar, SourceBlock)
│  ├─ ai/ (AIChatPanel)
│  └─ settings/ (SettingsModal)
├─ hooks/
│  ├─ useAutoPublish.ts                 # следит за переходом в "ready"
│  └─ useKeyboardShortcuts.ts
├─ lib/
│  ├─ store.ts                          # Zustand + persist + migrate
│  ├─ ai-providers.ts                   # резолвер OpenAI/Ollama/LM Studio
│  ├─ prompts.ts                        # системный промпт + persona + чипы
│  ├─ url-importer.ts                   # HTML parser + snapshot для LLM
│  ├─ import-client.ts                  # клиентские хелперы импорта
│  ├─ publish-adapters.ts               # per-platform payload builder
│  ├─ publish-client.ts                 # публикация + тосты
│  ├─ supabase.ts
│  ├─ seed.ts
│  └─ utils.ts
├─ docs/n8n-sample-workflow.json        # готовый workflow для импорта
├─ supabase/schema.sql
├─ types/content.ts
└─ .env.example
```

---

## 🛠 Скрипты

```bash
npm run dev     # dev-сервер (http://localhost:3000)
npm run build   # production-сборка
npm start       # запуск собранного приложения
npm run lint    # ESLint
```

---

## 🗺 Roadmap

- [ ] Календарь публикаций (Timeline / Calendar view)
- [ ] Аналитика карточек (просмотры/охваты через n8n ↔ соцсети)
- [ ] Командная работа + Supabase Realtime
- [ ] История версий сценария + diff
- [ ] Мобильное приложение (React Native)

---

## 📝 Лицензия

MIT
