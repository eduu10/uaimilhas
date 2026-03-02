"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Link2,
  MousePointerClick,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Ban,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AffiliateLink {
  id: string;
  userId: string;
  name: string;
  url: string;
  code: string;
  commission: number;
  category: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: { clicks: number };
  totalEarnings?: number;
}

interface AffiliateEarning {
  id: string;
  userId: string;
  amount: number;
  type: string;
  description: string;
  status: string;
  createdAt: string;
}

interface AffiliateStats {
  totalLinks: number;
  totalClicks: number;
  totalConversions: number;
  totalEarnings: number;
  pendingEarnings: number;
  activeLinks: number;
}

export default function AffiliatesPage() {
  const [stats, setStats] = useState<AffiliateStats>({
    totalLinks: 0,
    totalClicks: 0,
    totalConversions: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    activeLinks: 0,
  });
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [earnings, setEarnings] = useState<AffiliateEarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkSearch, setLinkSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, linksRes, earningsRes] = await Promise.all([
        fetch("/api/admin/affiliates/stats"),
        fetch("/api/admin/affiliates/links"),
        fetch("/api/admin/affiliates/earnings"),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (linksRes.ok) {
        const data = await linksRes.json();
        setLinks(Array.isArray(data) ? data : []);
      }
      if (earningsRes.ok) {
        const data = await earningsRes.json();
        setEarnings(Array.isArray(data) ? data : []);
      }
    } catch {
      // keep defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleLink = async (linkId: string, isActive: boolean) => {
    await fetch(`/api/admin/affiliates/links/${linkId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    fetchData();
  };

  const handleEarningAction = async (earningId: string, status: string) => {
    await fetch(`/api/admin/affiliates/earnings/${earningId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchData();
  };

  const earningStatusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    paid: "bg-blue-100 text-blue-700",
    rejected: "bg-red-100 text-red-700",
  };

  const earningStatusLabels: Record<string, string> = {
    pending: "Pendente",
    approved: "Aprovado",
    paid: "Pago",
    rejected: "Rejeitado",
  };

  const fmt = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

  const statCards = [
    { title: "Total de Links", value: stats.totalLinks.toLocaleString("pt-BR"), icon: Link2, color: "text-blue-600", bg: "bg-blue-100", subtitle: `${stats.activeLinks} ativos` },
    { title: "Total de Cliques", value: stats.totalClicks.toLocaleString("pt-BR"), icon: MousePointerClick, color: "text-violet-600", bg: "bg-violet-100" },
    { title: "Total de Conversões", value: stats.totalConversions.toLocaleString("pt-BR"), icon: TrendingUp, color: "text-green-600", bg: "bg-green-100" },
    { title: "Total de Ganhos", value: `R$ ${fmt(stats.totalEarnings)}`, icon: DollarSign, color: "text-amber-600", bg: "bg-amber-100", subtitle: `R$ ${fmt(stats.pendingEarnings)} pendentes` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Afiliados</h1>
          <p className="text-muted-foreground">Gerencie links de afiliados, cliques e comissões</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading}>
          <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                  {"subtitle" in card && card.subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
                  )}
                </div>
                <div className={cn("p-3 rounded-xl", card.bg)}>
                  <card.icon className={cn("w-5 h-5", card.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="links" className="space-y-4">
        <TabsList>
          <TabsTrigger value="links"><Link2 className="w-4 h-4 mr-2" />Links de Afiliados</TabsTrigger>
          <TabsTrigger value="earnings"><DollarSign className="w-4 h-4 mr-2" />Comissões</TabsTrigger>
        </TabsList>

        <TabsContent value="links">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <CardTitle className="text-lg">Todos os Links</CardTitle>
                <div className="relative flex-1 max-w-sm ml-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Buscar por nome do link..." value={linkSearch} onChange={(e) => setLinkSearch(e.target.value)} className="pl-10" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Nome</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">URL</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Código</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Comissão</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Cliques</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Ganhos</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {links
                      .filter((l) => !linkSearch || l.name.toLowerCase().includes(linkSearch.toLowerCase()))
                      .map((link) => (
                        <tr key={link.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-3 px-2 font-medium text-sm">{link.name}</td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-1 max-w-[200px]">
                              <span className="text-xs text-muted-foreground truncate">{link.url}</span>
                              <a href={link.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                                <ExternalLink className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                              </a>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <Badge variant="outline" className="font-mono text-xs">{link.code}</Badge>
                          </td>
                          <td className="py-3 px-2 text-sm">{link.commission}%</td>
                          <td className="py-3 px-2 text-sm font-medium">{(link._count?.clicks || 0).toLocaleString("pt-BR")}</td>
                          <td className="py-3 px-2 text-sm font-semibold text-green-600">R$ {fmt(link.totalEarnings || 0)}</td>
                          <td className="py-3 px-2">
                            <Badge variant={link.isActive ? "default" : "secondary"}>
                              {link.isActive ? "Ativo" : "Inativo"}
                            </Badge>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center justify-end gap-1">
                              <Button size="icon" variant="ghost" title={link.isActive ? "Desativar" : "Ativar"} onClick={() => handleToggleLink(link.id, link.isActive)}>
                                {link.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {links.length === 0 && !loading && (
                      <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">Nenhum link de afiliado encontrado</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comissões e Ganhos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Tipo</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Descrição</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Valor</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Data</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {earnings.map((earning) => (
                      <tr key={earning.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-2">
                          <Badge variant="outline">{earning.type}</Badge>
                        </td>
                        <td className="py-3 px-2 text-sm text-muted-foreground max-w-[250px] truncate">{earning.description}</td>
                        <td className="py-3 px-2 font-semibold text-sm text-green-600">R$ {fmt(earning.amount)}</td>
                        <td className="py-3 px-2">
                          <Badge className={earningStatusColors[earning.status] || ""} variant="secondary">
                            {earningStatusLabels[earning.status] || earning.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-sm text-muted-foreground">{new Date(earning.createdAt).toLocaleDateString("pt-BR")}</td>
                        <td className="py-3 px-2">
                          <div className="flex items-center justify-end gap-1">
                            {earning.status === "pending" && (
                              <>
                                <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleEarningAction(earning.id, "approved")}>
                                  <CheckCircle className="w-3 h-3 mr-1" />Aprovar
                                </Button>
                                <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleEarningAction(earning.id, "rejected")}>
                                  <Ban className="w-3 h-3 mr-1" />Rejeitar
                                </Button>
                              </>
                            )}
                            {earning.status === "approved" && (
                              <Button size="sm" variant="outline" className="text-blue-600" onClick={() => handleEarningAction(earning.id, "paid")}>
                                <DollarSign className="w-3 h-3 mr-1" />Marcar Pago
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {earnings.length === 0 && !loading && (
                      <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Nenhuma comissão encontrada</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
