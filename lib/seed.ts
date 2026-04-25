import type { ContentCard } from "@/types/content";
import { uid } from "./utils";

const now = new Date().toISOString();

export const SEED_CARDS: ContentCard[] = [
  {
    id: uid(),
    title: "Почему алгоритм Reels любит крючки",
    idea_text:
      "Разобрать 5 типов хуков, которые удерживают зрителя в первые 3 секунды. Добавить примеры из реальных Reels.",
    script_text: "",
    platform: ["instagram", "youtube"],
    stage: "idea",
    priority: "high",
    deadline: null,
    tags: ["reels", "алгоритм", "хуки"],
    attachments: [],
    created_at: now,
    updated_at: now,
  },
  {
    id: uid(),
    title: "3 ошибки новичков в YouTube Shorts",
    idea_text:
      "Показать ошибки на примерах: слабый старт, отсутствие петли, перегруз текстом. Финал — чек-лист.",
    script_text:
      "<p><strong>Интро:</strong> Если твои Shorts не набирают просмотры — скорее всего ты делаешь вот эти 3 ошибки.</p><p><strong>Ошибка 1:</strong> слабый хук.</p><p><strong>Ошибка 2:</strong> нет цикличной петли.</p><p><strong>Ошибка 3:</strong> перегруз текстом на экране.</p>",
    platform: ["youtube"],
    stage: "draft",
    priority: "medium",
    deadline: null,
    tags: ["shorts", "ошибки"],
    attachments: [],
    created_at: now,
    updated_at: now,
  },
  {
    id: uid(),
    title: "Разбор тренда «тихого утра»",
    idea_text: "Залипательный формат: таймлапс утренних ритуалов без слов.",
    script_text:
      "<h2>Структура</h2><ul><li>00:00 — будильник, чашка кофе</li><li>00:05 — окно, свет</li><li>00:10 — ноут и первая задача</li></ul>",
    platform: ["instagram", "threads"],
    stage: "script",
    priority: "medium",
    deadline: null,
    tags: ["тренд", "lifestyle"],
    attachments: [],
    created_at: now,
    updated_at: now,
  },
  {
    id: uid(),
    title: "ВК-пост: карусель «7 AI-инструментов для блогера»",
    idea_text:
      "Короткие карточки с описанием инструмента и юзкейсом для контента.",
    script_text: "",
    platform: ["vk"],
    stage: "production",
    priority: "high",
    deadline: null,
    tags: ["AI", "инструменты"],
    attachments: [],
    created_at: now,
    updated_at: now,
  },
  {
    id: uid(),
    title: "Интервью с нейро-художником",
    idea_text:
      "Большое видео на 10 минут. Темы: как зарабатывает, какие модели использует, как общается с аудиторией.",
    script_text: "<p>Вопросы готовы, осталось согласовать дату.</p>",
    platform: ["youtube"],
    stage: "ready",
    priority: "high",
    deadline: null,
    tags: ["интервью", "AI-арт"],
    attachments: [],
    created_at: now,
    updated_at: now,
  },
  {
    id: uid(),
    title: "Личный лог недели #12",
    idea_text: "Итоги недели: что сработало, что провалилось.",
    script_text: "<p>Опубликовано в Threads и ВК.</p>",
    platform: ["threads", "vk"],
    stage: "published",
    priority: "low",
    deadline: null,
    tags: ["дневник"],
    attachments: [],
    created_at: now,
    updated_at: now,
  },
];
