import type { SVGProps } from "react";

type IndonesianRupiahProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
};

/** Lucide-style Rp icon when lucide-react has no IndonesianRupiah export. */
export function IndonesianRupiah({ size = 24, className, ...props }: IndonesianRupiahProps) {
  const dimension = typeof size === "number" ? size : Number.parseInt(String(size), 10) || 24;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={dimension}
      height={dimension}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
      {...props}
    >
      <text
        x="12"
        y="16.5"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill="currentColor"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        Rp
      </text>
    </svg>
  );
}
