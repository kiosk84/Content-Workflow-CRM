"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { CardPanel } from "@/components/card-panel/CardPanel";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { useAutoPublish } from "@/hooks/useAutoPublish";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

export default function Home() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  useAutoPublish();
  useKeyboardShortcuts();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <Sidebar onOpenSettings={() => setSettingsOpen(true)} />
      <main className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenPalette={() => {}} />
        <div className="min-h-0 flex-1">
          <KanbanBoard />
        </div>
      </main>
      <CardPanel onOpenSettings={() => setSettingsOpen(true)} />
      <CommandPalette onOpenSettings={() => setSettingsOpen(true)} />
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
