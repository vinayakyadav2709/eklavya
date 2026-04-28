import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/budget')({
  component: Budget,
})

function Budget() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Budget App</h1>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <p className="text-gray-500">Your transactions will appear here.</p>
      </div>
    </div>
  )
}
