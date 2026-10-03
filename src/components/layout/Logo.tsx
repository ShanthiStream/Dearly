import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  title?: string;
};

/**
 * Premium "DS" monogram: a thin ring with a warm gradient plate and
 * serif letterforms. Colour comes from theme tokens only.
 */
export function Logo({ className, title = "Dearly Studio" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label={title}
      className={cn("size-9 shrink-0", className)}
    >
      <defs>
        <linearGradient id="ds-plate" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.72" />
        </linearGradient>
      </defs>

      <circle cx="24" cy="24" r="23" fill="none" stroke="currentColor" strokeOpacity="0.25" />
      <circle cx="24" cy="24" r="19.5" fill="url(#ds-plate)" />

      <text
        x="24"
        y="24"
        textAnchor="middle"
        dominantBaseline="central"
        className="font-serif"
        fontSize="19"
        fontWeight={600}
        letterSpacing="0.5"
        fill="var(--color-primary-foreground, #fff)"
      >
        DS
      </text>
    </svg>
  );
}
