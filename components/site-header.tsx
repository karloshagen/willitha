import Link from "next/link";
import { Logo } from "@/components/logo";

const links = [
  { href: "/search", label: "Directory" },
  { href: "/submit", label: "Submit" },
  { href: "/sponsor", label: "Sponsor" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-line/80 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-3 py-3 sm:px-4">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>
        <nav aria-label="Primary" className="flex items-center text-sm font-semibold">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-2 py-2 text-ink hover:bg-sand sm:px-3"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
