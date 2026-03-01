"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Sparkles, Trophy, Gift, ShoppingBag, Plane, GraduationCap, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { formatPoints, getTierInfo } from "@/lib/utils";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/client/me")
      .then((r) => r.json())
      .then(setUserData)
      .catch(() => null);
  }, []);

  const points = userData?.points || 0;
  const tierInfo = getTierInfo(points);

  const quickActions = [
    { label: "Catálogo", icon: ShoppingBag, href: "/dashboard/catalog", color: "from-violet-500 to-purple-600" },
    { label: "Viagens", icon: Plane, href: "/dashboard/trips", color: "from-blue-500 to-cyan-500" },
    { label: "Cursos", icon: GraduationCap, href: "/dashboard/courses", color: "from-amber-500 to-orange-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Olá, {session?.user?.name?.split(" ")[0] || "Usuário"}!
        </h1>
        <p className="text-muted-foreground">Bem-vindo ao seu painel de milhas</p>
      </div>

      {/* Points Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden">
          <div className={`bg-gradient-to-r ${tierInfo.color} p-6 text-white`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6" />
                <Badge className="bg-white/20 text-white border-0 text-sm">
                  {tierInfo.label}
                </Badge>
              </div>
              <Sparkles className="w-8 h-8 opacity-50" />
            </div>
            <div className="mb-4">
              <p className="text-sm opacity-80">Seu saldo atual</p>
              <motion.p
                className="text-5xl font-bold"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {formatPoints(points)}
              </motion.p>
              <p className="text-sm opacity-80">pontos disponíveis</p>
            </div>
            {tierInfo.next && (
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Progresso para {tierInfo.next === 1000 ? "Prata" : tierInfo.next === 5000 ? "Ouro" : "Diamante"}</span>
                  <span>{Math.round(tierInfo.progress)}%</span>
                </div>
                <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${tierInfo.progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                <p className="text-xs opacity-70 mt-1">
                  Faltam {formatPoints(tierInfo.next - points)} pontos
                </p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={action.href}>
              <Card className="hover:shadow-lg transition-all cursor-pointer group">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{action.label}</h3>
                    <p className="text-sm text-muted-foreground">Explorar</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          {userData?.transactions?.length > 0 ? (
            <div className="space-y-3">
              {userData.transactions.slice(0, 5).map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <span className={`font-semibold text-sm ${tx.amount > 0 ? "text-green-600" : "text-red-500"}`}>
                    {tx.amount > 0 ? "+" : ""}{formatPoints(tx.amount)} pts
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma atividade recente
            </p>
          )}
          <Link href="/dashboard/statement">
            <Button variant="ghost" className="w-full mt-4">
              Ver extrato completo <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
