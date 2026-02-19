export type ThemeId =
  | "classic-paper"
  | "dune-sand"
  | "twilight-mist"
  | "vampire-crimson"
  | "throne-iron"
  | "forest-mint"
  | "sunset-ink"
  | "night-ocean";

export type ThemePalette = {
  id: ThemeId;
  label: string;
  background: string;
  foreground: string;
  card: string;
  muted: string;
  accent: string;
  accentSoft: string;
};

export const defaultThemeId: ThemeId = "classic-paper";

export const themePalettes: ThemePalette[] = [
  {
    id: "classic-paper",
    label: "Classic Paper",
    background: "#f4f1ea",
    foreground: "#1d1a17",
    card: "#fffdf8",
    muted: "#6b655f",
    accent: "#264653",
    accentSoft: "#d9e4ea",
  },
  {
    id: "dune-sand",
    label: "Dune Sand",
    background: "#1f150f",
    foreground: "#f5dcc0",
    card: "#2b1d15",
    muted: "#c39a73",
    accent: "#d87a2e",
    accentSoft: "#4a2d1b",
  },
  {
    id: "twilight-mist",
    label: "Twilight Mist",
    background: "#15131f",
    foreground: "#e6e1f2",
    card: "#221d33",
    muted: "#a59bbb",
    accent: "#8b7ad9",
    accentSoft: "#342d4d",
  },
  {
    id: "vampire-crimson",
    label: "Vampire Crimson",
    background: "#140d10",
    foreground: "#f2dbe1",
    card: "#231419",
    muted: "#b98b98",
    accent: "#b53a4f",
    accentSoft: "#3a1c24",
  },
  {
    id: "throne-iron",
    label: "Throne Iron",
    background: "#111216",
    foreground: "#e0ded8",
    card: "#1a1c22",
    muted: "#9d9a91",
    accent: "#9f8664",
    accentSoft: "#2a2d36",
  },
  {
    id: "forest-mint",
    label: "Forest Mint",
    background: "#0f1c1c",
    foreground: "#d9e7df",
    card: "#172827",
    muted: "#8aa098",
    accent: "#5f8f82",
    accentSoft: "#213936",
  },
  {
    id: "sunset-ink",
    label: "Sunset Ink",
    background: "#faf0e7",
    foreground: "#2a1d1a",
    card: "#fffbf8",
    muted: "#7a5f57",
    accent: "#b85042",
    accentSoft: "#f5ddd7",
  },
  {
    id: "night-ocean",
    label: "Night Ocean",
    background: "#070c12",
    foreground: "#dce9f7",
    card: "#101b27",
    muted: "#8ea5bf",
    accent: "#5bb0df",
    accentSoft: "#1b3142",
  },
];

export function isThemeId(value: string): value is ThemeId {
  return themePalettes.some((palette) => palette.id === value);
}

export function getThemeById(id: ThemeId): ThemePalette {
  return themePalettes.find((palette) => palette.id === id) ?? themePalettes[0];
}
