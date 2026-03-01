"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, UserPlus, Edit, Ban, Coins } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  tier: string;
  isBlocked: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [pointsDialog, setPointsDialog] = useState<{ open: boolean; user: User | null; amount: string }>({
    open: false, user: null, amount: "",
  });

  const fetchUsers = async () => {
    try {
      const res = await fetch(`/api/admin/users?search=${search}`);
      const data = await res.json();
      setUsers(data);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [search]);

  const handleBlock = async (userId: string, block: boolean) => {
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isBlocked: block }),
    });
    fetchUsers();
  };

  const handleAddPoints = async () => {
    if (!pointsDialog.user || !pointsDialog.amount) return;
    await fetch("/api/admin/points", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: pointsDialog.user.id,
        amount: parseInt(pointsDialog.amount),
        type: parseInt(pointsDialog.amount) > 0 ? "AJUSTE" : "AJUSTE",
        description: `Ajuste manual de pontos pelo admin`,
      }),
    });
    setPointsDialog({ open: false, user: null, amount: "" });
    fetchUsers();
  };

  const tierColors: Record<string, string> = {
    BRONZE: "bg-orange-100 text-orange-700",
    PRATA: "bg-gray-100 text-gray-700",
    OURO: "bg-yellow-100 text-yellow-700",
    DIAMANTE: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Usuários</h1>
          <p className="text-muted-foreground">Gerencie todos os clientes da plataforma</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Nome</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Email</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Pontos</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Tier</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Cadastro</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 px-2 font-medium">{user.name || "Sem nome"}</td>
                    <td className="py-3 px-2 text-sm text-muted-foreground">{user.email}</td>
                    <td className="py-3 px-2 font-semibold">{user.points.toLocaleString("pt-BR")}</td>
                    <td className="py-3 px-2">
                      <Badge className={tierColors[user.tier] || ""} variant="secondary">
                        {user.tier}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      <Badge variant={user.isBlocked ? "destructive" : "default"}>
                        {user.isBlocked ? "Bloqueado" : "Ativo"}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setPointsDialog({ open: true, user, amount: "" })}
                          title="Ajustar pontos"
                        >
                          <Coins className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleBlock(user.id, !user.isBlocked)}
                          title={user.isBlocked ? "Desbloquear" : "Bloquear"}
                        >
                          <Ban className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      Nenhum usuário encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={pointsDialog.open} onOpenChange={(open) => setPointsDialog({ ...pointsDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajustar Pontos - {pointsDialog.user?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Quantidade de pontos (use negativo para remover)</Label>
              <Input
                type="number"
                value={pointsDialog.amount}
                onChange={(e) => setPointsDialog({ ...pointsDialog, amount: e.target.value })}
                placeholder="Ex: 500 ou -200"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPointsDialog({ open: false, user: null, amount: "" })}>
              Cancelar
            </Button>
            <Button onClick={handleAddPoints}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
