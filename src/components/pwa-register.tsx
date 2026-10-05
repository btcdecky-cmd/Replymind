import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    const id = window.setTimeout(() => {
      void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }, 800);
    return () => window.clearTimeout(id);
  }, []);
  return null;
}
