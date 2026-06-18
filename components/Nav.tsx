"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { classNames } from "@/lib/utils";

const links = [
  { href: "/", label: "Overview" },
  { href: "/projects", label: "Projects" },
  { href: "/income", label: "Income" },
  { href: "/tasks", label: "Tasks" },
  { href: "/goal", label: "Goal" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-[#ececec] bg-white">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Studio Control</p>
          <h1 className="text-lg font-semibold">Freelance Dashboard</h1>
        </div>
        <nav className="flex gap-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={classNames(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition",
                  active
                    ? "bg-accent text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
