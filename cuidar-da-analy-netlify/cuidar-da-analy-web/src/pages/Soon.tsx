import { Icon, type IconName } from '../components/Icon';

export function Soon({ title, icon, children }: { title: string; icon: IconName; children: string }) {
  return (
    <div className="pt-6">
      <h1 className="text-[1.9rem] leading-tight">{title}</h1>
      <div className="mt-10 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent text-accent-ink">
          <Icon name={icon} className="h-7 w-7" />
        </span>
        <p className="mx-auto mt-4 max-w-xs text-soft">{children}</p>
      </div>
    </div>
  );
}
