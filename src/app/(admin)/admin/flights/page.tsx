"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plane,
  Bell,
  TrendingUp,
  BookmarkCheck,
  Filter,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FlightSearch {
  id: string;
  userId: string | null;
  user: { name: string | null; email: string } | null;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string | null;
  passengers: number;
  createdAt: string;
}

interface FlightAlert {
  id: string;
  userId: string;
  user: { id: string; name: string | null; email: string };
  origin: string;
  destination: string;
  maxPrice: number | null;
  isActive: boolean;
  createdAt: string;
}

interface SavedFlight {
  id: string;
  userId: string;
  airline: string;
  origin: string;
  destination: string;
  price: number;
  departureAt: string;
  createdAt: string;
}

interface PriceHistoryEntry {
  id: string;
  origin: string;
  destination: string;
  airline: string | null;
  price: number;
  recordedAt: string;
}

interface FlightStats {
  totalSearches: number;
  totalAlerts: number;
  totalSavedFlights: number;
  activeAlerts: number;
}

export default function FlightsPage() {
  const [stats, setStats] = useState<FlightStats>({
    totalSearches: 0,
    totalAlerts: 0,
    totalSavedFlights: 0,
    activeAlerts: 0,
  });
  const [searches, setSearches] = useState<FlightSearch[]>([]);
  const [alerts, setAlerts] = useState<FlightAlert[]>([]);
  const [savedFlights, setSavedFlights] = useState<SavedFlight[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");
  const [routeFilter, setRouteFilter] = useState({ origin: "", destination: "" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, searchesRes, alertsRes, savedRes] = await Promise.all([
        fetch("/api/admin/flights/stats"),
        fetch("/api/admin/flights/searches"),
        fetch("/api/admin/flights/alerts"),
        fetch("/api/admin/flights/saved"),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (searchesRes.ok) {
        const data = await searchesRes.json();
        setSearches(Array.isArray(data) ? data : []);
      }
      if (alertsRes.ok) {
        const data = await alertsRes.json();
        setAlerts(Array.isArray(data) ? data : []);
      }
      if (savedRes.ok) {
        const data = await savedRes.json();
        setSavedFlights(Array.isArray(data) ? data : []);
      }
    } catch {
      // keep defaults
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceHistory = async () => {
    try {
      const params = new URLSearchParams();
      if (routeFilter.origin) params.set("origin", routeFilter.origin);
      if (routeFilter.destination) params.set("destination", routeFilter.destination);
      const res = await fetch(`/api/admin/flights/price-history?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPriceHistory(Array.isArray(data) ? data : []);
      }
    } catch {
      setPriceHistory([]);
    }
  };

  useEffect(() => {
    fetchData();
    fetchPriceHistory();
  }, []);

  const handleToggleAlert = async (alertId: string, isActive: boolean) => {
    await fetch(`/api/admin/flights/alerts/${alertId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    fetchData();
  };

  const statCards = [
    { title: "Total de Buscas", value: stats.totalSearches.toLocaleString("pt-BR"), icon: Search, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Alertas de Preço", value: stats.totalAlerts.toLocaleString("pt-BR"), icon: Bell, color: "text-amber-600", bg: "bg-amber-100", subtitle: `${stats.activeAlerts} ativos` },
    { title: "Voos Salvos", value: stats.totalSavedFlights.toLocaleString("pt-BR"), icon: BookmarkCheck, color: "text-green-600", bg: "bg-green-100" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Voos</h1>
          <p className="text-muted-foreground">Monitore buscas, alertas e histórico de preços</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading}>
          <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                  {"subtitle" in card && card.subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
                  )}
                </div>
                <div className={cn("p-3 rounded-xl", card.bg)}>
                  <card.icon className={cn("w-5 h-5", card.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="searches" className="space-y-4">
        <TabsList>
          <TabsTrigger value="searches"><Search className="w-4 h-4 mr-2" />Buscas Recentes</TabsTrigger>
          <TabsTrigger value="alerts"><Bell className="w-4 h-4 mr-2" />Alertas de Preço</TabsTrigger>
          <TabsTrigger value="saved"><BookmarkCheck className="w-4 h-4 mr-2" />Voos Salvos</TabsTrigger>
          <TabsTrigger value="prices"><TrendingUp className="w-4 h-4 mr-2" />Histórico de Preços</TabsTrigger>
        </TabsList>

        <TabsContent value="searches">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <CardTitle className="text-lg">Buscas Recentes</CardTitle>
                <div className="relative flex-1 max-w-sm ml-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Filtrar por rota ou usuário..." value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)} className="pl-10" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Usuário</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Origem</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Destino</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Ida</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Volta</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Passageiros</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searches
                      .filter((s) =>
                        !searchFilter ||
                        s.origin.toLowerCase().includes(searchFilter.toLowerCase()) ||
                        s.destination.toLowerCase().includes(searchFilter.toLowerCase()) ||
                        (s.user?.name || "").toLowerCase().includes(searchFilter.toLowerCase())
                      )
                      .map((search) => (
                        <tr key={search.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-3 px-2">
                            <p className="font-medium text-sm">{search.user?.name || "Anônimo"}</p>
                            <p className="text-xs text-muted-foreground">{search.user?.email || ""}</p>
                          </td>
                          <td className="py-3 px-2"><Badge variant="outline">{search.origin}</Badge></td>
                          <td className="py-3 px-2"><Badge variant="outline">{search.destination}</Badge></td>
                          <td className="py-3 px-2 text-sm">{new Date(search.departureDate).toLocaleDateString("pt-BR")}</td>
                          <td className="py-3 px-2 text-sm text-muted-foreground">{search.returnDate ? new Date(search.returnDate).toLocaleDateString("pt-BR") : "Somente ida"}</td>
                          <td className="py-3 px-2 text-sm text-center">{search.passengers}</td>
                          <td className="py-3 px-2 text-sm text-muted-foreground">{new Date(search.createdAt).toLocaleDateString("pt-BR")}</td>
                        </tr>
                      ))}
                    {searches.length === 0 && !loading && (
                      <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">Nenhuma busca encontrada</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Bell className="w-5 h-5" />Todos os Alertas de Preço</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Usuário</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Origem</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Destino</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Preço Máx.</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Criado em</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map((alert) => (
                      <tr key={alert.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-2">
                          <p className="font-medium text-sm">{alert.user?.name || "Sem nome"}</p>
                          <p className="text-xs text-muted-foreground">{alert.user?.email}</p>
                        </td>
                        <td className="py-3 px-2"><Badge variant="outline">{alert.origin}</Badge></td>
                        <td className="py-3 px-2"><Badge variant="outline">{alert.destination}</Badge></td>
                        <td className="py-3 px-2 font-semibold text-sm">
                          {alert.maxPrice != null ? `R$ ${alert.maxPrice.toLocaleString("pt-BR")}` : "-"}
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant={alert.isActive ? "default" : "secondary"}>
                            {alert.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-sm text-muted-foreground">{new Date(alert.createdAt).toLocaleDateString("pt-BR")}</td>
                        <td className="py-3 px-2 text-right">
                          <Button size="sm" variant="outline" onClick={() => handleToggleAlert(alert.id, alert.isActive)}>
                            {alert.isActive ? "Desativar" : "Ativar"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {alerts.length === 0 && !loading && (
                      <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">Nenhum alerta encontrado</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><BookmarkCheck className="w-5 h-5" />Voos Salvos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Companhia</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Origem</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Destino</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Preço</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Partida</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Salvo em</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savedFlights.map((flight) => (
                      <tr key={flight.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-2 text-sm font-medium">{flight.airline}</td>
                        <td className="py-3 px-2"><Badge variant="outline">{flight.origin}</Badge></td>
                        <td className="py-3 px-2"><Badge variant="outline">{flight.destination}</Badge></td>
                        <td className="py-3 px-2 font-semibold text-sm text-green-600">R$ {flight.price.toLocaleString("pt-BR")}</td>
                        <td className="py-3 px-2 text-sm">{new Date(flight.departureAt).toLocaleDateString("pt-BR")}</td>
                        <td className="py-3 px-2 text-sm text-muted-foreground">{new Date(flight.createdAt).toLocaleDateString("pt-BR")}</td>
                      </tr>
                    ))}
                    {savedFlights.length === 0 && !loading && (
                      <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Nenhum voo salvo encontrado</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prices">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="w-5 h-5" />Histórico de Preços</CardTitle>
                <div className="flex items-center gap-2">
                  <Input placeholder="Origem (ex: GRU)" value={routeFilter.origin} onChange={(e) => setRouteFilter({ ...routeFilter, origin: e.target.value })} className="w-36" />
                  <Plane className="w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Destino (ex: GIG)" value={routeFilter.destination} onChange={(e) => setRouteFilter({ ...routeFilter, destination: e.target.value })} className="w-36" />
                  <Button variant="outline" size="sm" onClick={fetchPriceHistory}><Filter className="w-4 h-4 mr-1" />Filtrar</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Rota</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Companhia</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Preço</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceHistory.map((entry) => (
                      <tr key={entry.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{entry.origin}</Badge>
                            <Plane className="w-3 h-3 text-muted-foreground" />
                            <Badge variant="outline">{entry.destination}</Badge>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-sm font-medium">{entry.airline || "-"}</td>
                        <td className="py-3 px-2 font-semibold text-sm">R$ {entry.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 px-2 text-sm text-muted-foreground">{new Date(entry.recordedAt).toLocaleDateString("pt-BR")}</td>
                      </tr>
                    ))}
                    {priceHistory.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-muted-foreground">
                          {routeFilter.origin || routeFilter.destination ? "Nenhum registro encontrado para esta rota" : "Filtre por uma rota para ver o histórico de preços"}
                        </td>
                      </tr>
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
