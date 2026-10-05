import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ThemeSetting = "system" | "light" | "dark";

type ThemeCtx = {
  setting: ThemeSetting;
  resolved: "light" | "dark";
  setSetting: (next: ThemeSetting) => void;
};

const Ctx = createContext<ThemeCtx | null>(null);

function applyTheme(resolved: "light" | "dark") {
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
}

function systemDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [setting, setSettingState] = useState<ThemeSetting>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("replymind-theme") as ThemeSetting | null;
    if (stored === "light" || stored === "dark" || stored === "system") {
      setSettingState(stored);
    }
  }, []);

  useEffect(() => {
    const next = setting === "system" ? (systemDark() ? "dark" : "light") : setting;
    setResolved(next);
    applyTheme(next);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (setting === "system") {
        const dark = mq.matches;
        setResolved(dark ? "dark" : "light");
        applyTheme(dark ? "dark" : "light");
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [setting]);

  const setSetting = (next: ThemeSetting) => {
    setSettingState(next);
    localStorage.setItem("replymind-theme", next);
  };

  const value = useMemo(() => ({ setting, resolved, setSetting }), [setting, resolved]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
