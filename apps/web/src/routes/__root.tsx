import { Outlet, createRootRouteWithContext, HeadContent, Scripts, useRouterState } from '@tanstack/react-router'
import { useState, type ReactNode } from 'react'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import type { Doc } from '@eklavya/db/convex/_generated/dataModel'
import appCss from '../styles.css?url'

export interface RouterContext {
  accounts?: Doc<"accounts">[] | undefined
  transactions?: Doc<"transactions">[] | undefined
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Eklavya OS' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: RootComponent,
})

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function RootComponent() {
  const router = useRouterState()
  const isNotFound = router.matches.some((m) => m.status === 'notFound')
  
  // Initialize Convex client purely on the client side
  const [convex] = useState(() => new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string))

  if (isNotFound) {
    return (
      <ConvexProvider client={convex}>
        <RootDocument>
          <Outlet />
        </RootDocument>
      </ConvexProvider>
    )
  }

  return (
    <ConvexProvider client={convex}>
      <RootDocument>
        <Outlet />
      </RootDocument>
    </ConvexProvider>
  )
}
