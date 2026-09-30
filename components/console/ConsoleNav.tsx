"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Destination = {
  label: string;
  href?: string;
  match?: (pathname: string) => boolean;
};

/**
 * Global product navigation.
 *
 * Destinations with an `href` are real, working routes. The rest are rendered
 * as visibly disabled "Soon" items: the shape of the product stays legible and
 * scalable without implying that anything unbuilt is usable. Give an entry an
 * `href` only once its route and its data both exist.
 *
 * Settings is deliberately absent — it belongs to the account menu, so it does
 * not compete with product navigation.
 */
const DESTINATIONS: Destination[] = [
  { label: "Home", href: "/workspace", match: (p) => p === "/workspace" },
  {
    label: "Agents",
    href: "/agents",
    match: (p) => p.startsWith("/agents") || p.startsWith("/sales-operator") || p.startsWith("/desktop-portal"),
  },
  { label: "Knowledge" },
  {
    label: "Integrations",
    href: "/integrations",
    match: (p) => p.startsWith("/integrations"),
  },
  { label: "Activity" },
];

export function ConsoleNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav className="console-nav" aria-label="YDeck">
      {DESTINATIONS.map((destination) => {
        if (!destination.href) {
          return (
            <span
              key={destination.label}
              className="console-nav__link console-nav__link--soon"
              aria-disabled="true"
            >
              {destination.label}
              <span className="console-nav__soon">Soon</span>
            </span>
          );
        }

        const active = destination.match?.(pathname) ?? false;
        return (
          <Link
            key={destination.label}
            className="console-nav__link"
            href={destination.href}
            aria-current={active ? "page" : undefined}
          >
            {destination.label}
          </Link>
        );
      })}
    </nav>
  );
}
