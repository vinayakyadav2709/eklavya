import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/accounts')({
  component: () => <div className="p-4">Accounts Content</div>
})
