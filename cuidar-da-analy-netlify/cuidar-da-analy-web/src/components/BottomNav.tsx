import type { Tab } from '../lib/ui';
import { Icon, type IconName } from './Icon';

const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'hoje', label: 'Hoje', icon: 'heart' },
  { id: 'coisas', label: 'Coisas', icon: 'gift' },
  { id: 'postagens', label: 'Postagens', icon: 'image' },
  { id: 'cartas', label: 'Cartas', icon: 'mail' },
  { id: 'mais', label: 'Mais', icon: 'dots' },
];

export function BottomNav({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface pb-[env(safe-area-inset-bottom,0px)]"
    >
      <ul className="mx-auto grid max-w-xl grid-cols-5">
        {TABS.map((tab) => {
          const current = tab.id === active;
          return (
            <li key={tab.id}>
              <button
                type="button"
                onClick={() => onChange(tab.id)}
                aria-current={current ? 'page' : undefined}
                className={`flex min-h-[56px] w-full flex-col items-center justify-center gap-0.5 text-xs ${
                  current ? 'font-semibold text-primary-strong' : 'font-medium text-soft'
                }`}
              >
                <span className={`flex h-7 w-12 items-center justify-center rounded-full ${current ? 'bg-accent' : ''}`}>
                  <Icon name={tab.icon} className="h-5 w-5" />
                </span>
                {tab.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
