import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/attack-mode/goals')({
  component: Goals,
})

function Goals() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Goal Blueprints (4 Columns)</h2>
      <p className="text-gray-500">What I Know | What I Don't Know | Industry Secrets | What To Unlearn</p>
    </div>
  )
}
