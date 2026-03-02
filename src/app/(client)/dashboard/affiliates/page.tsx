"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Link2,
  Plus,
  Loader2,
  AlertCircle,
  MousePointerClick,
  DollarSign,
  TrendingUp,
  Copy,
  CheckCircle,
  ExternalLink,
  BarChart3,
  Percent,
  Eye,
  Clock,
  CreditCard,
  ShoppingBag,
  GraduationCap,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "cartao-credito", label: "Cartao de Credito", icon: CreditCard },
  { value: "venda-milhas", label: "Venda de Milhas", icon: ShoppingBag },
  { value: "curso", label: "Curso", icon: GraduationCap },
  { value: "outros", label: "Outros", icon: MoreHorizontal },
];

const CATEGORY_COLORS: Record<string, string> = {
  "cartao-credito": "bg-blue-100 text-blue-700 border-blue-200",
  "venda-milhas": "bg-violet-100 text-violet-700 border-violet-200",
  curso: "bg-amber-100 text-amber-700 border-amber-200",
  outros: "bg-gray-100 text-gray-700 border-gray-200",
};

interface AffiliateLink {
  id: string;
  name: string;
  url: string;
  shortUrl: string;
  category: string;
  clicks: number;
  conversions: number;
  createdAt: string;
}

interface Earning {
  id: string;
  linkId: string;
  linkName: string;
  amount: number;
  status: "pending" | "approved" | "paid" | "rejected";
  createdAt: string;
}

export default function AffiliatesPage() {
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEarnings, setLoadingEarnings] = useState(true);
  const [createDialog, setCreateDialog] = useState(false);
  const [form, setForm] = useState({ name: "", url: "", category: "" });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadLinks();
    loadEarnings();
  }, []);

  const loadLinks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/affiliates/links");
      if (res.ok) {
        const data = await res.json();
        setLinks(data.links || data || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const loadEarnings = async () => {
    setLoadingEarnings(true);
    try {
      const res = await fetch("/api/affiliates/earnings");
      if (res.ok) {
        const data = await res.json();
        setEarnings(data.earnings || data || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingEarnings(false);
    }
  };

  const handleCreate = async () => {
    if (!form.name || !form.url || !form.category) {
      setCreateError("Preencha todos os campos.");
      return;
    }

    try {
      new URL(form.url);
    } catch {
      setCreateError("URL invalida. Insira uma URL completa (ex: https://...)");
      return;
    }

    setCreating(true);
    setCreateError("");
    try {
      const res = await fetch("/api/affiliates/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setCreateDialog(false);
        setForm({ name: "", url: "", category: "" });
        await loadLinks();
      } else {
        setCreateError("Erro ao criar link.");
      }
    } catch {
      setCreateError("Erro de conexao.");
    } finally {
      setCreating(false);
    }
  };

  const handleCopyLink = async (link: AffiliateLink) => {
    try {
      await navigator.clipboard.writeText(link.shortUrl || link.url);
      setCopiedId(link.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
    }
  };

  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);
  const totalConversions = links.reduce((sum, l) => sum + l.conversions, 0);
  const totalEarnings = earnings
    .filter((e) => e.status !== "rejected")
    .reduce((sum, e) => sum + e.amount, 0);
  const conversionRate =
    totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : "0.0";

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("pt-BR").format(value);

  const getCategoryLabel = (category: string) =>
    CATEGORIES.find((c) => c.value === category)?.label || category;

  const getStatusConfig = (status: Earning["status"]) => {
    switch (status) {
      case "pending":
        return {
          label: "Pendente",
          color: "bg-yellow-100 text-yellow-700 border-yellow-200",
        };
      case "approved":
        return {
          label: "Aprovado",
          color: "bg-blue-100 text-blue-700 border-blue-200",
        };
      case "paid":
        return {
          label: "Pago",
          color: "bg-green-100 text-green-700 border-green-200",
        };
      case "rejected":
        return {
          label: "Rejeitado",
          color: "bg-red-100 text-red-700 border-red-200",
        };
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600">
              <Link2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Programa de Afiliados</h1>
              <p className="text-muted-foreground">
                Ganhe comissoes compartilhando links de parceiros
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              setForm({ name: "", url: "", category: "" });
              setCreateError("");
              setCreateDialog(true);
            }}
            className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Link
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-100 to-violet-200">
                  <Link2 className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{links.length}</p>
                  <p className="text-sm text-muted-foreground">Total de Links</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200">
                  <MousePointerClick className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatNumber(totalClicks)}</p>
                  <p className="text-sm text-muted-foreground">Total de Cliques</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-green-200">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(totalEarnings)}</p>
                  <p className="text-sm text-muted-foreground">Total Ganhos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200">
                  <Percent className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{conversionRate}%</p>
                  <p className="text-sm text-muted-foreground">Taxa de Conversao</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Affiliate Links */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Seus Links de Afiliado</h2>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/3" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : links.length > 0 ? (
            <div className="space-y-4">
              {links.map((link) => {
                const CategoryIcon =
                  CATEGORIES.find((c) => c.value === link.category)?.icon || Link2;
                return (
                  <Card
                    key={link.id}
                    className="hover:shadow-md transition-all"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className={cn(
                              "p-2.5 rounded-lg",
                              link.category === "cartao-credito"
                                ? "bg-blue-100"
                                : link.category === "venda-milhas"
                                ? "bg-violet-100"
                                : link.category === "curso"
                                ? "bg-amber-100"
                                : "bg-gray-100"
                            )}
                          >
                            <CategoryIcon
                              className={cn(
                                "w-5 h-5",
                                link.category === "cartao-credito"
                                  ? "text-blue-600"
                                  : link.category === "venda-milhas"
                                  ? "text-violet-600"
                                  : link.category === "curso"
                                  ? "text-amber-600"
                                  : "text-gray-600"
                              )}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{link.name}</h3>
                              <Badge
                                className={cn(
                                  "text-xs",
                                  CATEGORY_COLORS[link.category] || "bg-gray-100 text-gray-700"
                                )}
                              >
                                {getCategoryLabel(link.category)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                                {link.shortUrl || link.url}
                              </p>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 shrink-0"
                                    onClick={() => handleCopyLink(link)}
                                  >
                                    {copiedId === link.id ? (
                                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {copiedId === link.id ? "Copiado!" : "Copiar link"}
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 shrink-0"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </Button>
                                  </a>
                                </TooltipTrigger>
                                <TooltipContent>Abrir link</TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="flex items-center gap-1 justify-center">
                              <MousePointerClick className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-lg font-bold">
                                {formatNumber(link.clicks)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">Cliques</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center gap-1 justify-center">
                              <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-lg font-bold">
                                {link.conversions}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">Conversoes</p>
                          </div>
                          <div className="text-center">
                            <span className="text-xs text-muted-foreground">
                              {link.clicks > 0
                                ? ((link.conversions / link.clicks) * 100).toFixed(1)
                                : "0.0"}
                              %
                            </span>
                            <p className="text-xs text-muted-foreground">Taxa</p>
                          </div>
                        </div>

                        <div className="text-right text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {new Date(link.createdAt).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Link2 className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="font-semibold text-lg mb-2">Nenhum link criado</h3>
              <p className="text-muted-foreground mb-4">
                Crie links de afiliado e comece a ganhar comissoes.
              </p>
              <Button
                onClick={() => {
                  setForm({ name: "", url: "", category: "" });
                  setCreateError("");
                  setCreateDialog(true);
                }}
                className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Link
              </Button>
            </Card>
          )}
        </div>

        {/* Earnings Table */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Historico de Ganhos</h2>
          {loadingEarnings ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            </div>
          ) : earnings.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                          Data
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                          Link
                        </th>
                        <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                          Valor
                        </th>
                        <th className="text-center p-4 text-sm font-medium text-muted-foreground">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {earnings.map((earning) => {
                        const statusConfig = getStatusConfig(earning.status);
                        return (
                          <tr
                            key={earning.id}
                            className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                          >
                            <td className="p-4 text-sm">
                              {new Date(earning.createdAt).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td className="p-4">
                              <span className="text-sm font-medium">{earning.linkName}</span>
                            </td>
                            <td className="p-4 text-right">
                              <span
                                className={cn(
                                  "font-semibold text-sm",
                                  earning.status === "rejected"
                                    ? "text-muted-foreground line-through"
                                    : "text-green-600"
                                )}
                              >
                                {formatCurrency(earning.amount)}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <Badge className={cn("text-xs", statusConfig.color)}>
                                {statusConfig.label}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Earnings Summary */}
                <div className="border-t p-4 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div>
                        <span className="text-xs text-muted-foreground">Pendente</span>
                        <p className="font-semibold text-yellow-600">
                          {formatCurrency(
                            earnings
                              .filter((e) => e.status === "pending")
                              .reduce((sum, e) => sum + e.amount, 0)
                          )}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Aprovado</span>
                        <p className="font-semibold text-blue-600">
                          {formatCurrency(
                            earnings
                              .filter((e) => e.status === "approved")
                              .reduce((sum, e) => sum + e.amount, 0)
                          )}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Pago</span>
                        <p className="font-semibold text-green-600">
                          {formatCurrency(
                            earnings
                              .filter((e) => e.status === "paid")
                              .reduce((sum, e) => sum + e.amount, 0)
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground">Total Geral</span>
                      <p className="text-xl font-bold text-violet-600">
                        {formatCurrency(totalEarnings)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <DollarSign className="w-10 h-10 mx-auto text-muted-foreground mb-3 opacity-50" />
              <p className="text-muted-foreground">
                Nenhum ganho registrado ainda. Comece compartilhando seus links!
              </p>
            </Card>
          )}
        </div>

        {/* How It Works */}
        <Card className="bg-gradient-to-br from-violet-50 to-blue-50 border-violet-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-violet-600" />
              Como Funciona
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-violet-100 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-lg font-bold text-violet-600">1</span>
                </div>
                <h4 className="font-semibold mb-1">Crie seus links</h4>
                <p className="text-sm text-muted-foreground">
                  Gere links de afiliado para produtos e servicos de parceiros.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-lg font-bold text-blue-600">2</span>
                </div>
                <h4 className="font-semibold mb-1">Compartilhe</h4>
                <p className="text-sm text-muted-foreground">
                  Divulgue os links nas redes sociais, blog ou para amigos.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-lg font-bold text-green-600">3</span>
                </div>
                <h4 className="font-semibold mb-1">Ganhe comissoes</h4>
                <p className="text-sm text-muted-foreground">
                  Receba comissoes por cada conversao gerada pelos seus links.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create Link Dialog */}
        <Dialog open={createDialog} onOpenChange={setCreateDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Link de Afiliado</DialogTitle>
              <DialogDescription>
                Crie um link rastreavel para compartilhar com seu publico.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Nome do Link *</Label>
                <Input
                  placeholder="Ex: Cartao XP Visa Infinite"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>URL de Destino *</Label>
                <Input
                  placeholder="https://..."
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  type="url"
                />
              </div>

              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {createError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  {createError}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialog(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleCreate}
                disabled={creating}
                className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Link
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
