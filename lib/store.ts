import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  AIMessage,
  ContentCard,
  Platform,
  PublishRecord,
  Stage,
} from "@/types/content";
import { SEED_CARDS } from "./seed";
import { uid } from "./utils";

export interface Settings {
  n8n_webhook_url: string;
  n8n_secret: string;
  openai_model: string;
  auto_publish_on_ready: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  n8n_webhook_url: "",
  n8n_secret: "",
  openai_model: "gpt-4o-mini",
  auto_publish_on_ready: false,
};

interface State {
  cards: ContentCard[];
  activeCardId: string | null;
  platformFilter: Platform | "all";
  search: string;
  aiOpen: boolean;
  aiThreads: Record<string, AIMessage[]>;
  paletteOpen: boolean;
  settings: Settings;
  hydrated: boolean;
}

interface Actions {
  setCards: (cards: ContentCard[]) => void;
  createCard: (partial?: Partial<ContentCard>) => ContentCard;
  updateCard: (id: string, patch: Partial<ContentCard>) => void;
  deleteCard: (id: string) => void;
  moveCard: (id: string, stage: Stage) => void;
  setActiveCard: (id: string | null) => void;
  setPlatformFilter: (f: Platform | "all") => void;
  setSearch: (s: string) => void;
  setAIOpen: (open: boolean) => void;
  appendAIMessage: (cardId: string, msg: AIMessage) => void;
  updateLastAIMessage: (cardId: string, content: string) => void;
  clearAIThread: (cardId: string) => void;
  setPaletteOpen: (open: boolean) => void;
  setSettings: (patch: Partial<Settings>) => void;
  setPublishStatus: (
    id: string,
    platform: Platform,
    record: PublishRecord
  ) => void;
  markHydrated: () => void;
}

export const useStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      cards: SEED_CARDS,
      activeCardId: null,
      platformFilter: "all",
      search: "",
      aiOpen: false,
      aiThreads: {},
      paletteOpen: false,
      settings: DEFAULT_SETTINGS,
      hydrated: false,

      setCards: (cards) => set({ cards }),
      createCard: (partial = {}) => {
        const now = new Date().toISOString();
        const card: ContentCard = {
          id: uid(),
          title: partial.title ?? "Новая идея",
          idea_text: partial.idea_text ?? "",
          script_text: partial.script_text ?? "",
          platform: partial.platform ?? [],
          stage: partial.stage ?? "idea",
          priority: partial.priority ?? "medium",
          deadline: partial.deadline ?? null,
          tags: partial.tags ?? [],
          attachments: partial.attachments ?? [],
          publish_status: partial.publish_status,
          created_at: now,
          updated_at: now,
        };
        set({ cards: [card, ...get().cards] });
        return card;
      },
      updateCard: (id, patch) =>
        set({
          cards: get().cards.map((c) =>
            c.id === id
              ? { ...c, ...patch, updated_at: new Date().toISOString() }
              : c
          ),
        }),
      deleteCard: (id) =>
        set({
          cards: get().cards.filter((c) => c.id !== id),
          activeCardId: get().activeCardId === id ? null : get().activeCardId,
        }),
      moveCard: (id, stage) =>
        set({
          cards: get().cards.map((c) =>
            c.id === id
              ? { ...c, stage, updated_at: new Date().toISOString() }
              : c
          ),
        }),
      setActiveCard: (id) => set({ activeCardId: id, aiOpen: false }),
      setPlatformFilter: (f) => set({ platformFilter: f }),
      setSearch: (s) => set({ search: s }),
      setAIOpen: (open) => set({ aiOpen: open }),
      appendAIMessage: (cardId, msg) => {
        const thread = get().aiThreads[cardId] ?? [];
        set({
          aiThreads: { ...get().aiThreads, [cardId]: [...thread, msg] },
        });
      },
      updateLastAIMessage: (cardId, content) => {
        const thread = get().aiThreads[cardId] ?? [];
        if (thread.length === 0) return;
        const last = thread[thread.length - 1];
        const updated: AIMessage = { ...last, content };
        set({
          aiThreads: {
            ...get().aiThreads,
            [cardId]: [...thread.slice(0, -1), updated],
          },
        });
      },
      clearAIThread: (cardId) => {
        const next = { ...get().aiThreads };
        delete next[cardId];
        set({ aiThreads: next });
      },
      setPaletteOpen: (open) => set({ paletteOpen: open }),
      setSettings: (patch) =>
        set({ settings: { ...get().settings, ...patch } }),
      setPublishStatus: (id, platform, record) =>
        set({
          cards: get().cards.map((c) =>
            c.id === id
              ? {
                  ...c,
                  publish_status: {
                    ...(c.publish_status ?? {}),
                    [platform]: record,
                  },
                  updated_at: new Date().toISOString(),
                }
              : c
          ),
        }),
      markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "contentflow-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cards: state.cards,
        aiThreads: state.aiThreads,
        settings: state.settings,
      }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    }
  )
);
