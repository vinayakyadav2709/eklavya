import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useConvex, useQuery } from "convex/react";
import { api } from "@eklavya/db/convex/_generated/api";
import { useEffect, useRef, useState } from "react";
import { CheckIcon, XIcon, LoaderIcon } from "lucide-react";

export const Route = createFileRoute("/kite/callback")({
  component: KiteCallback,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      request_token: (search.request_token as string) || "",
      status: (search.status as string) || "",
      accountId: (search.accountId as string) || "",
    };
  },
});

function KiteCallback() {
  const navigate = useNavigate();
  const convex = useConvex();
  const search = Route.useSearch();

  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const done = useRef(false);

  const accountsData = useQuery(api.accounts.get);

  useEffect(() => {
    if (done.current) return;
    if (accountsData === undefined) return;

    done.current = true;

    async function handleCallback() {
      try {
        if (search.status === "error") {
          setState("error");
          setErrorMsg("Kite login was cancelled or failed. Please try again.");
          return;
        }

        if (!search.request_token) {
          setState("error");
          setErrorMsg("No request token received from Kite.");
          return;
        }

        let targetAccountId = search.accountId;

        if (!targetAccountId && accountsData) {
          const pending = accountsData.find(
            (a) => a.apiConfig?.status === "pending"
          );
          if (pending) {
            targetAccountId = pending._id;
          }
        }

        if (!targetAccountId) {
          setState("error");
          setErrorMsg(
            "No pending Kite account found. Please connect a Kite account first from Settings > Integrations."
          );
          return;
        }

        await convex.mutation(api.accounts.saveRequestToken, {
          accountId: targetAccountId as any,
          requestToken: search.request_token,
        });

        await convex.action(api.kiteAuth.generateSession, {
          accountId: targetAccountId as any,
        });

        setState("success");
      } catch (err: any) {
        setState("error");
        setErrorMsg(err.message || "Failed to complete Kite authentication.");
      }
    }

    handleCallback();
  }, [accountsData]);

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-2xl">
        {state === "loading" && (
          <div className="space-y-4">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
              <LoaderIcon className="size-6 animate-spin text-primary" />
            </div>
            <h1 className="font-heading text-xl">Connecting to Kite</h1>
            <p className="text-muted-foreground text-sm">
              Exchanging request token for access token...
            </p>
          </div>
        )}

        {state === "success" && (
          <div className="space-y-4">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckIcon className="size-6 text-emerald-500" />
            </div>
            <h1 className="font-heading text-xl">Connected!</h1>
            <p className="text-muted-foreground text-sm">
              Your Kite account has been linked successfully.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate({ to: "/holdings" })}
                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Go to Holdings
              </button>
              <button
                onClick={() => navigate({ to: "/settings" })}
                className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-foreground/[0.04]"
              >
                Settings
              </button>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="space-y-4">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10">
              <XIcon className="size-6 text-destructive" />
            </div>
            <h1 className="font-heading text-xl">Authentication Failed</h1>
            <p className="text-muted-foreground text-sm">{errorMsg}</p>
            <button
              onClick={() => navigate({ to: "/settings" })}
              className="mt-2 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Go to Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
