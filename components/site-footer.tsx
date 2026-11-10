import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-8 text-sm text-muted">
        <p>
          Will It HA is a community-maintained directory. Verify the integration, firmware, and your
          installer before you buy. Some links are sponsor or affiliate links.
        </p>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-4 gap-y-2 font-semibold text-ink">
          <Link href="/submit" className="underline decoration-line underline-offset-4">
            Submit a device
          </Link>
          <Link href="/sponsor" className="underline decoration-line underline-offset-4">
            Sponsor
          </Link>
          <Link href="/#signup" className="underline decoration-line underline-offset-4">
            Newsletter
          </Link>
        </nav>
        <p>Made for Australian Home Assistant users. Prices in A$.</p>
      </div>
    </footer>
  );
}
