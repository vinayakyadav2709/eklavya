import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  SettingsIcon,
  PuzzleIcon,
  CheckIcon,
  ExternalLinkIcon,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@eklavya/db/convex/_generated/api";
import { PROVIDER_LOGOS } from "#/lib/utils";
import { ConnectProviderModal } from "#/components/modals-connect-provider";
import type { Doc } from "@eklavya/db/convex/_generated/dataModel";

const NAV = [
  { icon: SettingsIcon, label: "General", active: true },
  { icon: PuzzleIcon, label: "Integrations" },
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
