"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import type { ThemeId } from "@/lib/themes";

export default function ThemeSwitcher() {
  const { themeId, setThemeId, themes } = useTheme();

  return (
    <div className="flex items-center gap-2 rounded-full border border-accent-soft/80 bg-accent-soft/20 px-2 py-1.5">
      <label
        htmlFor="theme-switcher"
        className="pl-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted"
      >
        Theme
      </label>
      <select
        id="theme-switcher"
        value={themeId}
        onChange={(event) => setThemeId(event.target.value as ThemeId)}
        className="rounded-full border border-accent-soft bg-card px-3 py-2 text-xs font-semibold text-accent outline-none transition focus:border-accent"
      >
        {themes.map((theme) => (
          <option key={theme.id} value={theme.id}>
            {theme.label}
          </option>
        ))}
      </select>
    </div>
  );
}
