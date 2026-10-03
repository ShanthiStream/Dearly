import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Page({
  title,
  intro,
  children,
  className,
  wide,
}: {
  title: string;
  intro?: ReactNode;
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div className={cn("mx-auto w-full px-4 pb-10 pt-6 sm:py-10", wide ? "max-w-6xl" : "max-w-3xl", className)}>
      <header className="mb-5 sm:mb-8">
        <h1 className="text-balance-title text-2xl sm:text-4xl">{title}</h1>
        {intro ? <div className="mt-2 text-sm text-muted-foreground sm:text-base">{intro}</div> : null}
      </header>
      {children}
    </div>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-foreground/90 [&_h2]:mt-8 [&_h2]:text-xl [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2">
      {children}
    </div>
  );
}
