import { createFileRoute, Outlet, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/attack-mode')({
  component: AttackModeLayout,
})

function AttackModeLayout() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Attack Mode</h1>
      <nav className="flex space-x-4 mb-8 border-b pb-4">
        <Link to="/attack-mode" className="[&.active]:font-bold [&.active]:text-blue-600">Overview</Link>
        <Link to="/attack-mode/journal" className="[&.active]:font-bold [&.active]:text-blue-600">Pointed Journal</Link>
        <Link to="/attack-mode/goals" className="[&.active]:font-bold [&.active]:text-blue-600">Goals</Link>
        <Link to="/attack-mode/problems" className="[&.active]:font-bold [&.active]:text-blue-600">Problem Solving</Link>
      </nav>
      <Outlet />
    </div>
  )
}
