import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Compass,
  Waves,
  MapPin,
  Video,
  UserCog,
  Languages as LangIcon,
  BookOpen,
  Users,
  Flag,
  BarChart3,
  Settings,
  Anchor,
  LogOut,
  Bell,
  Search,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { ReactNode } from "react";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/voyage-prep", label: "Voyage Prep", icon: Compass },
  { to: "/shores", label: "Shores", icon: Waves },
  { to: "/ports", label: "Ports of Call", icon: MapPin },
  { to: "/videos", label: "Videos", icon: Video },
  { to: "/guides", label: "Guides", icon: UserCog },
  { to: "/languages", label: "Languages", icon: LangIcon },
  { to: "/scenarios", label: "Scenarios", icon: BookOpen },
  { to: "/users", label: "Users", icon: Users },
  { to: "/reports", label: "Reports", icon: Flag },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, role, signOut } = useAuth();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col p-4 gap-2 border-r border-border/60 bg-sidebar/60 backdrop-blur-xl sticky top-0 h-screen">
        <div className="flex items-center gap-3 px-2 py-4">
          <div className="size-10 rounded-2xl grid place-items-center bg-gradient-to-br from-[oklch(0.78_0.13_75)] to-[oklch(0.83_0.13_78)] shadow-lg">
            <Anchor className="size-5 text-[oklch(0.18_0.04_255)]" />
          </div>
          <div>
            <div className="font-display text-lg leading-tight">TalkShore</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Control Tower
            </div>
          </div>
        </div>

        <nav className="mt-2 flex-1 space-y-0.5">
          {nav.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  active
                    ? "bg-elevated text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/60"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="navpill"
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-r bg-gold"
                  />
                )}
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ts-elevated p-3 flex items-center gap-3">
          <div className="size-9 rounded-full bg-gradient-to-br from-gold to-gold-hover grid place-items-center text-[oklch(0.18_0.04_255)] font-semibold">
            {(user?.email ?? "A").slice(0, 1).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs truncate">{user?.email}</div>
            <div className="text-[10px] uppercase tracking-wider text-gold">
              {role ?? "member"}
            </div>
          </div>
          <button
            onClick={signOut}
            className="text-muted-foreground hover:text-foreground transition"
            aria-label="Sign out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/60 border-b border-border/60">
          <div className="flex items-center gap-4 px-6 h-16">
            <div className="flex-1 flex items-center gap-2 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  placeholder="Search learners, guides, sessions…"
                  className="w-full h-10 rounded-xl bg-card/60 border border-border pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <button className="size-10 rounded-xl ts-elevated grid place-items-center hover:bg-card transition">
              <Bell className="size-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
