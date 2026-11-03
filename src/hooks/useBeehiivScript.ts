import { useEffect, type RefObject } from "react";

const BEEHIIV_SCRIPT_SRC = "https://subscribe-forms.beehiiv.com/v3/loader.js";
const BEEHIIV_FORM_ID = "d052e954-8026-4a83-8faa-95e91578b06b";

/**
 * Loads the Beehiiv embed loader script into `containerRef`, the way `next/script`
 * (strategy "afterInteractive") would in a Next.js app - a plain <script> tag in JSX
 * never executes, so it has to be inserted into the DOM imperatively.
 * Beehiiv's loader renders the subscribe form right next to this script tag.
 */
export function useBeehiivScript(containerRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const container = containerRef.current;
    if (!container || container.querySelector("script[data-beehiiv-form]")) return;

    const script = document.createElement("script");
    script.async = true;
    script.src = BEEHIIV_SCRIPT_SRC;
    script.setAttribute("data-beehiiv-form", BEEHIIV_FORM_ID);
    container.appendChild(script);
  }, [containerRef]);
}
