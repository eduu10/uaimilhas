"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ShoppingCart,
  Store,
  Plus,
  Loader2,
  Search,
  SortAsc,
  AlertCircle,
  CheckCircle,
  Sparkles,
  DollarSign,
  Package,
  Tag,
  User,
  Pencil,
  XCircle,
  ArrowUpDown,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PROGRAMS = [
  { value: "all", label: "Todos os Programas" },
  { value: "latam-pass", label: "LATAM Pass" },
  { value: "smiles", label: "Smiles" },
  { value: "tudoazul", label: "TudoAzul" },
];

const PROGRAM_COLORS: Record<string, string> = {
  "latam-pass": "bg-red-100 text-red-700 border-red-200",
  smiles: "bg-orange-100 text-orange-700 border-orange-200",
  tudoazul: "bg-blue-100 text-blue-700 border-blue-200",
};

const PROGRAM_LABELS: Record<string, string> = {
  "latam-pass": "LATAM Pass",
  smiles: "Smiles",
  tudoazul: "TudoAzul",
};

interface Listing {
  id: string;
  program: string;
  amount: number;
  pricePerThousand: number;
  sellerName: string;
  sellerId: string;
  createdAt: string;
  status: string;
}

interface MyListing extends Listing {
  totalSold: number;
}

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [myListings, setMyListings] = useState<MyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMy, setLoadingMy] = useState(true);
  const [programFilter, setProgramFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"price" | "amount">("price");
  const [searchTerm, setSearchTerm] = useState("");

  // Buy dialog
  const [buyDialog, setBuyDialog] = useState<{ open: boolean; listing: Listing | null }>({
    open: false,
    listing: null,
  });
  const [buyAmount, setBuyAmount] = useState("");
  const [buying, setBuying] = useState(false);
  const [buySuccess, setBuySuccess] = useState(false);

  // Create listing dialog
  const [createDialog, setCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({
    program: "",
    amount: "",
    pricePerThousand: "",
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [activeTab, setActiveTab] = useState("buy");

  useEffect(() => {
    loadListings();
    loadMyListings();
  }, []);

  const loadListings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/marketplace/listings");
      if (res.ok) {
        const data = await res.json();
        setListings(data.listings || data || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const loadMyListings = async () => {
    setLoadingMy(true);
    try {
      const res = await fetch("/api/marketplace/my-listings");
      if (res.ok) {
        const data = await res.json();
        setMyListings(data.listings || data || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingMy(false);
    }
  };

  const handleBuy = async () => {
    if (!buyDialog.listing || !buyAmount) return;
    const amount = parseInt(buyAmount);
    if (amount <= 0 || amount > buyDialog.listing.amount) return;

    setBuying(true);
    try {
      const res = await fetch("/api/marketplace/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: buyDialog.listing.id,
          amount,
        }),
      });
      if (res.ok) {
        setBuySuccess(true);
        setTimeout(() => {
          setBuySuccess(false);
          setBuyDialog({ open: false, listing: null });
          setBuyAmount("");
          loadListings();
        }, 2000);
      }
    } catch {
      // silently fail
    } finally {
      setBuying(false);
    }
  };

  const handleCreateListing = async () => {
    if (!createForm.program || !createForm.amount || !createForm.pricePerThousand) {
      setCreateError("Preencha todos os campos.");
      return;
    }
    setCreating(true);
    setCreateError("");
    try {
      const res = await fetch("/api/marketplace/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          program: createForm.program,
          amount: parseInt(createForm.amount),
          pricePerThousand: parseFloat(createForm.pricePerThousand),
        }),
      });
      if (res.ok) {
        setCreateDialog(false);
        setCreateForm({ program: "", amount: "", pricePerThousand: "" });
        await loadMyListings();
      } else {
        setCreateError("Erro ao criar anuncio.");
      }
    } catch {
      setCreateError("Erro de conexao.");
    } finally {
      setCreating(false);
    }
  };

  const handleCancelListing = async (id: string) => {
    try {
      await fetch(`/api/marketplace/my-listings?id=${id}`, { method: "DELETE" });
      setMyListings((prev) => prev.filter((l) => l.id !== id));
    } catch {
      // silently fail
    }
  };

  const filteredListings = listings
    .filter((l) => programFilter === "all" || l.program === programFilter)
    .filter(
      (l) =>
        !searchTerm ||
        l.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        PROGRAM_LABELS[l.program]?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) =>
      sortBy === "price"
        ? a.pricePerThousand - b.pricePerThousand
        : b.amount - a.amount
    );

  const buyTotal =
    buyDialog.listing && buyAmount
      ? (parseInt(buyAmount) / 1000) * buyDialog.listing.pricePerThousand
      : 0;
  const buyVpm =
    buyDialog.listing && buyAmount && parseInt(buyAmount) > 0
      ? buyDialog.listing.pricePerThousand
      : 0;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("pt-BR").format(value);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600">
          <Store className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Marketplace de Milhas</h1>
          <p className="text-muted-foreground">
            Compre e venda milhas com os melhores precos
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="buy" className="gap-2">
            <ShoppingCart className="w-4 h-4" />
            Comprar Milhas
          </TabsTrigger>
          <TabsTrigger value="sell" className="gap-2">
            <Tag className="w-4 h-4" />
            Minhas Vendas
          </TabsTrigger>
        </TabsList>

        {/* Buy Tab */}
        <TabsContent value="buy" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por vendedor ou programa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={programFilter} onValueChange={setProgramFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Programa" />
              </SelectTrigger>
              <SelectContent>
                {PROGRAMS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price">Menor Preco</SelectItem>
                <SelectItem value="amount">Mais Milhas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Listings Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6 space-y-4">
                    <div className="h-5 bg-muted rounded w-24" />
                    <div className="h-8 bg-muted rounded w-32" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-10 bg-muted rounded w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredListings.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground">
                {filteredListings.length}{" "}
                {filteredListings.length === 1 ? "oferta encontrada" : "ofertas encontradas"}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredListings.map((listing) => (
                  <Card
                    key={listing.id}
                    className="hover:shadow-lg transition-all group"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Badge
                          className={cn(
                            "text-xs",
                            PROGRAM_COLORS[listing.program] ||
                              "bg-gray-100 text-gray-700"
                          )}
                        >
                          {PROGRAM_LABELS[listing.program] || listing.program}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="w-3 h-3" />
                          {listing.sellerName}
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-baseline gap-1">
                          <Sparkles className="w-4 h-4 text-violet-500" />
                          <span className="text-3xl font-bold">
                            {formatNumber(listing.amount)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">milhas disponiveis</p>
                      </div>

                      <div className="bg-gradient-to-r from-violet-50 to-blue-50 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Preco por mil
                          </span>
                          <span className="text-lg font-bold text-violet-600">
                            {formatCurrency(listing.pricePerThousand)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted-foreground">
                            Total (todas)
                          </span>
                          <span className="text-sm font-medium">
                            {formatCurrency(
                              (listing.amount / 1000) * listing.pricePerThousand
                            )}
                          </span>
                        </div>
                      </div>

                      <Button
                        className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white"
                        onClick={() => {
                          setBuyDialog({ open: true, listing });
                          setBuyAmount(String(listing.amount));
                        }}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Comprar
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card className="p-12 text-center">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="font-semibold text-lg mb-2">Nenhuma oferta encontrada</h3>
              <p className="text-muted-foreground">
                Tente alterar os filtros ou volte mais tarde.
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Sell Tab */}
        <TabsContent value="sell" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Seus Anuncios</h2>
              <p className="text-sm text-muted-foreground">
                Gerencie suas ofertas de milhas
              </p>
            </div>
            <Button
              onClick={() => {
                setCreateForm({ program: "", amount: "", pricePerThousand: "" });
                setCreateError("");
                setCreateDialog(true);
              }}
              className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white gap-2"
            >
              <Plus className="w-4 h-4" />
              Novo Anuncio
            </Button>
          </div>

          {loadingMy ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            </div>
          ) : myListings.length > 0 ? (
            <div className="space-y-4">
              {myListings.map((listing) => (
                <Card
                  key={listing.id}
                  className={cn(
                    "hover:shadow-md transition-all border-l-4",
                    listing.status === "active"
                      ? "border-l-green-500"
                      : listing.status === "sold"
                      ? "border-l-blue-500"
                      : "border-l-gray-300"
                  )}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge
                            className={cn(
                              "text-xs",
                              PROGRAM_COLORS[listing.program] ||
                                "bg-gray-100 text-gray-700"
                            )}
                          >
                            {PROGRAM_LABELS[listing.program] || listing.program}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              listing.status === "active"
                                ? "border-green-200 text-green-700"
                                : listing.status === "sold"
                                ? "border-blue-200 text-blue-700"
                                : "border-gray-200 text-gray-500"
                            )}
                          >
                            {listing.status === "active"
                              ? "Ativo"
                              : listing.status === "sold"
                              ? "Vendido"
                              : "Cancelado"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Criado em{" "}
                          {new Date(listing.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Milhas</p>
                          <p className="text-lg font-bold">
                            {formatNumber(listing.amount)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Preco/mil</p>
                          <p className="text-lg font-bold text-violet-600">
                            {formatCurrency(listing.pricePerThousand)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="text-lg font-bold">
                            {formatCurrency(
                              (listing.amount / 1000) * listing.pricePerThousand
                            )}
                          </p>
                        </div>
                      </div>

                      {listing.status === "active" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 gap-1"
                          onClick={() => handleCancelListing(listing.id)}
                        >
                          <XCircle className="w-4 h-4" />
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Tag className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="font-semibold text-lg mb-2">Nenhum anuncio criado</h3>
              <p className="text-muted-foreground mb-4">
                Comece a vender suas milhas no marketplace.
              </p>
              <Button
                onClick={() => {
                  setCreateForm({ program: "", amount: "", pricePerThousand: "" });
                  setCreateError("");
                  setCreateDialog(true);
                }}
                className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Anuncio
              </Button>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Buy Dialog */}
      <Dialog
        open={buyDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setBuyDialog({ open: false, listing: null });
            setBuyAmount("");
            setBuySuccess(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          {buySuccess ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Compra realizada!</h3>
              <p className="text-muted-foreground">
                As milhas serao transferidas para sua conta.
              </p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Comprar Milhas</DialogTitle>
                <DialogDescription>
                  {buyDialog.listing && (
                    <>
                      Comprando de{" "}
                      <span className="font-medium">{buyDialog.listing.sellerName}</span> -{" "}
                      <span className="font-medium">
                        {PROGRAM_LABELS[buyDialog.listing.program] || buyDialog.listing.program}
                      </span>
                    </>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Quantidade de milhas</Label>
                  <Input
                    type="number"
                    placeholder="Quantidade"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    min="1000"
                    max={buyDialog.listing?.amount}
                    step="1000"
                  />
                  <p className="text-xs text-muted-foreground">
                    Disponivel: {formatNumber(buyDialog.listing?.amount || 0)} milhas
                  </p>
                </div>

                <Separator />

                <div className="bg-gradient-to-r from-violet-50 to-blue-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Preco por mil milhas
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(buyDialog.listing?.pricePerThousand || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">VPM</span>
                    <Badge
                      className={cn(
                        "text-xs",
                        buyVpm < 15
                          ? "bg-green-100 text-green-700"
                          : buyVpm < 25
                          ? "bg-yellow-100 text-yellow-700"
                          : buyVpm < 35
                          ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                      )}
                    >
                      R$ {buyVpm.toFixed(2)}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold text-violet-600">
                      {formatCurrency(buyTotal)}
                    </span>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setBuyDialog({ open: false, listing: null })}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleBuy}
                  disabled={buying || !buyAmount || parseInt(buyAmount) <= 0}
                  className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white"
                >
                  {buying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Confirmar Compra
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Listing Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Anuncio de Milhas</DialogTitle>
            <DialogDescription>
              Coloque suas milhas a venda no marketplace.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Programa de Milhas *</Label>
              <Select
                value={createForm.program}
                onValueChange={(v) => setCreateForm({ ...createForm, program: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o programa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latam-pass">LATAM Pass</SelectItem>
                  <SelectItem value="smiles">Smiles</SelectItem>
                  <SelectItem value="tudoazul">TudoAzul</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quantidade de Milhas *</Label>
              <Input
                type="number"
                placeholder="50.000"
                value={createForm.amount}
                onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                min="1000"
                step="1000"
              />
            </div>

            <div className="space-y-2">
              <Label>Preco por Mil Milhas (R$) *</Label>
              <Input
                type="number"
                placeholder="20.00"
                value={createForm.pricePerThousand}
                onChange={(e) =>
                  setCreateForm({ ...createForm, pricePerThousand: e.target.value })
                }
                min="0.01"
                step="0.01"
              />
            </div>

            {createForm.amount && createForm.pricePerThousand && (
              <div className="bg-gradient-to-r from-violet-50 to-blue-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Valor total</span>
                  <span className="font-bold text-violet-600">
                    {formatCurrency(
                      (parseInt(createForm.amount) / 1000) *
                        parseFloat(createForm.pricePerThousand)
                    )}
                  </span>
                </div>
              </div>
            )}

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
              onClick={handleCreateListing}
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
                  Criar Anuncio
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
