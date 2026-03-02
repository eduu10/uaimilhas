"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Store,
  ArrowLeftRight,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Eye,
  Ban,
  CheckCircle,
  RefreshCw,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Listing {
  id: string;
  sellerId: string;
  seller: { name: string; email: string };
  program: string;
  amount: number;
  pricePerThousand: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}

interface Transaction {
  id: string;
  buyerId: string;
  sellerId: string;
  buyer: { name: string; email: string };
  seller: { name: string; email: string };
  listingId: string;
  amount: number;
  totalPrice: number;
  fee: number;
  status: string;
  createdAt: string;
}

interface MarketplaceStats {
  totalListings: number;
  activeListings: number;
  totalTransactions: number;
  totalFeesCollected: number;
  totalVolume: number;
}

export default function MarketplacePage() {
  const [stats, setStats] = useState<MarketplaceStats>({
    totalListings: 0,
    activeListings: 0,
    totalTransactions: 0,
    totalFeesCollected: 0,
    totalVolume: 0,
  });
  const [listings, setListings] = useState<Listing[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [listingSearch, setListingSearch] = useState("");
  const [transactionSearch, setTransactionSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, listingsRes, transactionsRes] = await Promise.all([
        fetch("/api/admin/marketplace/stats"),
        fetch("/api/admin/marketplace/listings"),
        fetch("/api/admin/marketplace/transactions"),
      ]);

      const statsData = await statsRes.json();
      const listingsData = await listingsRes.json();
      const transactionsData = await transactionsRes.json();

      setStats(statsData);
      setListings(Array.isArray(listingsData) ? listingsData : []);
      setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
    } catch {
      setStats({
        totalListings: 0,
        activeListings: 0,
        totalTransactions: 0,
        totalFeesCollected: 0,
        totalVolume: 0,
      });
      setListings([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleListingAction = async (listingId: string, action: string) => {
    await fetch(`/api/admin/marketplace/listings/${listingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: action }),
    });
    fetchData();
  };

  const handleTransactionAction = async (transactionId: string, action: string) => {
    await fetch(`/api/admin/marketplace/transactions/${transactionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: action }),
    });
    fetchData();
  };

  const statusColors: Record<string, string> = {
    ATIVO: "bg-green-100 text-green-700",
    ACTIVE: "bg-green-100 text-green-700",
    VENDIDO: "bg-blue-100 text-blue-700",
    SOLD: "bg-blue-100 text-blue-700",
    CANCELADO: "bg-red-100 text-red-700",
    CANCELLED: "bg-red-100 text-red-700",
    SUSPENSO: "bg-yellow-100 text-yellow-700",
    SUSPENDED: "bg-yellow-100 text-yellow-700",
    PENDENTE: "bg-yellow-100 text-yellow-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    CONCLUIDO: "bg-green-100 text-green-700",
    COMPLETED: "bg-green-100 text-green-700",
    EXPIRADO: "bg-gray-100 text-gray-700",
    EXPIRED: "bg-gray-100 text-gray-700",
  };

  const statusLabels: Record<string, string> = {
    ATIVO: "Ativo",
    ACTIVE: "Ativo",
    VENDIDO: "Vendido",
    SOLD: "Vendido",
    CANCELADO: "Cancelado",
    CANCELLED: "Cancelado",
    SUSPENSO: "Suspenso",
    SUSPENDED: "Suspenso",
    PENDENTE: "Pendente",
    PENDING: "Pendente",
    CONCLUIDO: "Concluido",
    COMPLETED: "Concluido",
    EXPIRADO: "Expirado",
    EXPIRED: "Expirado",
  };

  const statCards = [
    {
      title: "Total de Anuncios",
      value: stats.totalListings.toLocaleString("pt-BR"),
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Anuncios Ativos",
      value: stats.activeListings.toLocaleString("pt-BR"),
      icon: Store,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Total de Transacoes",
      value: stats.totalTransactions.toLocaleString("pt-BR"),
      icon: ArrowLeftRight,
      color: "text-violet-600",
      bg: "bg-violet-100",
    },
    {
      title: "Taxas Arrecadadas",
      value: `R$ ${stats.totalFeesCollected.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestao do Marketplace</h1>
          <p className="text-muted-foreground">
            Gerencie anuncios e transacoes de milhas
          </p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading}>
          <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                </div>
                <div className={cn("p-3 rounded-xl", card.bg)}>
                  <card.icon className={cn("w-5 h-5", card.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="listings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="listings">
            <Store className="w-4 h-4 mr-2" />
            Anuncios
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <ArrowLeftRight className="w-4 h-4 mr-2" />
            Transacoes
          </TabsTrigger>
        </TabsList>

        {/* Listings Tab */}
        <TabsContent value="listings">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <CardTitle className="text-lg">Todos os Anuncios</CardTitle>
                <div className="relative flex-1 max-w-sm ml-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por vendedor ou programa..."
                    value={listingSearch}
                    onChange={(e) => setListingSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Vendedor
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Programa
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Quantidade
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Preco/Milhar
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Total
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Data
                      </th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                        Acoes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings
                      .filter(
                        (l) =>
                          !listingSearch ||
                          l.seller?.name
                            ?.toLowerCase()
                            .includes(listingSearch.toLowerCase()) ||
                          l.program
                            ?.toLowerCase()
                            .includes(listingSearch.toLowerCase())
                      )
                      .map((listing) => (
                        <tr
                          key={listing.id}
                          className="border-b last:border-0 hover:bg-muted/50"
                        >
                          <td className="py-3 px-2">
                            <div>
                              <p className="font-medium text-sm">
                                {listing.seller?.name || "Sem nome"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {listing.seller?.email}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <Badge variant="outline">{listing.program}</Badge>
                          </td>
                          <td className="py-3 px-2 text-sm font-medium">
                            {listing.amount.toLocaleString("pt-BR")} milhas
                          </td>
                          <td className="py-3 px-2 text-sm">
                            R${" "}
                            {listing.pricePerThousand.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="py-3 px-2 font-semibold text-sm">
                            R${" "}
                            {listing.totalPrice.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="py-3 px-2">
                            <Badge
                              className={statusColors[listing.status] || ""}
                              variant="secondary"
                            >
                              {statusLabels[listing.status] || listing.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-2 text-sm text-muted-foreground">
                            {new Date(listing.createdAt).toLocaleDateString(
                              "pt-BR"
                            )}
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center justify-end gap-1">
                              {(listing.status === "ATIVO" ||
                                listing.status === "ACTIVE") && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  title="Suspender anuncio"
                                  onClick={() =>
                                    handleListingAction(listing.id, "SUSPENSO")
                                  }
                                >
                                  <Ban className="w-4 h-4" />
                                </Button>
                              )}
                              {(listing.status === "SUSPENSO" ||
                                listing.status === "SUSPENDED") && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  title="Reativar anuncio"
                                  onClick={() =>
                                    handleListingAction(listing.id, "ATIVO")
                                  }
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                              <Button size="icon" variant="ghost" title="Ver detalhes">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {listings.length === 0 && !loading && (
                      <tr>
                        <td
                          colSpan={8}
                          className="py-8 text-center text-muted-foreground"
                        >
                          Nenhum anuncio encontrado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <CardTitle className="text-lg">Todas as Transacoes</CardTitle>
                <div className="relative flex-1 max-w-sm ml-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por comprador ou vendedor..."
                    value={transactionSearch}
                    onChange={(e) => setTransactionSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Comprador
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Vendedor
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Quantidade
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Valor
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Taxa
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Data
                      </th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                        Acoes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions
                      .filter(
                        (t) =>
                          !transactionSearch ||
                          t.buyer?.name
                            ?.toLowerCase()
                            .includes(transactionSearch.toLowerCase()) ||
                          t.seller?.name
                            ?.toLowerCase()
                            .includes(transactionSearch.toLowerCase())
                      )
                      .map((tx) => (
                        <tr
                          key={tx.id}
                          className="border-b last:border-0 hover:bg-muted/50"
                        >
                          <td className="py-3 px-2">
                            <div>
                              <p className="font-medium text-sm">
                                {tx.buyer?.name || "Sem nome"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {tx.buyer?.email}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div>
                              <p className="font-medium text-sm">
                                {tx.seller?.name || "Sem nome"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {tx.seller?.email}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-sm font-medium">
                            {tx.amount.toLocaleString("pt-BR")} milhas
                          </td>
                          <td className="py-3 px-2 font-semibold text-sm">
                            R${" "}
                            {tx.totalPrice.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="py-3 px-2 text-sm text-amber-600 font-medium">
                            R${" "}
                            {tx.fee.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="py-3 px-2">
                            <Badge
                              className={statusColors[tx.status] || ""}
                              variant="secondary"
                            >
                              {statusLabels[tx.status] || tx.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-2 text-sm text-muted-foreground">
                            {new Date(tx.createdAt).toLocaleDateString("pt-BR")}
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center justify-end gap-1">
                              {(tx.status === "PENDENTE" ||
                                tx.status === "PENDING") && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600"
                                    onClick={() =>
                                      handleTransactionAction(
                                        tx.id,
                                        "CONCLUIDO"
                                      )
                                    }
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Aprovar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600"
                                    onClick={() =>
                                      handleTransactionAction(
                                        tx.id,
                                        "CANCELADO"
                                      )
                                    }
                                  >
                                    <Ban className="w-3 h-3 mr-1" />
                                    Cancelar
                                  </Button>
                                </>
                              )}
                              <Button size="icon" variant="ghost" title="Ver detalhes">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {transactions.length === 0 && !loading && (
                      <tr>
                        <td
                          colSpan={8}
                          className="py-8 text-center text-muted-foreground"
                        >
                          Nenhuma transacao encontrada
                        </td>
                      </tr>
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
