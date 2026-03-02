"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Store,
  ArrowLeftRight,
  DollarSign,
  Ban,
  CheckCircle,
  RefreshCw,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Listing {
  id: string;
  sellerId: string;
  seller: { name: string | null; email: string; image: string | null };
  program: string;
  amount: number;
  pricePerThousand: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  _count?: { transactions: number };
}

interface Transaction {
  id: string;
  buyerId: string;
  sellerId: string;
  listingId: string;
  amount: number;
  totalPrice: number;
  platformFee: number;
  sellerPayout: number;
  status: string;
  createdAt: string;
  listing?: {
    program: string;
    seller: { id: string; name: string | null; email: string };
  };
}

interface MarketplaceStats {
  totalListings: number;
  activeListings: number;
  soldListings: number;
  cancelledListings: number;
  totalTransactions: number;
  totalRevenue: number;
  totalPlatformFees: number;
  totalSellerPayouts: number;
}

export default function MarketplacePage() {
  const [stats, setStats] = useState<MarketplaceStats>({
    totalListings: 0,
    activeListings: 0,
    soldListings: 0,
    cancelledListings: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    totalPlatformFees: 0,
    totalSellerPayouts: 0,
  });
  const [listings, setListings] = useState<Listing[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [listingSearch, setListingSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, listingsRes, transactionsRes] = await Promise.all([
        fetch("/api/admin/marketplace/stats"),
        fetch("/api/admin/marketplace/listings"),
        fetch("/api/admin/marketplace/transactions"),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (listingsRes.ok) {
        const data = await listingsRes.json();
        setListings(Array.isArray(data) ? data : []);
      }
      if (transactionsRes.ok) {
        const data = await transactionsRes.json();
        setTransactions(Array.isArray(data) ? data : []);
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

  const handleListingAction = async (listingId: string, status: string) => {
    await fetch(`/api/admin/marketplace/listings/${listingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchData();
  };

  const handleTransactionAction = async (transactionId: string, status: string) => {
    await fetch(`/api/admin/marketplace/transactions/${transactionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchData();
  };

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    SOLD: "bg-blue-100 text-blue-700",
    CANCELLED: "bg-red-100 text-red-700",
    EXPIRED: "bg-gray-100 text-gray-700",
    pending: "bg-yellow-100 text-yellow-700",
    escrow: "bg-indigo-100 text-indigo-700",
    completed: "bg-green-100 text-green-700",
    disputed: "bg-red-100 text-red-700",
    refunded: "bg-gray-100 text-gray-700",
  };

  const statusLabels: Record<string, string> = {
    ACTIVE: "Ativo",
    SOLD: "Vendido",
    CANCELLED: "Cancelado",
    EXPIRED: "Expirado",
    pending: "Pendente",
    escrow: "Em Garantia",
    completed: "Concluído",
    disputed: "Disputado",
    refunded: "Reembolsado",
  };

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

  const statCards = [
    { title: "Total de Anúncios", value: stats.totalListings.toLocaleString("pt-BR"), icon: Package, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Anúncios Ativos", value: stats.activeListings.toLocaleString("pt-BR"), icon: Store, color: "text-green-600", bg: "bg-green-100" },
    { title: "Total de Transações", value: stats.totalTransactions.toLocaleString("pt-BR"), icon: ArrowLeftRight, color: "text-violet-600", bg: "bg-violet-100" },
    { title: "Taxas Arrecadadas", value: `R$ ${fmt(stats.totalPlatformFees)}`, icon: DollarSign, color: "text-amber-600", bg: "bg-amber-100" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão do Marketplace</h1>
          <p className="text-muted-foreground">Gerencie anúncios e transações de milhas</p>
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
                </div>
                <div className={cn("p-3 rounded-xl", card.bg)}>
                  <card.icon className={cn("w-5 h-5", card.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="listings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="listings"><Store className="w-4 h-4 mr-2" />Anúncios</TabsTrigger>
          <TabsTrigger value="transactions"><ArrowLeftRight className="w-4 h-4 mr-2" />Transações</TabsTrigger>
        </TabsList>

        <TabsContent value="listings">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <CardTitle className="text-lg">Todos os Anúncios</CardTitle>
                <div className="relative flex-1 max-w-sm ml-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Buscar por vendedor ou programa..." value={listingSearch} onChange={(e) => setListingSearch(e.target.value)} className="pl-10" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Vendedor</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Programa</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Quantidade</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Preço/Milhar</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Total</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Data</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings
                      .filter((l) => !listingSearch || (l.seller?.name || "").toLowerCase().includes(listingSearch.toLowerCase()) || l.program.toLowerCase().includes(listingSearch.toLowerCase()))
                      .map((listing) => (
                        <tr key={listing.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-3 px-2">
                            <p className="font-medium text-sm">{listing.seller?.name || "Sem nome"}</p>
                            <p className="text-xs text-muted-foreground">{listing.seller?.email}</p>
                          </td>
                          <td className="py-3 px-2"><Badge variant="outline">{listing.program}</Badge></td>
                          <td className="py-3 px-2 text-sm font-medium">{listing.amount.toLocaleString("pt-BR")} milhas</td>
                          <td className="py-3 px-2 text-sm">R$ {fmt(listing.pricePerThousand)}</td>
                          <td className="py-3 px-2 font-semibold text-sm">R$ {fmt(listing.totalPrice)}</td>
                          <td className="py-3 px-2">
                            <Badge className={statusColors[listing.status] || ""} variant="secondary">
                              {statusLabels[listing.status] || listing.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-2 text-sm text-muted-foreground">{new Date(listing.createdAt).toLocaleDateString("pt-BR")}</td>
                          <td className="py-3 px-2">
                            <div className="flex items-center justify-end gap-1">
                              {listing.status === "ACTIVE" && (
                                <Button size="icon" variant="ghost" title="Cancelar" onClick={() => handleListingAction(listing.id, "CANCELLED")}>
                                  <Ban className="w-4 h-4" />
                                </Button>
                              )}
                              {listing.status === "CANCELLED" && (
                                <Button size="icon" variant="ghost" title="Reativar" onClick={() => handleListingAction(listing.id, "ACTIVE")}>
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    {listings.length === 0 && !loading && (
                      <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">Nenhum anúncio encontrado</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader><CardTitle className="text-lg">Todas as Transações</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Vendedor</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Programa</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Quantidade</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Valor Total</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Taxa</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Data</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-2">
                          <p className="font-medium text-sm">{tx.listing?.seller?.name || "Sem nome"}</p>
                          <p className="text-xs text-muted-foreground">{tx.listing?.seller?.email}</p>
                        </td>
                        <td className="py-3 px-2"><Badge variant="outline">{tx.listing?.program || "-"}</Badge></td>
                        <td className="py-3 px-2 text-sm font-medium">{tx.amount.toLocaleString("pt-BR")} milhas</td>
                        <td className="py-3 px-2 font-semibold text-sm">R$ {fmt(tx.totalPrice)}</td>
                        <td className="py-3 px-2 text-sm text-amber-600 font-medium">R$ {fmt(tx.platformFee)}</td>
                        <td className="py-3 px-2">
                          <Badge className={statusColors[tx.status] || ""} variant="secondary">
                            {statusLabels[tx.status] || tx.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-sm text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString("pt-BR")}</td>
                        <td className="py-3 px-2">
                          <div className="flex items-center justify-end gap-1">
                            {tx.status === "pending" && (
                              <>
                                <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleTransactionAction(tx.id, "completed")}>
                                  <CheckCircle className="w-3 h-3 mr-1" />Aprovar
                                </Button>
                                <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleTransactionAction(tx.id, "refunded")}>
                                  <Ban className="w-3 h-3 mr-1" />Cancelar
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {transactions.length === 0 && !loading && (
                      <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">Nenhuma transação encontrada</td></tr>
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
