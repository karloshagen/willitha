export function Logo() {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap sm:gap-2">
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="#1b6b43" />
        <circle cx="16" cy="12.5" r="4.5" fill="#f4d7a1" />
        <path d="M8 21.5h16v3.2a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-3.2z" fill="#f6f1e6" />
        <path d="M24 22.4h2.2v2.2H24z" fill="#f6f1e6" />
      </svg>
      <span className="font-display text-lg leading-none tracking-tight sm:text-xl">Will It HA</span>
      <span className="rounded-full bg-ochre-soft px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-ochre">
        AU
      </span>
    </span>
  );
}
