import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/new-me')({
  component: () => <div className="p-4">New Me Content</div>
})
