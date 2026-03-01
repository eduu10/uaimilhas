"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, TrendingUp, TrendingDown, Coins } from "lucide-react";
import { formatPoints } from "@/lib/utils";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

export default function StatementPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/client/statement")
      .then((r) => r.json())
      .then(setTransactions)
      .catch(() => setTransactions([]));
  }, []);

  const filtered = filter === "all"
    ? transactions
    : transactions.filter((t) => t.type === filter);

  const totalGained = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalSpent = Math.abs(transactions.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0));

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
        <h1 className="text-3xl font-bold">Extrato de Pontos</h1>
        <p className="text-muted-foreground">Histórico completo de transações</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-100">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Ganhos</p>
              <p className="text-2xl font-bold text-green-600">+{formatPoints(totalGained)}</p>
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
              <p className="text-2xl font-bold text-red-500">-{formatPoints(totalSpent)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-violet-100">
              <Coins className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Saldo Líquido</p>
              <p className="text-2xl font-bold">{formatPoints(totalGained - totalSpent)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" /> Transações
            </CardTitle>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filtrar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="GANHO">Ganhos</SelectItem>
                <SelectItem value="RESGATE">Resgates</SelectItem>
                <SelectItem value="BONUS">Bônus</SelectItem>
                <SelectItem value="AJUSTE">Ajustes</SelectItem>
                <SelectItem value="ASSINATURA">Assinatura</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filtered.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <p className="font-medium text-sm">{tx.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={typeColors[tx.type] || ""} variant="secondary">
                      {tx.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit", month: "2-digit", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
                <span className={`font-bold ${tx.amount > 0 ? "text-green-600" : "text-red-500"}`}>
                  {tx.amount > 0 ? "+" : ""}{formatPoints(tx.amount)} pts
                </span>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhuma transação encontrada</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
