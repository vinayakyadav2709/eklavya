import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { PlusIcon } from 'lucide-react'
import { TableAccounts } from '../../components/table-accounts'
import { AddAccountModal } from '../../components/modals-add-account'
import { useQuery } from "convex/react"
import { api } from "@eklavya/db/convex/_generated/api"

export const Route = createFileRoute('/_app/accounts')({
  component: AccountsPage
})

function AccountsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const accounts = useQuery(api.accounts.get)

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      <header className="shrink-0 flex items-center justify-between border-b border-border/60 px-6 py-4">
        <div>
          <h1 className="font-heading text-2xl">Accounts</h1>
          <p className="text-muted-foreground text-sm">
            Manage your bank accounts, credit cards, investments, and loans.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <PlusIcon className="size-4" />
          Add Account
        </button>
      </header>
      
      <main className="flex-1 overflow-auto p-6">
        <TableAccounts accounts={accounts} />
      </main>

      {isModalOpen && <AddAccountModal onClose={() => setIsModalOpen(false)} />}
    </div>
  )
}
