import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CompassIcon,
  DollarSignIcon,
  HomeIcon,
  ListTodoIcon,
  SettingsIcon,
  WalletIcon,
} from "lucide-react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import * as React from "react";

type NavGroup = {
  label: string;
  items: { icon: typeof HomeIcon; label: string; to: string }[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Main",
    items: [{ icon: HomeIcon, label: "Dashboard", to: "/" }],
  },
  {
    label: "Finance",
    items: [
      { icon: DollarSignIcon, label: "Cashflow", to: "/cashflow" },
      { icon: WalletIcon, label: "Accounts", to: "/accounts" },
    ],
  },
  {
    label: "System",
    items: [
      { icon: ListTodoIcon, label: "Tasks", to: "/tasks" },
      { icon: CompassIcon, label: "New Me", to: "/new-me" },
    ],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

export function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const routerState = useRouterState();
  const navigate = useNavigate();
  const currentPath = routerState.location.pathname;
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div
      className={`grid min-h-svh bg-background text-foreground transition-[grid-template-columns] ${collapsed ? "grid-cols-[60px_1fr]" : "grid-cols-[240px_1fr]"}`}
    >
      {/* Collapsed mini-rail */}
      {collapsed ? (
        <aside className="flex h-svh flex-col items-center border-r border-border/60 bg-foreground/[0.02] py-3">
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="mb-2 flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/70 to-primary/30 font-medium text-[12px] text-foreground/85 transition-transform hover:scale-105"
            title="Eklavya OS"
          >
            E
          </button>

          <div className="my-3 h-px w-7 bg-border/60" />

          <ul className="flex flex-1 flex-col items-center gap-1">
            {ALL_ITEMS.map((item) => {
              const isActive =
                currentPath === item.to ||
                (item.to !== "/" && currentPath.startsWith(item.to));
              return (
                <li key={item.label} className="relative">
                  <Link
                    to={item.to}
                    title={item.label}
                    className={`group flex size-9 items-center justify-center rounded-lg transition-colors ${
                      isActive
                        ? "bg-foreground/[0.08] text-foreground"
                        : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"
                    }`}
                  >
                    <item.icon className="size-4" />
                  </Link>
                  {isActive ? (
                    <span className="-translate-y-1/2 absolute top-1/2 -left-3 h-5 w-1 rounded-r-full bg-foreground" />
                  ) : null}
                </li>
              );
            })}
          </ul>

          <div className="mt-auto flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => navigate({ to: "/settings" })}
              className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
              aria-label="Settings"
            >
              <SettingsIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
              aria-label="Expand sidebar"
            >
              <ChevronRightIcon className="size-4" />
            </button>
            <div className="flex size-8 items-center justify-center rounded-full bg-foreground font-medium text-[11px] text-background ring-2 ring-background">
              VY
            </div>
          </div>
        </aside>
      ) : (
        /* Expanded full sidebar */
        <aside className="flex h-svh flex-col border-r border-border/60 bg-foreground/[0.02]">
          <div className="flex items-center gap-2 border-b border-border/60 px-3.5 py-3">
            <div className="flex size-7 items-center justify-center rounded-md bg-gradient-to-br from-primary/70 to-primary/30 ring-1 ring-border/60 font-medium text-[11px] text-foreground/85">
              E
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium text-sm">Eklavya OS</div>
              <div className="truncate font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                System
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
              aria-label="Collapse sidebar"
            >
              <ChevronLeftIcon className="size-4" />
            </button>
          </div>

          <nav className="mt-3 flex-1 overflow-y-auto px-2 pb-4">
            {NAV_GROUPS.map((group, gi) => (
              <React.Fragment key={group.label}>
                {gi > 0 && (
                  <div className="mt-5 mb-1 flex items-center justify-between px-2">
                    <span className="font-mono text-[9px] text-muted-foreground/70 uppercase tracking-[0.25em]">
                      {group.label}
                    </span>
                  </div>
                )}
                <ul className="flex flex-col gap-0.5">
                  {group.items.map((item) => {
                    const isActive =
                      currentPath === item.to ||
                      (item.to !== "/" && currentPath.startsWith(item.to));
                    return (
                      <li key={item.label}>
                        <Link
                          to={item.to}
                          className={`flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                            isActive
                              ? "bg-foreground/[0.06] text-foreground"
                              : "text-muted-foreground hover:bg-foreground/[0.03] hover:text-foreground"
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <item.icon className="size-4 opacity-70" />
                            {item.label}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </React.Fragment>
            ))}
          </nav>

          <div className="flex items-center gap-2 border-t border-border/60 px-3 py-2.5">
            <div className="flex size-7 items-center justify-center rounded-full bg-foreground font-medium text-[11px] text-background">
              VY
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium text-sm">Vinayak Yadav</div>
              <div className="flex items-center gap-1.5 truncate text-muted-foreground text-xs">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Online
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate({ to: "/settings" })}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
              aria-label="Settings"
            >
              <SettingsIcon className="size-4" />
            </button>
          </div>
        </aside>
      )}

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
