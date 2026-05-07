import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { PlusIcon } from 'lucide-react'
import { TableTransactionsShowcasePage } from '../../components/table-transactions'
import { AddTransactionModal } from '../../components/modals-add-transaction'
import { useQuery } from "convex/react"
import { api } from "@eklavya/db/convex/_generated/api"

export const Route = createFileRoute('/_app/cashflow')({
  component: CashflowPage
})

function CashflowPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const transactions = useQuery(api.transactions.get)

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      <header className="shrink-0 flex items-center justify-between border-b border-border/60 px-6 py-4">
        <div>
          <h1 className="font-heading text-2xl">Cashflow</h1>
          <p className="text-muted-foreground text-sm">
            Track your income, expenses, and inter-account transfers.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <PlusIcon className="size-4" />
          Add Transaction
        </button>
      </header>
      
      <main className="flex-1 overflow-auto p-6">
        <TableTransactionsShowcasePage transactions={transactions} />
      </main>

      {isModalOpen && <AddTransactionModal onClose={() => setIsModalOpen(false)} />}
    </div>
  )
}
