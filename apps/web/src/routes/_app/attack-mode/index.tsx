import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/attack-mode/')({
  component: AttackModeHome,
})

function AttackModeHome() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Command Center</h2>
      <p className="text-gray-500">Welcome to Attack Mode. Select a module above to begin.</p>
    </div>
  )
}
