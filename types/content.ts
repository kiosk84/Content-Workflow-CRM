export type Platform = "instagram" | "youtube" | "threads" | "vk";

export type Stage =
  | "idea"
  | "draft"
  | "script"
  | "production"
  | "ready"
  | "published";

export type Priority = "low" | "medium" | "high";

export type PublishStatus = "idle" | "pending" | "posted" | "failed";

export interface PublishRecord {
  status: PublishStatus;
  posted_at?: string;
  post_url?: string;
  error?: string;
}

export interface ContentCard {
  id: string;
  title: string;
  idea_text: string;
  script_text: string;
  platform: Platform[];
  stage: Stage;
  priority: Priority;
  deadline: string | null;
  tags: string[];
  attachments: Attachment[];
  publish_status?: Partial<Record<Platform, PublishRecord>>;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  kind: "file" | "link";
}

export interface AIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

export interface AIConversation {
  id: string;
  card_id: string;
  messages: AIMessage[];
  created_at: string;
}

export const STAGES: { id: Stage; title: string; icon: string; accent: string }[] = [
  { id: "idea", title: "Идея", icon: "💡", accent: "from-amber-500/20 to-amber-500/5" },
  { id: "draft", title: "Черновик", icon: "✏️", accent: "from-sky-500/20 to-sky-500/5" },
  { id: "script", title: "Сценарий", icon: "🎬", accent: "from-violet-500/20 to-violet-500/5" },
  { id: "production", title: "Производство", icon: "🎨", accent: "from-fuchsia-500/20 to-fuchsia-500/5" },
  { id: "ready", title: "Готово к публикации", icon: "📤", accent: "from-emerald-500/20 to-emerald-500/5" },
  { id: "published", title: "Опубликовано", icon: "✅", accent: "from-teal-500/20 to-teal-500/5" },
];

export const PLATFORMS: {
  id: Platform;
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: string;
}[] = [
  {
    id: "youtube",
    label: "YouTube",
    color: "#FF0000",
    bg: "bg-red-500/15",
    border: "border-red-500/40",
    icon: "▶",
  },
  {
    id: "instagram",
    label: "Instagram",
    color: "#E1306C",
    bg: "bg-pink-500/15",
    border: "border-pink-500/40",
    icon: "◉",
  },
  {
    id: "threads",
    label: "Threads",
    color: "#ededed",
    bg: "bg-neutral-200/10",
    border: "border-neutral-200/40",
    icon: "@",
  },
  {
    id: "vk",
    label: "ВКонтакте",
    color: "#0077FF",
    bg: "bg-blue-500/15",
    border: "border-blue-500/40",
    icon: "VK",
  },
];

export const PRIORITIES: { id: Priority; label: string; dot: string }[] = [
  { id: "low", label: "Низкий", dot: "bg-neutral-400" },
  { id: "medium", label: "Средний", dot: "bg-amber-400" },
  { id: "high", label: "Высокий", dot: "bg-rose-500" },
];
