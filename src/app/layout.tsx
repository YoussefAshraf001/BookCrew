import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import FirebaseAppProvider from "@/components/firebase/FirebaseAppProvider";
import AppFrame from "@/components/layout/AppFrame";
import AppMotion from "@/components/motion/AppMotion";
import ThemeProvider from "@/components/theme/ThemeProvider";
import ToastProvider from "@/components/ui/ToastProvider";
import { defaultThemeId, themePalettes } from "@/lib/themes";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BookCrew",
  description: "Track books you read, drop, and plan to read.",
  icons: {
    icon: "/logo.jpg",
    shortcut: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

const themeInitScript = `
(() => {
  try {
    const key = "bookcrew_theme_id";
    const saved = localStorage.getItem(key) || "${defaultThemeId}";
    const themes = ${JSON.stringify(themePalettes)};
    const selected = themes.find((theme) => theme.id === saved) || themes[0];
    const root = document.documentElement;
    root.style.setProperty("--background", selected.background);
    root.style.setProperty("--foreground", selected.foreground);
    root.style.setProperty("--card", selected.card);
    root.style.setProperty("--muted", selected.muted);
    root.style.setProperty("--accent", selected.accent);
    root.style.setProperty("--accent-soft", selected.accentSoft);
  } catch {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <FirebaseAppProvider>
          <ThemeProvider>
            <ToastProvider>
              <AppMotion>
                <AppFrame>{children}</AppFrame>
              </AppMotion>
            </ToastProvider>
          </ThemeProvider>
        </FirebaseAppProvider>
      </body>
    </html>
  );
}
