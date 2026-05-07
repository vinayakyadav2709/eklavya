import { useState } from "react";
import {
  BanknoteIcon,
  CreditCardIcon,
  LandmarkIcon,
  LineChartIcon,
  PlusIcon,
  UserIcon,
  XIcon,
} from "lucide-react";
import { Button } from "#/components/ui/button";

import { useMutation } from "convex/react";
import { api } from "@eklavya/db/convex/_generated/api";

type Category = "liquid" | "investment" | "credit" | "entity";

const CATEGORIES: { id: Category; label: string; meta: string; Icon: typeof LandmarkIcon }[] = [
  { id: "liquid", label: "Bank / Liquid", meta: "Savings, checking, wallets", Icon: LandmarkIcon },
  { id: "investment", label: "Investment", meta: "Brokerage, mutual funds", Icon: LineChartIcon },
  { id: "credit", label: "Credit", meta: "Credit cards, loans", Icon: CreditCardIcon },
  { id: "entity", label: "Person / Entity", meta: "Lent/borrowed money", Icon: UserIcon },
];

export function AddAccountModal({ onClose }: { onClose: () => void }) {
  const createAccount = useMutation(api.accounts.create);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [category, setCategory] = useState<Category>("liquid");
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [institution, setInstitution] = useState("");

  const isEntity = category === "entity";
  const isCredit = category === "credit";
  const [isLiability, setIsLiability] = useState(isCredit);

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      await createAccount({
        name,
        category,
        balance: parseFloat(balance) || 0,
        institution: institution || undefined,
        isLiability,
      });
      onClose();
    } catch (e) {
      console.error("Failed to save account", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/70 backdrop-blur-sm" 
        onClick={onClose} 
        aria-hidden="true"
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-border bg-background shadow-2xl flex flex-col max-h-full">
        <div className="flex items-center justify-between border-border/60 border-b px-5 py-3.5 shrink-0">
          <div>
            <div className="font-heading text-sm">Add Account</div>
            <div className="mt-0.5 text-muted-foreground text-xs">
              Create a new bucket to track your finances.
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
          <div>
            <div className="mb-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
              Category
            </div>
            <div className="flex flex-col gap-2">
              {CATEGORIES.map((c) => {
                const active = category === c.id;
                return (
                  <label
                    key={c.id}
                    className={
                      "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors " +
                      (active
                        ? "border-foreground/60 bg-foreground/[0.04]"
                        : "border-border/60 hover:border-foreground/30")
                    }
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      checked={active}
                      onChange={() => {
                        setCategory(c.id);
                        setIsLiability(c.id === "credit");
                      }}
                    />
                    <span
                      className={
                        "size-3.5 rounded-full border " +
                        (active
                          ? "border-foreground bg-foreground ring-2 ring-foreground/20 ring-offset-2 ring-offset-background"
                          : "border-border")
                      }
                    />
                    <c.Icon className="size-4 opacity-70" />
                    <div className="flex-1">
                      <div className="text-sm">{c.label}</div>
                      <div className="text-muted-foreground text-xs">
                        {c.meta}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
              Details
            </div>
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs text-muted-foreground">Account Name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. HDFC Savings"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs text-muted-foreground">Initial Balance (₹)</span>
                <div className="relative">
                  <BanknoteIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                  <input
                    type="number"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    placeholder="0.00"
                    className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </label>

              {!isEntity && (
                <label className="block">
                  <span className="mb-1 block text-xs text-muted-foreground">Institution / Broker (Optional)</span>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. Zerodha"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </label>
              )}

              {isEntity && (
                <label className="flex cursor-pointer items-center gap-2.5 rounded-md py-2">
                  <input
                    type="checkbox"
                    checked={isLiability}
                    onChange={(e) => setIsLiability(e.target.checked)}
                    className="size-4 rounded border-gray-300"
                  />
                  <div>
                    <span className="block text-sm font-medium">I owe them money</span>
                    <span className="block text-xs text-muted-foreground">Check this if this is a loan you have to repay.</span>
                  </div>
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end border-border/60 border-t bg-background px-5 py-3 shrink-0">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!name || !balance || isSubmitting}
            >
              <PlusIcon className="mr-1 size-4" />
              {isSubmitting ? "Adding..." : "Add Account"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
