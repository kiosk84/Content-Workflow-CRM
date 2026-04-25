"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";

/**
 * Global shortcuts:
 *  - ⌘K / Ctrl+K → open command palette
 *  - N → new idea card
 *  - / → focus the search input (any [data-shortcut="search"])
 *  - Esc → close palette / card panel
 */
export function useKeyboardShortcuts() {
  const setPaletteOpen = useStore((s) => s.setPaletteOpen);
  const paletteOpen = useStore((s) => s.paletteOpen);
  const setActiveCard = useStore((s) => s.setActiveCard);
  const activeCardId = useStore((s) => s.activeCardId);
  const createCard = useStore((s) => s.createCard);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isEditable =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
        return;
      }

      if (e.key === "Escape") {
        if (paletteOpen) {
          setPaletteOpen(false);
          return;
        }
        if (activeCardId) setActiveCard(null);
        return;
      }

      if (isEditable) return;

      if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        const c = createCard({ title: "Новая идея", stage: "idea" });
        setActiveCard(c.id);
      }

      if (e.key === "/") {
        const el = document.querySelector<HTMLInputElement>(
          "[data-shortcut='search']"
        );
        if (el) {
          e.preventDefault();
          el.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setPaletteOpen, paletteOpen, setActiveCard, activeCardId, createCard]);
}
