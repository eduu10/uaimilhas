"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, ShoppingBag, Sparkles, Package, CheckCircle } from "lucide-react";
import { formatPoints } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  pointsCost: number;
  stock: number;
  category?: { name: string };
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [redeemDialog, setRedeemDialog] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/client/catalog?search=${search}&category=${category}`)
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => setProducts([]));
  }, [search, category]);

  const handleRedeem = async () => {
    if (!redeemDialog.product) return;
    const res = await fetch("/api/client/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: redeemDialog.product.id }),
    });

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setRedeemDialog({ open: false, product: null });
      }, 2000);
    } else {
      const err = await res.json();
      alert(err.error || "Erro ao resgatar");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Catálogo de Produtos</h1>
        <p className="text-muted-foreground">Resgate produtos com seus pontos</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="eletronicos">Eletrônicos</SelectItem>
            <SelectItem value="viagens">Viagens</SelectItem>
            <SelectItem value="experiencias">Experiências</SelectItem>
            <SelectItem value="vouchers">Vouchers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden group hover:shadow-lg transition-all">
            <div className="h-48 bg-muted flex items-center justify-center">
              {product.images[0] ? (
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              ) : (
                <Package className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-violet-500" />
                  <span className="font-bold text-violet-600 text-lg">{formatPoints(product.pointsCost)} pts</span>
                </div>
                <Button
                  onClick={() => setRedeemDialog({ open: true, product })}
                  disabled={product.stock <= 0}
                >
                  {product.stock > 0 ? "Resgatar" : "Indisponível"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <Card className="p-12 text-center">
          <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">Nenhum produto encontrado</h3>
        </Card>
      )}

      <Dialog open={redeemDialog.open} onOpenChange={(open) => setRedeemDialog({ ...redeemDialog, open })}>
        <DialogContent>
          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Resgate realizado!</h3>
              <p className="text-muted-foreground">Seu produto será enviado em breve.</p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Confirmar Resgate</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="mb-2">Deseja resgatar <strong>{redeemDialog.product?.name}</strong>?</p>
                <p className="text-muted-foreground">
                  Serão debitados{" "}
                  <span className="font-bold text-violet-600">
                    {formatPoints(redeemDialog.product?.pointsCost || 0)} pontos
                  </span>{" "}
                  do seu saldo.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRedeemDialog({ open: false, product: null })}>
                  Cancelar
                </Button>
                <Button onClick={handleRedeem} className="gradient-primary text-white">
                  Confirmar Resgate
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
