export function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap">
      <svg className="h-[30px] w-[30px] sm:h-[34px] sm:w-[34px]" viewBox="2 2 124 122" aria-hidden="true">
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
      <span className="inline-flex items-center gap-2 font-display text-[1.15rem] leading-none font-semibold tracking-[-0.035em] text-ink sm:text-[1.25rem]">
        <span>
          Will It <span className="text-[#03A9F4]">HA</span>
        </span>
        <span className="relative -top-px rounded-full border border-[#cfeefe] px-1.5 pt-0.5 pb-px font-sans text-[9px] leading-[1.3] font-semibold tracking-[0.1em] text-[#03A9F4]">
          AU
        </span>
      </span>
    </span>
  );
}
