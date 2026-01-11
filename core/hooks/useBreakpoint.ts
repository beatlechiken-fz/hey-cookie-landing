import { useEffect, useState } from "react";
import { CustomBreakpoint } from "../types/general";

type BreakpointRange = {
  min?: number;
  max?: number;
};

type BreakpointConfig = Record<CustomBreakpoint, BreakpointRange>;

export function useBreakpoint(config: BreakpointConfig) {
  const [breakpoint, setBreakpoint] = useState<CustomBreakpoint>("clg");

  useEffect(() => {
    const queries = Object.entries(config).map(([key, range]) => {
      let query = "";

      if (range.min !== undefined && range.max !== undefined) {
        query = `(min-width: ${range.min}px) and (max-width: ${range.max}px)`;
      } else if (range.min !== undefined) {
        query = `(min-width: ${range.min}px)`;
      } else if (range.max !== undefined) {
        query = `(max-width: ${range.max}px)`;
      }

      return {
        key: key as CustomBreakpoint,
        mq: window.matchMedia(query),
      };
    });

    const update = () => {
      for (const q of queries) {
        if (q.mq.matches) {
          setBreakpoint(q.key);
          return;
        }
      }
    };

    update();

    queries.forEach((q) => q.mq.addEventListener("change", update));

    return () => {
      queries.forEach((q) => q.mq.removeEventListener("change", update));
    };
  }, [config]);

  return breakpoint;
}
