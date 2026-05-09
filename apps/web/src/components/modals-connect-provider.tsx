import { useState, useEffect } from "react";
import { XIcon, LinkIcon, ExternalLinkIcon } from "lucide-react";
import { Button } from "#/components/ui/button";
import { useMutation, useQuery, useConvex } from "convex/react";
import { api } from "@eklavya/db/convex/_generated/api";
import { getLoginURL } from "@eklavya/providers";
import type { Doc } from "@eklavya/db/convex/_generated/dataModel";

type Provider = Doc<"providers">;

type Step = "credentials" | "totp";

export function ConnectProviderModal({
  provider,
  onClose,
}: {
  provider: Provider;
  onClose: () => void;
}) {
  const accounts = useQuery(api.accounts.get);
  const convex = useConvex();
  const saveKiteCredentials = useMutation(api.accounts.saveKiteCredentials);
  const saveKotakCredentials = useMutation(api.accounts.saveKotakCredentials);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isKotak = provider.code === "kotak";
  const [step, setStep] = useState<Step>("credentials");

  const investmentAccounts = (accounts ?? []).filter(
    (a) => a.category === "investment"
  );

  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  useEffect(() => {
    if (investmentAccounts.length > 0 && !selectedAccountId) {
      const existing = investmentAccounts.find(
        (a) => a.providerId === provider._id
      );
      setSelectedAccountId(existing?._id || investmentAccounts[0]._id);
    }
  }, [investmentAccounts, selectedAccountId]);

  const [redirectUrl, setRedirectUrl] = useState(
    `${window.location.origin}/kite/callback`
  );
  const [consumerKey, setConsumerKey] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [ucc, setUcc] = useState("");
  const [mpin, setMpin] = useState("");
  const [totp, setTotp] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");

  useEffect(() => {
    if (!selectedAccountId || !accounts) return;
    const account = accounts.find((a) => a._id === selectedAccountId);
    if (account?.apiConfig?.config) {
      const c = account.apiConfig.config as Record<string, string>;
      if (c.apiKey) setApiKey(c.apiKey);
      if (c.apiSecret) setApiSecret(c.apiSecret);
      if (c.redirectUrl) setRedirectUrl(c.redirectUrl);
      if (c.consumerKey) setConsumerKey(c.consumerKey);
      if (c.mobileNumber) setMobileNumber(c.mobileNumber);
      if (c.ucc) setUcc(c.ucc);
      if (c.mpin) setMpin(c.mpin);
    }
  }, [selectedAccountId]);

  const handleKiteConnect = async () => {
    if (!selectedAccountId || !apiKey || !apiSecret) return;
    setError("");
    setIsSubmitting(true);
    try {
      const trimmedRedirect = redirectUrl.trim();
      await saveKiteCredentials({
        accountId: selectedAccountId as any,
        apiKey,
        apiSecret,
        redirectUrl: trimmedRedirect,
        providerId: provider._id,
      });
      const loginUrl = getLoginURL(apiKey, trimmedRedirect);
      window.open(loginUrl, "_blank");
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKotakSaveCredentials = async () => {
    if (!selectedAccountId || !consumerKey || !mobileNumber || !ucc || !mpin) return;
    setError("");
    setIsSubmitting(true);
    try {
      await saveKotakCredentials({
        accountId: selectedAccountId as any,
        consumerKey,
        mobileNumber,
        ucc,
        mpin,
        providerId: provider._id,
      });
      setStep("totp");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKotakTOTP = async () => {
    if (!selectedAccountId || !totp || totp.length !== 6) return;
    setError("");
    setIsSubmitting(true);
    try {
      await convex.action(api.kotakAuth.authenticateKotak, {
        accountId: selectedAccountId as any,
        totp,
      });
      onClose();
    } catch (e: any) {
      setError(e.message);
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
              {isKotak
                ? "Enter credentials and TOTP to sync your portfolio."
                : "Link your brokerage account to sync data."}
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

              {!isKotak && step === "credentials" && (
                <>
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
                          placeholder="Enter your Kite API key"
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs text-muted-foreground">API Secret</span>
                        <input
                          type="password"
                          value={apiSecret}
                          onChange={(e) => setApiSecret(e.target.value)}
                          placeholder="Enter your Kite API secret"
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs text-muted-foreground">Redirect URL</span>
                        <input
                          type="text"
                          value={redirectUrl}
                          onChange={(e) => setRedirectUrl(e.target.value)}
                          placeholder="http://localhost:3000/kite/callback"
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border/60 bg-foreground/[0.02] p-3">
                    <div className="flex items-start gap-2">
                      <ExternalLinkIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                      <div className="text-xs text-muted-foreground leading-relaxed">
                        You will be redirected to Zerodha to authorize. Set your Kite app redirect
                        URL to{" "}
                        <code className="rounded bg-foreground/[0.06] px-1 py-0.5 font-mono text-[11px]">
                          {redirectUrl.trim() || "/kite/callback"}
                        </code>{" "}
                        in your Kite Developer Console.
                      </div>
                    </div>
                  </div>
                </>
              )}

              {isKotak && step === "credentials" && (
                <div>
                  <div className="mb-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                    Kotak Neo Credentials
                  </div>
                  <div className="space-y-3">
                    <label className="block">
                      <span className="mb-1 block text-xs text-muted-foreground">Consumer Key</span>
                      <input
                        type="password"
                        value={consumerKey}
                        onChange={(e) => setConsumerKey(e.target.value)}
                        placeholder="Your Kotak Neo consumer key"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs text-muted-foreground">Mobile Number</span>
                      <input
                        type="text"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs text-muted-foreground">UCC</span>
                      <input
                        type="text"
                        value={ucc}
                        onChange={(e) => setUcc(e.target.value)}
                        placeholder="Your Unique Client Code"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs text-muted-foreground">MPIN</span>
                      <input
                        type="password"
                        value={mpin}
                        onChange={(e) => setMpin(e.target.value)}
                        placeholder="Your Kotak Neo MPIN"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </label>
                  </div>
                </div>
              )}

              {isKotak && step === "totp" && (
                <div>
                  <div className="mb-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                    Enter TOTP
                  </div>
                  <label className="block">
                    <span className="mb-1 block text-xs text-muted-foreground">
                      6-Digit TOTP Code
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={totp}
                      onChange={(e) => setTotp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000"
                      autoFocus
                      className="flex h-12 w-full rounded-md border border-input bg-background px-4 text-center font-mono text-2xl tracking-[0.3em] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </label>
                  <p className="mt-3 text-muted-foreground text-xs">
                    Open your Kotak Neo app to get the 6-digit TOTP. This code refreshes every 30
                    seconds.
                  </p>
                </div>
              )}

              {error && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3">
                  <p className="text-destructive text-xs">{error}</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-between border-border/60 border-t bg-background px-5 py-3 shrink-0">
          {isKotak && step === "totp" && (
            <Button variant="ghost" onClick={() => setStep("credentials")}>
              Back
            </Button>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            {!isKotak && (
              <Button
                onClick={handleKiteConnect}
                disabled={!selectedAccountId || !apiKey || !apiSecret || isSubmitting}
              >
                <LinkIcon className="mr-1 size-4" />
                {isSubmitting ? "Connecting..." : "Connect & Authorize"}
              </Button>
            )}
            {isKotak && step === "credentials" && (
              <Button
                onClick={handleKotakSaveCredentials}
                disabled={!selectedAccountId || !consumerKey || !mobileNumber || !ucc || !mpin || isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Continue"}
              </Button>
            )}
            {isKotak && step === "totp" && (
              <Button
                onClick={handleKotakTOTP}
                disabled={!totp || totp.length !== 6 || isSubmitting}
              >
                {isSubmitting ? "Authenticating..." : "Authenticate"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
