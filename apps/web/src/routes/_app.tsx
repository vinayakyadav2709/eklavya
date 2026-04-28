import { Outlet, createFileRoute } from '@tanstack/react-router'
import { WorkspaceLayout } from '../components/workspace-layout'

export const Route = createFileRoute('/_app')({
  component: LayoutComponent,
})

function LayoutComponent() {
  return (
    <WorkspaceLayout>
      <Outlet />
    </WorkspaceLayout>
  )
}
