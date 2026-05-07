import { useState } from "react";
import {
  BanknoteIcon,
  CalendarIcon,
  MessageSquareIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  RepeatIcon,
  XIcon,
  CheckIcon,
} from "lucide-react";
import { Button } from "#/components/ui/button";

import { useMutation, useQuery } from "convex/react";
import { api } from "@eklavya/db/convex/_generated/api";

type TransactionType = "expense" | "income" | "transfer";

const TYPES: { id: TransactionType; label: string; Icon: typeof ArrowRightIcon }[] = [
  { id: "expense", label: "Expense", Icon: ArrowRightIcon },
  { id: "income", label: "Income", Icon: ArrowLeftIcon },
  { id: "transfer", label: "Transfer", Icon: RepeatIcon },
];

export function AddTransactionModal({ onClose }: { onClose: () => void }) {
  const createTx = useMutation(api.transactions.create);
  const accounts = useQuery(api.accounts.get);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [sourceAccount, setSourceAccount] = useState("");
  const [destAccount, setDestAccount] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      await createTx({
        type,
        amount: parseFloat(amount) || 0,
        date,
        description: description || "Untitled Transaction", // Provide fallback description
        category: category || undefined,
        fromAccountId: (type === "expense" || type === "transfer") && sourceAccount ? sourceAccount as any : undefined,
        toAccountId: (type === "income" || type === "transfer") && destAccount ? destAccount as any : undefined,
        isRecurring,
        recurrenceFrequency: isRecurring ? "monthly" : undefined, // hardcoding monthly for now
      });
      onClose();
    } catch (e) {
      console.error("Failed to save transaction", e);
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
            <div className="font-heading text-sm">Add Transaction</div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-md p-1 text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Type Selector */}
          <div className="flex w-full rounded-lg bg-foreground/[0.03] p-1">
            {TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-xs font-medium transition-colors ${
                  type === t.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <t.Icon className="size-3.5" />
                {t.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {/* Amount */}
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-foreground">Amount (₹)</span>
              <div className="relative">
                <BanknoteIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  autoFocus
                />
              </div>
            </label>

            {/* Date */}
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-foreground">Date</span>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </label>

            {/* Account Routing based on Type */}
            {type === "expense" && (
              <>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-foreground">Source Account</span>
                  <select
                    value={sourceAccount}
                    onChange={(e) => setSourceAccount(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Select account...</option>
                    {accounts?.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-foreground">Category</span>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Food, Rent, Entertainment"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </label>
              </>
            )}

            {type === "income" && (
              <>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-foreground">Destination Account</span>
                  <select
                    value={destAccount}
                    onChange={(e) => setDestAccount(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Select account...</option>
                    {accounts?.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-foreground">Source / Category</span>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Salary, Freelance, Dividend"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </label>
              </>
            )}

            {type === "transfer" && (
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-foreground">From Account</span>
                  <select
                    value={sourceAccount}
                    onChange={(e) => setSourceAccount(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">From...</option>
                    {accounts?.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-foreground">To Account</span>
                  <select
                    value={destAccount}
                    onChange={(e) => setDestAccount(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">To...</option>
                    {accounts?.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            {/* Description */}
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-foreground">Description / Notes</span>
              <div className="relative">
                <MessageSquareIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional details..."
                  className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </label>

            <label className="flex cursor-pointer items-center gap-2 pt-2">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="size-4 rounded border-gray-300 accent-primary"
              />
              <span className="text-sm font-medium">This is a recurring transaction</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between border-border/60 border-t bg-background px-5 py-3 shrink-0">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button 
            type="button"
            onClick={handleSave}
            disabled={!amount || !date || isSubmitting}
          >
            <CheckIcon className="mr-1 size-4" />
            {isSubmitting ? "Saving..." : "Save Transaction"}
          </Button>
        </div>
      </div>
    </div>
  );
}
