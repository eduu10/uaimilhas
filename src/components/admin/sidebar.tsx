"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, GraduationCap, ShoppingBag,
  Plane, Coins, Settings, LogOut, Sparkles, ChevronLeft, Menu,
  Search, Store, Link2, Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const links = [
  { href: "/admin", label: "Visão Geral", icon: LayoutDashboard },
  { href: "/admin/users", label: "Usuários", icon: Users },
  { href: "/admin/courses", label: "Cursos", icon: GraduationCap },
  { href: "/admin/products", label: "Produtos", icon: ShoppingBag },
  { href: "/admin/trips", label: "Viagens", icon: Plane },
  { href: "/admin/points", label: "Pontos", icon: Coins },
  { href: "/admin/flights", label: "Voos", icon: Search },
  { href: "/admin/marketplace", label: "Marketplace", icon: Store },
  { href: "/admin/affiliates", label: "Afiliados", icon: Link2 },
  { href: "/admin/newsletters", label: "Newsletters", icon: Mail },
  { href: "/admin/settings", label: "Configurações", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-card border shadow-sm"
      >
        <Menu className="w-5 h-5" />
      </button>

      <aside className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-card border-r transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        "hidden lg:block"
      )}>
        <div className="flex flex-col h-full">
          <div className={cn("flex items-center gap-2 p-4 border-b", collapsed && "justify-center")}>
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {!collapsed && <span className="font-bold text-lg">Admin</span>}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={cn("ml-auto p-1 rounded hover:bg-muted", collapsed && "ml-0")}
            >
              <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
            </button>
          </div>

          <nav className="flex-1 p-2 space-y-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    collapsed && "justify-center px-2"
                  )}
                  title={collapsed ? link.label : undefined}
                >
                  <link.icon className="w-5 h-5 shrink-0" />
                  {!collapsed && link.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-2 border-t">
            <Button
              variant="ghost"
              onClick={() => signOut({ callbackUrl: "/" })}
              className={cn("w-full justify-start gap-3 text-muted-foreground", collapsed && "justify-center px-2")}
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {!collapsed && "Sair"}
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {collapsed && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setCollapsed(false)}>
          <aside className="w-64 h-full bg-card border-r" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 p-4 border-b">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">Admin</span>
            </div>
            <nav className="p-2 space-y-1">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setCollapsed(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
