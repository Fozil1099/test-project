import { NavLink } from 'react-router-dom';
import { cn } from '@/shared/lib';

const items = [
  {
    to: '/',
    label: 'Должники',
    testId: 'nav-debtors',
    icon: <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />,
  },
  {
    to: '/students',
    label: 'Ученики',
    testId: 'nav-students',
    icon: (
      <>
        <circle cx="9" cy="8" r="3.5" />
        <path
          d="M2.5 19c.8-3.2 3.4-5 6.5-5s5.7 1.8 6.5 5M16 4.5a3.5 3.5 0 0 1 0 7M18.5 14c1.6.7 2.6 2.4 3 5"
          strokeLinecap="round"
        />
      </>
    ),
  },
];

export function BottomNav() {
  return (
    <nav
      aria-label="Основная навигация"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto grid max-w-xl grid-cols-2">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === '/'}
              data-testid={item.testId}
              className={({ isActive }) =>
                cn(
                  'flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium',
                  isActive ? 'text-indigo-600' : 'text-slate-500',
                )
              }
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="size-6"
                aria-hidden
              >
                {item.icon}
              </svg>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
