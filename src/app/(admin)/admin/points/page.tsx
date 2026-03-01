"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, TrendingUp, TrendingDown, ArrowUpDown } from "lucide-react";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
  user: { name: string; email: string };
}

export default function PointsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetch("/api/admin/points")
      .then((r) => r.json())
      .then(setTransactions)
      .catch(() => setTransactions([]));
  }, []);

  const typeColors: Record<string, string> = {
    GANHO: "bg-green-100 text-green-700",
    RESGATE: "bg-red-100 text-red-700",
    BONUS: "bg-blue-100 text-blue-700",
    AJUSTE: "bg-yellow-100 text-yellow-700",
    ASSINATURA: "bg-violet-100 text-violet-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestão de Pontos</h1>
        <p className="text-muted-foreground">Histórico de todas as transações de pontos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-100">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Emitidos</p>
              <p className="text-2xl font-bold">
                {transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0).toLocaleString("pt-BR")}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-100">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Resgatados</p>
              <p className="text-2xl font-bold">
                {Math.abs(transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0)).toLocaleString("pt-BR")}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-violet-100">
              <ArrowUpDown className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Transações</p>
              <p className="text-2xl font-bold">{transactions.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Coins className="w-5 h-5" /> Histórico de Transações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                    {tx.user?.name?.split(" ").map(n => n[0]).join("") || "?"}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{tx.user?.name || tx.user?.email}</p>
                    <p className="text-xs text-muted-foreground">{tx.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={typeColors[tx.type] || ""} variant="secondary">{tx.type}</Badge>
                  <span className={`font-semibold text-sm ${tx.amount > 0 ? "text-green-600" : "text-red-500"}`}>
                    {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString("pt-BR")} pts
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(tx.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhuma transação encontrada</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
