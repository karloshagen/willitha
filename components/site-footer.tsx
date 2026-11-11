import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-4 px-5 py-10 text-sm text-muted sm:px-10">
        <p>
          Will It HA is a community-maintained directory. Verify the integration, firmware, and your
          installer before you buy. Some links are sponsor or affiliate links.
        </p>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2 font-medium">
          <Link href="/submit" className="hover:text-blue">
            Submit a device
          </Link>
          <Link href="/sponsor" className="hover:text-blue">
            Sponsor
          </Link>
          <Link href="/#signup" className="hover:text-blue">
            Newsletter
          </Link>
        </nav>
        <p>Made for Australian Home Assistant users. Prices in A$.</p>
      </div>
    </footer>
  );
}
