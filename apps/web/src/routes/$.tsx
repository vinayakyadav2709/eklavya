import { createFileRoute } from '@tanstack/react-router'
import { Empty404ShowcasePage } from '../components/empty-404'

export const Route = createFileRoute('/$')({
  component: Empty404ShowcasePage,
})
