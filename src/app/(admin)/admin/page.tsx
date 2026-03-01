"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Coins, Gift, DollarSign, TrendingUp, ArrowUpRight } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";

const chartData = [
  { month: "Jan", usuarios: 120, resgates: 45 },
  { month: "Fev", usuarios: 180, resgates: 62 },
  { month: "Mar", usuarios: 250, resgates: 85 },
  { month: "Abr", usuarios: 310, resgates: 110 },
  { month: "Mai", usuarios: 420, resgates: 145 },
  { month: "Jun", usuarios: 530, resgates: 190 },
];

const recentTransactions = [
  { user: "Ana Silva", type: "RESGATE", description: "iPhone 15 Pro", points: -45000, date: "Hoje" },
  { user: "Carlos M.", type: "BONUS", description: "Bônus de boas-vindas", points: 100, date: "Hoje" },
  { user: "Maria S.", type: "ASSINATURA", description: "Plano Pro - Mensal", points: 2000, date: "Ontem" },
  { user: "Pedro O.", type: "RESGATE", description: "Curso de Marketing", points: -8000, date: "Ontem" },
  { user: "Lucia F.", type: "GANHO", description: "Compra no parceiro", points: 500, date: "2 dias" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPoints: 0,
    totalRedeems: 0,
    monthlyRevenue: 0,
  });

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {
        setStats({ totalUsers: 532, totalPoints: 1250000, totalRedeems: 847, monthlyRevenue: 42350 });
      });
  }, []);

  const cards = [
    { title: "Total de Clientes", value: stats.totalUsers.toLocaleString("pt-BR"), icon: Users, change: "+12%", color: "text-blue-600" },
    { title: "Pontos Emitidos", value: stats.totalPoints.toLocaleString("pt-BR"), icon: Coins, change: "+8%", color: "text-violet-600" },
    { title: "Resgates Realizados", value: stats.totalRedeems.toLocaleString("pt-BR"), icon: Gift, change: "+15%", color: "text-amber-600" },
    { title: "Receita Mensal", value: `R$ ${stats.monthlyRevenue.toLocaleString("pt-BR")}`, icon: DollarSign, change: "+22%", color: "text-green-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Visão Geral</h1>
        <p className="text-muted-foreground">Acompanhe as métricas da plataforma</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-muted ${card.color}`}>
                  <card.icon className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>{card.change} este mês</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Crescimento de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorUsuarios" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Area type="monotone" dataKey="usuarios" stroke="#7C3AED" fill="url(#colorUsuarios)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resgates por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="resgates" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Últimas Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.map((tx, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                    {tx.user.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{tx.user}</p>
                    <p className="text-xs text-muted-foreground">{tx.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-sm ${tx.points > 0 ? "text-green-600" : "text-red-500"}`}>
                    {tx.points > 0 ? "+" : ""}{tx.points.toLocaleString("pt-BR")} pts
                  </p>
                  <p className="text-xs text-muted-foreground">{tx.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
