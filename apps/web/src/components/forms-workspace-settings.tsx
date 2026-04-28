import { PuzzleIcon } from "lucide-react";

const INTEGRATIONS_NAV = [
  { icon: PuzzleIcon, label: "Integrations", active: true },
];

export function FormsWorkspaceSettingsShowcasePage() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="mx-auto grid min-h-svh max-w-5xl grid-cols-[220px_1fr]">
        <aside className="border-r border-border/60 px-4 py-8">
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
            Settings
          </div>
          <div className="mt-1 truncate font-heading text-lg">Eklavya OS</div>
          <ul className="mt-6 flex flex-col gap-0.5">
            {INTEGRATIONS_NAV.map(({ icon: Icon, label, active }) => (
              <li key={label}>
                <button
                  type="button"
                  className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                    active
                      ? "bg-foreground/[0.06] text-foreground"
                      : "text-muted-foreground hover:bg-foreground/[0.03] hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4 opacity-70" />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="px-10 py-12 pb-32">
          <header className="flex items-end justify-between border-b border-border/60 pb-6">
            <div>
              <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
                Settings · Integrations
              </div>
              <h1 className="mt-1 font-heading text-2xl">Broker Integration</h1>
              <p className="mt-1 text-muted-foreground text-sm">
                Connect your trading account with a supported broker.
              </p>
            </div>
          </header>

          <div className="mt-8 grid grid-cols-[180px_minmax(0,1fr)] gap-x-10 gap-y-6">
            <div>
              <h2 className="font-medium text-sm">Broker</h2>
              <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
                Select your preferred trading platform.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <BrokerOption
                label="Kotak Securities"
                value="kotak"
                defaultChecked
                name="broker"
              />
              <BrokerOption
                label="Zerodha Kite"
                value="kite"
                name="broker"
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function BrokerOption({
  label,
  value,
  name,
  defaultChecked,
}: {
  label: string;
  value: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/60 bg-background/40 px-4 py-3 transition-colors hover:border-border has-[:checked]:border-primary/50 has-[:checked]:bg-primary/[0.02]">
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="size-4 accent-primary"
      />
      <span className="font-medium text-sm">{label}</span>
    </label>
  );
}
