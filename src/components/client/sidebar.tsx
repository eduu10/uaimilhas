"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, GraduationCap, ShoppingBag, Plane,
  FileText, User, LogOut, Sparkles, Menu, X,
  Search, Bell, Calculator, Store, Wallet, Map, Link2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

const mainLinks = [
  { href: "/dashboard", label: "Meu Painel", icon: LayoutDashboard },
  { href: "/dashboard/courses", label: "Meus Cursos", icon: GraduationCap },
  { href: "/dashboard/catalog", label: "Catálogo", icon: ShoppingBag },
  { href: "/dashboard/trips", label: "Viagens", icon: Plane },
  { href: "/dashboard/statement", label: "Extrato", icon: FileText },
];

const flightLinks = [
  { href: "/dashboard/flights", label: "Buscar Voos", icon: Search },
  { href: "/dashboard/alerts", label: "Alertas de Preço", icon: Bell },
  { href: "/dashboard/vpm", label: "Calculadora VPM", icon: Calculator },
];

const toolLinks = [
  { href: "/dashboard/marketplace", label: "Marketplace", icon: Store },
  { href: "/dashboard/miles-monitor", label: "Minhas Milhas", icon: Wallet },
  { href: "/dashboard/planner", label: "Planejador", icon: Map },
  { href: "/dashboard/affiliates", label: "Afiliados", icon: Link2 },
];

const profileLinks = [
  { href: "/dashboard/profile", label: "Meu Perfil", icon: User },
];

export function ClientSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-card border shadow-sm"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Desktop */}
      <aside className="hidden lg:block fixed left-0 top-0 z-40 h-screen w-64 bg-card border-r">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 p-4 border-b">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-gradient">UAI Milhas</span>
            </Link>
          </div>

          {session?.user && (
            <div className="p-4 border-b">
              <p className="font-medium text-sm">{session.user.name}</p>
              <p className="text-xs text-muted-foreground">{session.user.email}</p>
            </div>
          )}

          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {mainLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}>
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-2 pb-1 px-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Voos</p>
            </div>
            {flightLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}>
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-2 pb-1 px-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ferramentas</p>
            </div>
            {toolLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}>
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
            <Separator className="my-2" />
            {profileLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}>
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-2 border-t">
            <Button
              variant="ghost"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full justify-start gap-3 text-muted-foreground"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileOpen(false)}>
          <aside className="w-64 h-full bg-card border-r" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold">UAI Milhas</span>
              </div>
              <button onClick={() => setMobileOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-64px)]">
              {[...mainLinks, ...flightLinks, ...toolLinks, ...profileLinks].map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                  )}>
                    <link.icon className="w-4 h-4" />
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
