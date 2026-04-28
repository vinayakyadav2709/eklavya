import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/attack-mode/journal')({
  component: Journal,
})

function Journal() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Pointed Journaling</h2>
      <p className="text-gray-500">Track procrastination and behaviors to fix.</p>
    </div>
  )
}
