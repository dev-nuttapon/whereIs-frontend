import type { ReactNode } from 'react';

export const detailTabIds = ['overview', 'details', 'activity'] as const;
export type DetailTabId = (typeof detailTabIds)[number];

export interface DetailTab {
  id: DetailTabId;
  label: string;
  content: ReactNode;
}

export function DetailTabs({ tabs, activeTab, onChange }: { tabs: DetailTab[]; activeTab: DetailTabId; onChange: (tab: DetailTabId) => void }) {
  const active = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  return (
    <div className="space-y-4">
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-border/70 bg-muted/30 p-1" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={tab.id === active?.id}
            onClick={() => onChange(tab.id)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab.id === active?.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:bg-background/70 hover:text-foreground'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel">{active?.content}</div>
    </div>
  );
}
