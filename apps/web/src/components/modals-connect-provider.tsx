import { useState, useEffect } from "react";
import { XIcon, LinkIcon } from "lucide-react";
import { Button } from "#/components/ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "@eklavya/db/convex/_generated/api";
import { PROVIDER_LOGOS } from "#/lib/utils";
import type { Doc } from "@eklavya/db/convex/_generated/dataModel";

type Provider = Doc<"providers">;

export function ConnectProviderModal({
  provider,
  onClose,
}: {
  provider: Provider;
  onClose: () => void;
}) {
  const accounts = useQuery(api.accounts.get);
  const updateSync = useMutation(api.accounts.updateSync);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const investmentAccounts = (accounts ?? []).filter(
    (a) => a.category === "investment"
  );

  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [apiKey, setApiKey] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [extraFields, setExtraFields] = useState<Record<string, string>>({});

  useEffect(() => {
    if (investmentAccounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(investmentAccounts[0]._id);
    }
  }, [investmentAccounts, selectedAccountId]);

  const logo = PROVIDER_LOGOS[provider.code] ?? {
    bg: "from-muted/40 to-muted/20",
    text: provider.code.slice(0, 2).toUpperCase(),
    fg: "text-muted-foreground",
  };

  const handleConnect = async () => {
    if (!selectedAccountId) return;
    try {
      setIsSubmitting(true);
      const config: Record<string, string> = { apiKey };
      if (accessToken) config.accessToken = accessToken;
      Object.assign(config, extraFields);

      await updateSync({
        id: selectedAccountId as any,
        providerId: provider._id,
        lastSyncedAt: new Date().toISOString(),
        apiConfig: {
          status: "active",
          config,
        },
      });
      onClose();
    } catch (e) {
      console.error("Failed to connect provider", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div
        className="fixed inset-0 bg-background/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-border bg-background shadow-2xl flex flex-col max-h-full">
        <div className="flex items-center justify-between border-border/60 border-b px-5 py-3.5 shrink-0">
          <div>
            <div className="font-heading text-sm">Connect {provider.name}</div>
            <div className="mt-0.5 text-muted-foreground text-xs">
              Link your {provider.name} account to sync data.
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-md p-1 text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        <div className="space-y-5 px-5 py-4 max-h-[70vh] overflow-y-auto">
          {investmentAccounts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/60 bg-background/30 px-4 py-6 text-center">
              <p className="text-muted-foreground text-sm">
                No investment accounts yet. Create one first on the Accounts page.
              </p>
            </div>
          ) : (
            <>
              <div>
                <div className="mb-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                  Link to Account
                </div>
                <div className="relative">
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="h-9 w-full appearance-none rounded-lg border border-input bg-background pl-3 pr-9 text-sm outline-none transition-shadow focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/24"
                  >
                    {investmentAccounts.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                    className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 opacity-60"
                  >
                    <polyline points="4 6 8 10 12 6" />
                  </svg>
                </div>
              </div>

              <div>
                <div className="mb-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                  API Credentials
                </div>
                <div className="space-y-3">
                  <label className="block">
                    <span className="mb-1 block text-xs text-muted-foreground">API Key</span>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter API key"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs text-muted-foreground">Access Token</span>
                    <input
                      type="password"
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      placeholder="Enter access token"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end border-border/60 border-t bg-background px-5 py-3 shrink-0">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleConnect}
              disabled={!selectedAccountId || !apiKey || isSubmitting}
            >
              <LinkIcon className="mr-1 size-4" />
              {isSubmitting ? "Connecting..." : "Connect"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
