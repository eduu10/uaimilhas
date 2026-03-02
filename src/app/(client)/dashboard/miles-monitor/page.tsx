"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
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
  Eye,
  Plus,
  Loader2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Calendar,
  TrendingUp,
  Wallet,
  Pencil,
  AlertTriangle,
  Clock,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PROGRAMS = [
  {
    value: "latam-pass",
    label: "LATAM Pass",
    color: "from-red-500 to-red-600",
    bgLight: "bg-red-50",
    textColor: "text-red-600",
    borderColor: "border-red-200",
  },
  {
    value: "smiles",
    label: "Smiles",
    color: "from-orange-500 to-orange-600",
    bgLight: "bg-orange-50",
    textColor: "text-orange-600",
    borderColor: "border-orange-200",
  },
  {
    value: "tudoazul",
    label: "TudoAzul",
    color: "from-blue-500 to-blue-600",
    bgLight: "bg-blue-50",
    textColor: "text-blue-600",
    borderColor: "border-blue-200",
  },
  {
    value: "livelo",
    label: "Livelo",
    color: "from-purple-500 to-purple-600",
    bgLight: "bg-purple-50",
    textColor: "text-purple-600",
    borderColor: "border-purple-200",
  },
  {
    value: "esfera",
    label: "Esfera",
    color: "from-green-500 to-green-600",
    bgLight: "bg-green-50",
    textColor: "text-green-600",
    borderColor: "border-green-200",
  },
];

interface MilesAccount {
  id: string;
  program: string;
  balance: number;
  expiryDate: string | null;
  lastUpdated: string;
}

function getProgramConfig(program: string) {
  return (
    PROGRAMS.find((p) => p.value === program) || {
      value: program,
      label: program,
      color: "from-gray-500 to-gray-600",
      bgLight: "bg-gray-50",
      textColor: "text-gray-600",
      borderColor: "border-gray-200",
    }
  );
}

function daysUntilExpiry(expiryDate: string | null): number | null {
  if (!expiryDate) return null;
  const expiry = new Date(expiryDate);
  const now = new Date();
  const diff = expiry.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function MilesMonitorPage() {
  const [accounts, setAccounts] = useState<MilesAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<MilesAccount | null>(null);
  const [form, setForm] = useState({
    program: "",
    balance: "",
    expiryDate: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/miles-monitor");
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || data || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingAccount(null);
    setForm({ program: "", balance: "", expiryDate: "" });
    setError("");
    setDialogOpen(true);
  };

  const openEditDialog = (account: MilesAccount) => {
    setEditingAccount(account);
    setForm({
      program: account.program,
      balance: String(account.balance),
      expiryDate: account.expiryDate
        ? new Date(account.expiryDate).toISOString().split("T")[0]
        : "",
    });
    setError("");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.program || !form.balance) {
      setError("Preencha programa e saldo.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        program: form.program,
        balance: parseInt(form.balance),
        expiryDate: form.expiryDate || null,
        id: editingAccount?.id,
      };

      const res = await fetch("/api/miles-monitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setDialogOpen(false);
        await loadAccounts();
      } else {
        setError("Erro ao salvar. Tente novamente.");
      }
    } catch {
      setError("Erro de conexao.");
    } finally {
      setSaving(false);
    }
  };

  const totalMiles = accounts.reduce((sum, a) => sum + a.balance, 0);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("pt-BR").format(value);

  const expiringAccounts = accounts.filter((a) => {
    const days = daysUntilExpiry(a.expiryDate);
    return days !== null && days > 0 && days <= 90;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Monitor de Milhas</h1>
            <p className="text-muted-foreground">
              Acompanhe todos os seus saldos de milhas em um so lugar
            </p>
          </div>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar Conta
        </Button>
      </div>

      {/* Total Summary */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80 mb-1">Total de Milhas / Pontos</p>
              <p className="text-5xl font-bold">{formatNumber(totalMiles)}</p>
              <p className="text-sm opacity-80 mt-1">
                em {accounts.length} {accounts.length === 1 ? "programa" : "programas"}
              </p>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl">
              <Wallet className="w-10 h-10 opacity-80" />
            </div>
          </div>
        </div>
      </Card>

      {/* Expiry Warnings */}
      {expiringAccounts.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800">Milhas expirando em breve</p>
                <div className="space-y-1 mt-2">
                  {expiringAccounts.map((account) => {
                    const config = getProgramConfig(account.program);
                    const days = daysUntilExpiry(account.expiryDate);
                    return (
                      <p key={account.id} className="text-sm text-amber-700">
                        <span className="font-medium">{config.label}</span>:{" "}
                        {formatNumber(account.balance)} milhas expiram em{" "}
                        <span className="font-medium">{days} dias</span>
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accounts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 space-y-4">
                <div className="h-6 bg-muted rounded w-24" />
                <div className="h-10 bg-muted rounded w-40" />
                <div className="h-4 bg-muted rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : accounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => {
            const config = getProgramConfig(account.program);
            const days = daysUntilExpiry(account.expiryDate);
            const percentOfTotal =
              totalMiles > 0 ? (account.balance / totalMiles) * 100 : 0;

            return (
              <Card
                key={account.id}
                className="hover:shadow-lg transition-all group overflow-hidden"
              >
                <div className={cn("h-1.5 bg-gradient-to-r", config.color)} />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "p-2 rounded-lg",
                          config.bgLight
                        )}
                      >
                        <Award className={cn("w-5 h-5", config.textColor)} />
                      </div>
                      <span className="font-semibold">{config.label}</span>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => openEditDialog(account)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <Sparkles className={cn("w-4 h-4", config.textColor)} />
                      <span className="text-3xl font-bold">
                        {formatNumber(account.balance)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      milhas / pontos
                    </p>
                  </div>

                  {/* Balance proportion */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Proporcao do total</span>
                      <span>{percentOfTotal.toFixed(1)}%</span>
                    </div>
                    <Progress value={percentOfTotal} className="h-1.5" />
                  </div>

                  <Separator className="mb-3" />

                  <div className="space-y-2">
                    {account.expiryDate && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          Expira em
                        </div>
                        <span
                          className={cn(
                            "text-sm font-medium",
                            days !== null && days <= 30
                              ? "text-red-600"
                              : days !== null && days <= 90
                              ? "text-amber-600"
                              : "text-muted-foreground"
                          )}
                        >
                          {new Date(account.expiryDate).toLocaleDateString("pt-BR")}
                          {days !== null && days > 0 && (
                            <span className="text-xs ml-1">({days}d)</span>
                          )}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        Atualizado
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(account.lastUpdated).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4 gap-1"
                    onClick={() => openEditDialog(account)}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Atualizar Saldo
                  </Button>
                </CardContent>
              </Card>
            );
          })}

          {/* Add New Card */}
          <Card
            className="hover:shadow-lg transition-all cursor-pointer border-dashed border-2 flex items-center justify-center min-h-[280px]"
            onClick={openCreateDialog}
          >
            <CardContent className="p-6 text-center">
              <div className="p-4 rounded-full bg-violet-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Plus className="w-8 h-8 text-violet-600" />
              </div>
              <p className="font-semibold text-muted-foreground">Adicionar Programa</p>
              <p className="text-sm text-muted-foreground">
                Monitore mais milhas
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Eye className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="font-semibold text-lg mb-2">Nenhuma conta cadastrada</h3>
          <p className="text-muted-foreground mb-4">
            Adicione seus programas de milhas para monitorar os saldos.
          </p>
          <Button
            onClick={openCreateDialog}
            className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Primeiro Programa
          </Button>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAccount ? "Atualizar Saldo" : "Adicionar Conta de Milhas"}
            </DialogTitle>
            <DialogDescription>
              {editingAccount
                ? "Atualize o saldo e informacoes da sua conta."
                : "Adicione um novo programa de milhas para monitorar."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Programa de Milhas *</Label>
              <Select
                value={form.program}
                onValueChange={(v) => setForm({ ...form, program: v })}
                disabled={!!editingAccount}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o programa" />
                </SelectTrigger>
                <SelectContent>
                  {PROGRAMS.filter(
                    (p) =>
                      editingAccount?.program === p.value ||
                      !accounts.some((a) => a.program === p.value)
                  ).map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Saldo Atual *</Label>
              <Input
                type="number"
                placeholder="50.000"
                value={form.balance}
                onChange={(e) => setForm({ ...form, balance: e.target.value })}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Data de Expiracao (opcional)</Label>
              <Input
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Deixe em branco se as milhas nao expiram
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : editingAccount ? (
                "Atualizar"
              ) : (
                "Adicionar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
