import Link from "next/link";
import { Logo } from "@/components/logo";

const links = [
  { href: "/search", label: "Directory" },
  { href: "/tested", label: "Tested at home" },
  { href: "/submit", label: "Submit" },
  { href: "/sponsor", label: "Sponsor" },
];

export function SiteHeader() {
  return (
    <header className="bg-white">
      <div className="mx-auto flex w-full max-w-[1080px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4 sm:px-10 sm:pt-5 sm:pb-[18px]">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>
        <nav aria-label="Primary" className="flex w-full flex-wrap items-center gap-4 text-[13px] font-medium text-muted sm:w-auto sm:gap-[26px] sm:text-sm">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
