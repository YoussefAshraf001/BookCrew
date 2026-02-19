"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import ThemeSwitcher from "@/components/theme/ThemeSwitcher";
import logo from "@/assets/logo.jpg";

type AppNavProps = {
  currentPath?: string;
};

const links = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/search", label: "Search" },
  { href: "/shelf", label: "Shelf" },
  { href: "/account", label: "Account" },
  { href: "/profile", label: "Profile" },
];

export default function AppNav({ currentPath }: AppNavProps) {
  const pathname = usePathname();
  const activePath = currentPath ?? pathname ?? "";

  function isActiveLink(href: string): boolean {
    if (href === "/") {
      return activePath === "/";
    }

    return activePath === href || activePath.startsWith(`${href}/`);
  }

  return (
    <motion.nav
      className="rounded-3xl border border-accent-soft/80 bg-card/95 p-3 shadow-[0_10px_30px_rgb(0,0,0,0.12)] md:p-4"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <motion.div
          className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05, duration: 0.25 }}
        >
          <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/"
              className="flex w-fit items-center gap-2 rounded-2xl border border-accent-soft bg-accent-soft/35 px-2.5 py-1.5"
            >
              <Image
                src={logo}
                alt="BookCrew logo"
                width={36}
                height={36}
                className="h-9 w-9 rounded-lg object-cover"
              />
              <span className="pr-1 text-sm font-bold tracking-wide">BookCrew</span>
            </Link>
          </motion.div>

          <div className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <motion.ul
              className="flex w-max items-center gap-1.5 rounded-2xl border border-accent-soft/70 bg-accent-soft/20 p-1.5"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.04 } },
              }}
            >
              {links.map((link) => {
                const isActive = isActiveLink(link.href);

                return (
                  <motion.li
                    key={link.href}
                    variants={{ hidden: { opacity: 0, y: -4 }, visible: { opacity: 1, y: 0 } }}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={link.href}
                      prefetch
                      className={[
                        "relative inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition",
                        isActive
                          ? "text-white"
                          : "text-accent hover:bg-accent-soft/60",
                      ].join(" ")}
                    >
                      {isActive ? (
                        <motion.span
                          layoutId="app-nav-active-pill"
                          className="absolute inset-0 rounded-xl bg-accent shadow-[0_8px_18px_rgb(0,0,0,0.16)]"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        />
                      ) : null}
                      {isActive ? (
                        <span className="relative z-10 h-1.5 w-1.5 rounded-full bg-white/90" />
                      ) : null}
                      <span className="relative z-10">{link.label}</span>
                    </Link>
                  </motion.li>
                );
              })}
            </motion.ul>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.12, duration: 0.25 }}
          className="self-end xl:self-auto"
        >
          <ThemeSwitcher />
        </motion.div>
      </div>
    </motion.nav>
  );
}
