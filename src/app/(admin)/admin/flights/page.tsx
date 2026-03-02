"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Plane,
  Bell,
  TrendingUp,
  TrendingDown,
  BookmarkCheck,
  Eye,
  Filter,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FlightSearch {
  id: string;
  userId: string;
  user: { name: string; email: string };
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
  user: { name: string; email: string };
  origin: string;
  destination: string;
  maxPrice: number;
  isActive: boolean;
  createdAt: string;
}

interface SavedFlight {
  id: string;
  userId: string;
  user: { name: string; email: string };
  airline: string;
  origin: string;
  destination: string;
  price: number;
  departureDate: string;
  createdAt: string;
}

interface PriceHistory {
  id: string;
  origin: string;
  destination: string;
  airline: string;
  price: number;
  date: string;
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
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");
  const [routeFilter, setRouteFilter] = useState({ origin: "", destination: "" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, searchesRes, alertsRes, savedRes] = await Promise.all([
        fetch("/api/admin/flights/stats"),
        fetch(`/api/admin/flights/searches?search=${searchFilter}`),
        fetch("/api/admin/flights/alerts"),
        fetch("/api/admin/flights/saved"),
      ]);

      const statsData = await statsRes.json();
      const searchesData = await searchesRes.json();
      const alertsData = await alertsRes.json();
      const savedData = await savedRes.json();

      setStats(statsData);
      setSearches(Array.isArray(searchesData) ? searchesData : []);
      setAlerts(Array.isArray(alertsData) ? alertsData : []);
      setSavedFlights(Array.isArray(savedData) ? savedData : []);
    } catch {
      setStats({ totalSearches: 0, totalAlerts: 0, totalSavedFlights: 0, activeAlerts: 0 });
      setSearches([]);
      setAlerts([]);
      setSavedFlights([]);
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
      const data = await res.json();
      setPriceHistory(Array.isArray(data) ? data : []);
    } catch {
      setPriceHistory([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchPriceHistory();
  }, [routeFilter]);

  const handleToggleAlert = async (alertId: string, isActive: boolean) => {
    await fetch(`/api/admin/flights/alerts/${alertId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    fetchData();
  };

  const statCards = [
    {
      title: "Total de Buscas",
      value: stats.totalSearches.toLocaleString("pt-BR"),
      icon: Search,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Alertas de Preço",
      value: stats.totalAlerts.toLocaleString("pt-BR"),
      icon: Bell,
      color: "text-amber-600",
      bg: "bg-amber-100",
      subtitle: `${stats.activeAlerts} ativos`,
    },
    {
      title: "Voos Salvos",
      value: stats.totalSavedFlights.toLocaleString("pt-BR"),
      icon: BookmarkCheck,
      color: "text-green-600",
      bg: "bg-green-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestao de Voos</h1>
          <p className="text-muted-foreground">
            Monitore buscas, alertas e historico de precos
          </p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading}>
          <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                  {card.subtitle && (
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

      {/* Tabs */}
      <Tabs defaultValue="searches" className="space-y-4">
        <TabsList>
          <TabsTrigger value="searches">
            <Search className="w-4 h-4 mr-2" />
            Buscas Recentes
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <Bell className="w-4 h-4 mr-2" />
            Alertas de Preco
          </TabsTrigger>
          <TabsTrigger value="saved">
            <BookmarkCheck className="w-4 h-4 mr-2" />
            Voos Salvos
          </TabsTrigger>
          <TabsTrigger value="prices">
            <TrendingUp className="w-4 h-4 mr-2" />
            Historico de Precos
          </TabsTrigger>
        </TabsList>

        {/* Recent Searches Tab */}
        <TabsContent value="searches">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <CardTitle className="text-lg">Buscas Recentes</CardTitle>
                <div className="relative flex-1 max-w-sm ml-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Filtrar por rota ou usuario..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
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
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Usuario
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Origem
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Destino
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Ida
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Volta
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Passageiros
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Data
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {searches
                      .filter(
                        (s) =>
                          !searchFilter ||
                          s.origin.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          s.destination.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          s.user?.name?.toLowerCase().includes(searchFilter.toLowerCase())
                      )
                      .map((search) => (
                        <tr
                          key={search.id}
                          className="border-b last:border-0 hover:bg-muted/50"
                        >
                          <td className="py-3 px-2">
                            <div>
                              <p className="font-medium text-sm">
                                {search.user?.name || "Anonimo"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {search.user?.email}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <Badge variant="outline">{search.origin}</Badge>
                          </td>
                          <td className="py-3 px-2">
                            <Badge variant="outline">{search.destination}</Badge>
                          </td>
                          <td className="py-3 px-2 text-sm">
                            {new Date(search.departureDate).toLocaleDateString("pt-BR")}
                          </td>
                          <td className="py-3 px-2 text-sm text-muted-foreground">
                            {search.returnDate
                              ? new Date(search.returnDate).toLocaleDateString("pt-BR")
                              : "Somente ida"}
                          </td>
                          <td className="py-3 px-2 text-sm text-center">
                            {search.passengers}
                          </td>
                          <td className="py-3 px-2 text-sm text-muted-foreground">
                            {new Date(search.createdAt).toLocaleDateString("pt-BR")}
                          </td>
                        </tr>
                      ))}
                    {searches.length === 0 && !loading && (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-8 text-center text-muted-foreground"
                        >
                          Nenhuma busca encontrada
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Todos os Alertas de Preco
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Usuario
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Origem
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Destino
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Preco Max.
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Criado em
                      </th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                        Acoes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map((alert) => (
                      <tr
                        key={alert.id}
                        className="border-b last:border-0 hover:bg-muted/50"
                      >
                        <td className="py-3 px-2">
                          <div>
                            <p className="font-medium text-sm">
                              {alert.user?.name || "Sem nome"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {alert.user?.email}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant="outline">{alert.origin}</Badge>
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant="outline">{alert.destination}</Badge>
                        </td>
                        <td className="py-3 px-2 font-semibold text-sm">
                          R$ {alert.maxPrice.toLocaleString("pt-BR")}
                        </td>
                        <td className="py-3 px-2">
                          <Badge
                            variant={alert.isActive ? "default" : "secondary"}
                          >
                            {alert.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-sm text-muted-foreground">
                          {new Date(alert.createdAt).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleToggleAlert(alert.id, alert.isActive)
                            }
                          >
                            {alert.isActive ? "Desativar" : "Ativar"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {alerts.length === 0 && !loading && (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-8 text-center text-muted-foreground"
                        >
                          Nenhum alerta encontrado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Saved Flights Tab */}
        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookmarkCheck className="w-5 h-5" />
                Voos Salvos por Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Usuario
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Companhia
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Origem
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Destino
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Preco
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Partida
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Salvo em
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {savedFlights.map((flight) => (
                      <tr
                        key={flight.id}
                        className="border-b last:border-0 hover:bg-muted/50"
                      >
                        <td className="py-3 px-2">
                          <div>
                            <p className="font-medium text-sm">
                              {flight.user?.name || "Sem nome"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {flight.user?.email}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-sm font-medium">
                          {flight.airline}
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant="outline">{flight.origin}</Badge>
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant="outline">{flight.destination}</Badge>
                        </td>
                        <td className="py-3 px-2 font-semibold text-sm text-green-600">
                          R$ {flight.price.toLocaleString("pt-BR")}
                        </td>
                        <td className="py-3 px-2 text-sm">
                          {new Date(flight.departureDate).toLocaleDateString(
                            "pt-BR"
                          )}
                        </td>
                        <td className="py-3 px-2 text-sm text-muted-foreground">
                          {new Date(flight.createdAt).toLocaleDateString("pt-BR")}
                        </td>
                      </tr>
                    ))}
                    {savedFlights.length === 0 && !loading && (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-8 text-center text-muted-foreground"
                        >
                          Nenhum voo salvo encontrado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Price History Tab */}
        <TabsContent value="prices">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Historico de Precos
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Origem (ex: GRU)"
                    value={routeFilter.origin}
                    onChange={(e) =>
                      setRouteFilter({ ...routeFilter, origin: e.target.value })
                    }
                    className="w-36"
                  />
                  <Plane className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Destino (ex: MIA)"
                    value={routeFilter.destination}
                    onChange={(e) =>
                      setRouteFilter({
                        ...routeFilter,
                        destination: e.target.value,
                      })
                    }
                    className="w-36"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchPriceHistory}
                  >
                    <Filter className="w-4 h-4 mr-1" />
                    Filtrar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Rota
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Companhia
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Preco
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                        Data
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceHistory.map((entry) => (
                      <tr
                        key={entry.id}
                        className="border-b last:border-0 hover:bg-muted/50"
                      >
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{entry.origin}</Badge>
                            <Plane className="w-3 h-3 text-muted-foreground" />
                            <Badge variant="outline">{entry.destination}</Badge>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-sm font-medium">
                          {entry.airline}
                        </td>
                        <td className="py-3 px-2 font-semibold text-sm">
                          R$ {entry.price.toLocaleString("pt-BR")}
                        </td>
                        <td className="py-3 px-2 text-sm text-muted-foreground">
                          {new Date(entry.date).toLocaleDateString("pt-BR")}
                        </td>
                      </tr>
                    ))}
                    {priceHistory.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-8 text-center text-muted-foreground"
                        >
                          {routeFilter.origin || routeFilter.destination
                            ? "Nenhum registro encontrado para esta rota"
                            : "Filtre por uma rota para ver o historico de precos"}
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
