"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Lock, CreditCard, Trophy } from "lucide-react";
import { getTierInfo, formatPoints } from "@/lib/utils";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [saved, setSaved] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });

  const handleSaveProfile = async () => {
    await fetch("/api/client/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      alert("As senhas não coincidem");
      return;
    }
    const res = await fetch("/api/client/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new }),
    });
    if (res.ok) {
      alert("Senha alterada com sucesso!");
      setPasswords({ current: "", new: "", confirm: "" });
    } else {
      const data = await res.json();
      alert(data.error || "Erro ao alterar senha");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" /> Dados Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nome completo</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={session?.user?.email || ""} disabled />
            </div>
            <Button onClick={handleSaveProfile} className="gradient-primary text-white">
              {saved ? "Salvo!" : "Salvar Alterações"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="w-5 h-5" /> Alterar Senha
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Senha atual</Label>
              <Input
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              />
            </div>
            <div>
              <Label>Nova senha</Label>
              <Input
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              />
            </div>
            <div>
              <Label>Confirmar nova senha</Label>
              <Input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              />
            </div>
            <Button onClick={handleChangePassword}>Alterar Senha</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5" /> Nível & Tier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <Badge className="text-lg px-6 py-2 gradient-primary text-white">
                Bronze
              </Badge>
              <p className="text-muted-foreground mt-4">
                Continue acumulando pontos para subir de nível!
              </p>
              <div className="mt-4 text-sm text-muted-foreground space-y-1">
                <p>Bronze: 0 - 999 pts</p>
                <p>Prata: 1.000 - 4.999 pts</p>
                <p>Ouro: 5.000 - 9.999 pts</p>
                <p>Diamante: 10.000+ pts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5" /> Assinatura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">Você ainda não possui uma assinatura ativa.</p>
              <Button className="gradient-primary text-white">Ver Planos</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
