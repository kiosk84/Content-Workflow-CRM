import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  AIMessage,
  ContentCard,
  Platform,
  Stage,
} from "@/types/content";
import { SEED_CARDS } from "./seed";
import { uid } from "./utils";

interface State {
  cards: ContentCard[];
  activeCardId: string | null;
  platformFilter: Platform | "all";
  aiOpen: boolean;
  aiThreads: Record<string, AIMessage[]>; // cardId -> messages
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
  setAIOpen: (open: boolean) => void;
  appendAIMessage: (cardId: string, msg: AIMessage) => void;
  updateLastAIMessage: (cardId: string, content: string) => void;
  clearAIThread: (cardId: string) => void;
  markHydrated: () => void;
}

export const useStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      cards: SEED_CARDS,
      activeCardId: null,
      platformFilter: "all",
      aiOpen: false,
      aiThreads: {},
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
      markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "contentflow-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cards: state.cards,
        aiThreads: state.aiThreads,
      }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    }
  )
);
