import { Outlet, createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '@eklavya/db/convex/_generated/api'
import { WorkspaceLayout } from '../components/workspace-layout'

export const Route = createFileRoute('/_app')({
  component: LayoutComponent,
})

function LayoutComponent() {
  // Hoisting these queries ensures the WebSocket subscription to Convex
  // stays alive even when navigating between child routes (tabs).
  useQuery(api.accounts.get)
  useQuery(api.transactions.get)

  return (
    <WorkspaceLayout>
      <Outlet />
    </WorkspaceLayout>
  )
}
