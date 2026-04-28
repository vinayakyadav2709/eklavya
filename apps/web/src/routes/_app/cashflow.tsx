import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/cashflow')({
  component: () => <div className="p-4">Cashflow Content</div>
})
