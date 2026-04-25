"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { CardPanel } from "@/components/card-panel/CardPanel";

export default function Home() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <div className="min-h-0 flex-1">
          <KanbanBoard />
        </div>
      </main>
      <CardPanel />
    </div>
  );
}
