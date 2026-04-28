import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/tasks')({
  component: () => <div className="p-4">Tasks Content (Mix of all 4)</div>
})
