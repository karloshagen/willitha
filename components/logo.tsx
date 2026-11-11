export function Logo() {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap sm:gap-2">
      <svg className="h-8 w-8" viewBox="2 2 124 122" aria-hidden="true">
        <path
          d="M 22 114 H 106 V 56 L 64 18 L 22 56 Z"
          fill="none"
          stroke="#03A9F4"
          strokeWidth="9.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d="M 50 67 C 50 53, 79.5 51.5, 79.5 66.5 C 79.5 76, 66 78.5, 64 86.5 L 64 91"
          fill="none"
          stroke="#03A9F4"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="64" cy="101.6" r="5.6" fill="#03A9F4" />
      </svg>
      <span className="font-display text-lg leading-none tracking-tight text-ink sm:text-xl">
        Will It <span className="text-[#03A9F4]">HA</span>
      </span>
      <span className="rounded-full bg-ochre-soft px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-ochre">
        AU
      </span>
    </span>
  );
}
