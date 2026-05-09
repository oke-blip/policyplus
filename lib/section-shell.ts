import type { CSSProperties } from "react";

/** Outer snap wrapper — never use justify-center here (avoids top cut-off on small viewports). */
export const SNAP_SECTION =
  "h-[100svh] w-full snap-start snap-always relative overflow-hidden bg-transparent flex flex-col";

/** Title / intro — clears fixed navbar */
export const SECTION_HEADER =
  "flex-none pt-20 lg:pt-32 px-4 max-w-7xl mx-auto w-full text-center lg:text-left z-10 relative";

/** Inner vertical scroll chain before outer snap advances */
export const SECTION_SCROLL_BODY =
  "flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden hide-scrollbar z-10 flex flex-col justify-start lg:justify-center pb-24 lg:pb-32";

export const SECTION_SCROLL_STYLE = {
  scrollbarWidth: "none",
  msOverflowStyle: "none",
} satisfies CSSProperties;
