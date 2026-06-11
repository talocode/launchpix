import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export function GetStartedCard({
  title,
  description,
  href,
  icon
}: {
  title: string;
  description: string;
  href: Route;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="api-dashboard-card group block rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-[#111111] p-5 transition-colors hover:border-[rgba(255,255,255,0.14)] hover:bg-[#121212] sm:p-6"
    >
      <span className="flex size-9 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#0d0d0d] text-[#a1a1a1] group-hover:text-[#f5f5f5]">
        {icon}
      </span>
      <p className="mt-4 text-sm font-medium text-[#f5f5f5]">{title}</p>
      <p className="mt-1.5 text-sm leading-6 text-[#8a8a8a]">{description}</p>
    </Link>
  );
}