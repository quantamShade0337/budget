"use client";

import { useCallback, useEffect, useState } from "react";

export function useDetailPanel<T extends { id: string }>(exitMs = 220) {
  const [data, setData] = useState<T | null>(null);
  const [rendered, setRendered] = useState<T | null>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (data) {
      setRendered(data);
      setClosing(false);
      return;
    }
    if (rendered) {
      setClosing(true);
      const t = setTimeout(() => {
        setRendered(null);
        setClosing(false);
      }, exitMs);
      return () => clearTimeout(t);
    }
  }, [data, rendered, exitMs]);

  const toggle = useCallback((item: T) => {
    setData((prev) => (prev?.id === item.id ? null : item));
  }, []);

  const close = useCallback(() => setData(null), []);

  return { selected: data, rendered, closing, open: setData, toggle, close };
}
