import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  SettingsIcon,
  PuzzleIcon,
  CheckIcon,
  ExternalLinkIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@eklavya/db/convex/_generated/api";
import { PROVIDER_LOGOS } from "#/lib/utils";
import { ConnectProviderModal } from "#/components/modals-connect-provider";
import type { Doc } from "@eklavya/db/convex/_generated/dataModel";

const NAV = [
  { icon: SettingsIcon, label: "General", active: true },
  { icon: PuzzleIcon, label: "Integrations" },
  { icon: CheckIcon, label: "Task Pillars" },
];

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [activeTab, setActiveTab] = useState("General");
  const [connectingProvider, setConnectingProvider] =
    useState<Doc<"providers"> | null>(null);

  const providers = useQuery(api.providers.get);
  const seedProviders = useMutation(api.providers.seed);
  const accounts = useQuery(api.accounts.get);
  const pillars = useQuery(api.pillars.get);
  const createPillar = useMutation(api.pillars.create);
  const removePillar = useMutation(api.pillars.remove);

  const [newPillarName, setNewPillarName] = useState("");
  const [newPillarColor, setNewPillarColor] = useState("#3b82f6");

  useEffect(() => {
    if (providers && providers.length === 0) {
      seedProviders();
    }
  }, [providers, seedProviders]);

  const connectedAccounts = (accounts ?? []).filter(
    (a) => a.providerId && a.apiConfig?.status === "active"
  );
  const connectedProviderIds = new Set(connectedAccounts.map((a) => a.providerId));

  return (
    <div className="min-h-[calc(100vh-0px)] bg-background text-foreground">
      <div className="mx-auto grid max-w-5xl grid-cols-[220px_1fr]">
        <aside className="border-r border-border/60 px-4 py-8">
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
            Workspace
          </div>
          <div className="mt-1 truncate font-heading text-lg">Eklavya OS</div>
          <ul className="mt-6 flex flex-col gap-0.5">
            {NAV.map(({ icon: Icon, label }) => {
              const isActive = activeTab === label;
              return (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => setActiveTab(label)}
                    className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                      isActive
                        ? "bg-foreground/[0.06] text-foreground"
                        : "text-muted-foreground hover:bg-foreground/[0.03] hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-4 opacity-70" />
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <main className="px-10 py-12 pb-32">
          <header className="flex items-end justify-between border-b border-border/60 pb-6">
            <div>
              <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
                Settings · {activeTab}
              </div>
              <h1 className="mt-1 font-heading text-2xl">{activeTab}</h1>
              {activeTab === "Integrations" && (
                <p className="mt-1 text-muted-foreground text-sm">
                  Connect your broker accounts to sync investment data automatically.
                </p>
              )}
            </div>
          </header>

          {activeTab === "General" && (
            <div className="mt-8 text-muted-foreground text-sm">
              General settings coming soon.
            </div>
          )}

          {activeTab === "Task Pillars" && (
            <div className="mt-8 space-y-6">
              <div className="rounded-xl border border-border/60 bg-background/40 p-6">
                <h2 className="font-heading text-lg">Your Power Pillars</h2>
                <p className="mt-1 text-muted-foreground text-sm">
                  Define the core areas of your life (e.g. Rich, Muscular, Intelligent) to categorize your Nuclear Tasks.
                </p>

                <div className="mt-6 flex items-end gap-3">
                  <label className="flex-1">
                    <span className="mb-1 block text-xs text-muted-foreground">Pillar Name</span>
                    <input
                      type="text"
                      value={newPillarName}
                      onChange={(e) => setNewPillarName(e.target.value)}
                      placeholder="e.g. Muscular"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </label>
                  <label className="w-24 shrink-0">
                    <span className="mb-1 block text-xs text-muted-foreground">Color</span>
                    <input
                      type="color"
                      value={newPillarColor}
                      onChange={(e) => setNewPillarColor(e.target.value)}
                      className="flex h-9 w-full cursor-pointer rounded-md border border-input bg-background p-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!newPillarName.trim()) return;
                      await createPillar({ name: newPillarName, color: newPillarColor });
                      setNewPillarName("");
                    }}
                    disabled={!newPillarName.trim()}
                    className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    <PlusIcon className="mr-1 size-4" />
                    Add
                  </button>
                </div>

                {pillars !== undefined && pillars.length > 0 && (
                  <ul className="mt-6 space-y-2">
                    {pillars.map((p) => (
                      <li key={p._id} className="flex items-center justify-between rounded-lg border border-border/40 bg-background px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span
                            className="size-3 rounded-full shadow-sm"
                            style={{ backgroundColor: p.color || "#ccc" }}
                          />
                          <span className="font-medium text-sm">{p.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePillar({ id: p._id })}
                          className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <TrashIcon className="size-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {pillars !== undefined && pillars.length === 0 && (
                  <div className="mt-6 rounded-lg border border-dashed border-border/70 p-8 text-center text-muted-foreground text-sm">
                    No pillars added yet. Create one above to get started.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "Integrations" && (
            <div className="mt-8">
              {providers === undefined ? (
                <div className="rounded-xl border border-dashed border-border/70 bg-background/30 px-6 py-12 text-center">
                  <p className="text-muted-foreground text-sm">Loading providers...</p>
                </div>
              ) : (
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {providers.map((provider) => {
                    const logo = PROVIDER_LOGOS[provider.code] ?? {
                      bg: "from-muted/40 to-muted/20",
                      text: provider.code.slice(0, 2).toUpperCase(),
                      fg: "text-muted-foreground",
                    };
                    const isConnected = connectedProviderIds.has(provider._id);
                    const linkedAccount = connectedAccounts.find(
                      (a) => a.providerId === provider._id
                    );

                    return (
                      <li
                        key={provider._id}
                        className="group flex flex-col gap-3 rounded-xl border border-border/60 bg-background/40 p-4 transition-colors hover:border-foreground/30"
                      >
                        <div className="flex items-start justify-between">
                          <div
                            className={`flex size-10 items-center justify-center rounded-lg bg-gradient-to-br font-medium text-xs ${logo.bg} ${logo.fg}`}
                          >
                            {logo.text}
                          </div>
                          {!provider.isActive && (
                            <span className="rounded bg-foreground/[0.06] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                              Coming soon
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{provider.name}</span>
                            {isConnected && (
                              <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
                                <CheckIcon className="size-2.5" />
                                Connected
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 font-mono text-[10px] text-muted-foreground/80 uppercase tracking-[0.2em]">
                            {provider.category ?? "Broker"}
                          </div>
                          {isConnected && linkedAccount ? (
                            <p className="mt-2 text-muted-foreground text-xs leading-relaxed">
                              Linked to {linkedAccount.name}
                            </p>
                          ) : (
                            <p className="mt-2 text-muted-foreground text-xs leading-relaxed">
                              Connect to auto-sync your holdings and portfolio value.
                            </p>
                          )}
                        </div>

                        <div className="mt-auto flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (isConnected && linkedAccount) {
                                setConnectingProvider(provider);
                              } else if (provider.isActive) {
                                setConnectingProvider(provider);
                              }
                            }}
                            disabled={!provider.isActive}
                            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                              isConnected
                                ? "border border-border/60 bg-background/40 text-foreground hover:bg-foreground/[0.04]"
                                : provider.isActive
                                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                  : "bg-foreground/[0.04] text-muted-foreground cursor-not-allowed"
                            }`}
                          >
                            {isConnected ? "Configure" : "Connect"}
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-md border border-border/60 bg-background/40 p-2 text-muted-foreground transition-colors hover:text-foreground"
                            aria-label={`${provider.name} docs`}
                          >
                            <ExternalLinkIcon className="size-3.5" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </main>
      </div>

      {connectingProvider && (
        <ConnectProviderModal
          provider={connectingProvider}
          onClose={() => setConnectingProvider(null)}
        />
      )}
    </div>
  );
}
