"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "willitha-sponsor-closed";
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function closedId(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function SponsorBar({
  id,
  href,
  kicker,
  message,
}: {
  id: string;
  href: string;
  kicker: string;
  message: string;
}) {
  const hidden = useSyncExternalStore(
    subscribe,
    () => closedId() === id,
    () => false,
  );

  if (hidden) return null;

  return (
    <div className="sponsor-bar bg-ink text-paper">
      <div className="mx-auto flex w-full max-w-5xl items-start gap-3 px-4 py-2 text-sm">
        <Link href={href} className="min-w-0 flex-1 leading-snug hover:underline">
          <span className="font-semibold">{kicker}</span>
          {message ? <span className="text-paper/80"> — {message}</span> : null}
        </Link>
        <button
          type="button"
          className="shrink-0 rounded-full px-2 py-1 text-base leading-none text-paper/80 hover:bg-white/10 hover:text-paper"
          aria-label="Close sponsor message"
          onClick={() => {
            try {
              window.localStorage.setItem(STORAGE_KEY, id);
            } catch {
              /* private mode still hides the bar for this view */
            }
            emit();
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
