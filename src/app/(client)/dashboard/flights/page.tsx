"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plane,
  Search,
  Clock,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  SortAsc,
  Loader2,
  MapPin,
  Calendar,
  Users,
  Star,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const AIRPORTS = [
  { code: "GRU", city: "Sao Paulo (Guarulhos)" },
  { code: "GIG", city: "Rio de Janeiro (Galeao)" },
  { code: "BSB", city: "Brasilia" },
  { code: "CNF", city: "Belo Horizonte (Confins)" },
  { code: "SSA", city: "Salvador" },
  { code: "REC", city: "Recife" },
  { code: "CWB", city: "Curitiba" },
  { code: "POA", city: "Porto Alegre" },
  { code: "FOR", city: "Fortaleza" },
];

const CABIN_CLASSES = [
  { value: "economy", label: "Economica" },
  { value: "business", label: "Executiva" },
  { value: "first", label: "Primeira Classe" },
];

interface FlightResult {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  price: number;
  miles: number;
  vpm: number;
  cabin: string;
}

interface SavedFlight {
  id: string;
  flight: FlightResult;
  savedAt: string;
}

function getVpmColor(vpm: number): string {
  if (vpm < 15) return "bg-green-100 text-green-700 border-green-200";
  if (vpm < 25) return "bg-yellow-100 text-yellow-700 border-yellow-200";
  if (vpm < 35) return "bg-orange-100 text-orange-700 border-orange-200";
  return "bg-red-100 text-red-700 border-red-200";
}

function getVpmLabel(vpm: number): string {
  if (vpm < 15) return "Excelente";
  if (vpm < 25) return "Bom";
  if (vpm < 35) return "Regular";
  return "Ruim";
}

export default function FlightsPage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [cabinClass, setCabinClass] = useState("economy");
  const [results, setResults] = useState<FlightResult[]>([]);
  const [savedFlights, setSavedFlights] = useState<SavedFlight[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [sortBy, setSortBy] = useState<"price" | "miles" | "vpm" | "duration">("price");
  const [searched, setSearched] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("search");

  useEffect(() => {
    loadSavedFlights();
  }, []);

  const loadSavedFlights = async () => {
    setLoadingSaved(true);
    try {
      const res = await fetch("/api/flights/saved");
      if (res.ok) {
        const data = await res.json();
        setSavedFlights(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingSaved(false);
    }
  };

  const handleSearch = async () => {
    if (!origin || !destination || !departureDate) {
      setError("Preencha origem, destino e data de ida.");
      return;
    }
    if (origin === destination) {
      setError("Origem e destino devem ser diferentes.");
      return;
    }
    setError("");
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch("/api/flights/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin,
          destination,
          departureDate,
          returnDate: returnDate || undefined,
          passengers: parseInt(passengers),
          cabinClass,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data.flights || data || []);
      } else {
        setResults([]);
        setError("Erro ao buscar voos. Tente novamente.");
      }
    } catch {
      setResults([]);
      setError("Erro de conexao. Verifique sua internet.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFlight = async (flight: FlightResult) => {
    setSavingId(flight.id);
    try {
      const res = await fetch("/api/flights/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flight }),
      });
      if (res.ok) {
        await loadSavedFlights();
      }
    } catch {
      // silently fail
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteSaved = async (id: string) => {
    try {
      await fetch(`/api/flights/saved?id=${id}`, { method: "DELETE" });
      setSavedFlights((prev) => prev.filter((s) => s.id !== id));
    } catch {
      // silently fail
    }
  };

  const isFlightSaved = (flightId: string) =>
    savedFlights.some((s) => s.flight.id === flightId);

  const sortedResults = [...results].sort((a, b) => {
    switch (sortBy) {
      case "price":
        return a.price - b.price;
      case "miles":
        return a.miles - b.miles;
      case "vpm":
        return a.vpm - b.vpm;
      case "duration":
        return a.duration.localeCompare(b.duration);
      default:
        return 0;
    }
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("pt-BR").format(value);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600">
            <Plane className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Busca de Voos</h1>
            <p className="text-muted-foreground">
              Encontre as melhores opcoes em passagens e milhas
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search" className="gap-2">
            <Search className="w-4 h-4" />
            Buscar Voos
          </TabsTrigger>
          <TabsTrigger value="saved" className="gap-2">
            <Bookmark className="w-4 h-4" />
            Voos Salvos
            {savedFlights.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {savedFlights.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          {/* Search Form */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-violet-500" />
                    Origem
                  </Label>
                  <Select value={origin} onValueChange={setOrigin}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a origem" />
                    </SelectTrigger>
                    <SelectContent>
                      {AIRPORTS.map((a) => (
                        <SelectItem key={a.code} value={a.code}>
                          {a.code} - {a.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    Destino
                  </Label>
                  <Select value={destination} onValueChange={setDestination}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o destino" />
                    </SelectTrigger>
                    <SelectContent>
                      {AIRPORTS.filter((a) => a.code !== origin).map((a) => (
                        <SelectItem key={a.code} value={a.code}>
                          {a.code} - {a.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-violet-500" />
                    Data de Ida
                  </Label>
                  <Input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    Data de Volta (opcional)
                  </Label>
                  <Input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    min={departureDate || new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-violet-500" />
                    Passageiros
                  </Label>
                  <Select value={passengers} onValueChange={setPassengers}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} {n === 1 ? "passageiro" : "passageiros"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-blue-500" />
                    Classe
                  </Label>
                  <Select value={cabinClass} onValueChange={setCabinClass}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CABIN_CLASSES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <Button
                onClick={handleSearch}
                disabled={loading}
                className="w-full mt-6 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white h-12 text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Buscando voos...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Buscar Voos
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Sort Options */}
          {results.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {results.length} {results.length === 1 ? "voo encontrado" : "voos encontrados"}
              </p>
              <div className="flex items-center gap-2">
                <SortAsc className="w-4 h-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price">Preco</SelectItem>
                    <SelectItem value="miles">Milhas</SelectItem>
                    <SelectItem value="vpm">VPM</SelectItem>
                    <SelectItem value="duration">Duracao</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Results */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/3" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-5 bg-muted rounded w-24" />
                        <div className="h-3 bg-muted rounded w-16" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sortedResults.length > 0 ? (
            <div className="space-y-4">
              {sortedResults.map((flight) => (
                <Card
                  key={flight.id}
                  className="hover:shadow-lg transition-all border-l-4 border-l-violet-500"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Airline Info */}
                      <div className="flex items-center gap-3 lg:w-48">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-100 to-blue-100 flex items-center justify-center shrink-0">
                          <Plane className="w-6 h-6 text-violet-600" />
                        </div>
                        <div>
                          <p className="font-semibold">{flight.airline}</p>
                          <p className="text-xs text-muted-foreground">{flight.flightNumber}</p>
                        </div>
                      </div>

                      {/* Flight Route */}
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-lg font-bold">{flight.departureTime}</p>
                            <p className="text-xs text-muted-foreground">{flight.origin}</p>
                          </div>
                          <div className="flex-1 flex items-center gap-2 px-2">
                            <div className="w-2 h-2 rounded-full bg-violet-400" />
                            <div className="flex-1 border-t-2 border-dashed border-violet-200 relative">
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {flight.duration}
                              </div>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-blue-400" />
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold">{flight.arrivalTime}</p>
                            <p className="text-xs text-muted-foreground">{flight.destination}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {flight.stops === 0
                              ? "Direto"
                              : `${flight.stops} ${flight.stops === 1 ? "parada" : "paradas"}`}
                          </Badge>
                          <Badge variant="outline" className="text-xs capitalize">
                            {CABIN_CLASSES.find((c) => c.value === flight.cabin)?.label || flight.cabin}
                          </Badge>
                        </div>
                      </div>

                      {/* Price Info */}
                      <div className="flex flex-col items-end gap-2 lg:w-48">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-violet-600">
                            {formatCurrency(flight.price)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ou {formatNumber(flight.miles)} milhas
                          </p>
                        </div>
                        <Badge className={cn("text-xs", getVpmColor(flight.vpm))}>
                          VPM: R$ {flight.vpm.toFixed(2)} - {getVpmLabel(flight.vpm)}
                        </Badge>
                        <Button
                          size="sm"
                          variant={isFlightSaved(flight.id) ? "secondary" : "outline"}
                          onClick={() => handleSaveFlight(flight)}
                          disabled={savingId === flight.id || isFlightSaved(flight.id)}
                          className="gap-1"
                        >
                          {savingId === flight.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : isFlightSaved(flight.id) ? (
                            <BookmarkCheck className="w-4 h-4" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                          {isFlightSaved(flight.id) ? "Salvo" : "Salvar"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : searched && !loading ? (
            <Card className="p-12 text-center">
              <Plane className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="font-semibold text-lg mb-2">Nenhum voo encontrado</h3>
              <p className="text-muted-foreground">
                Tente alterar as datas ou aeroportos da sua busca.
              </p>
            </Card>
          ) : null}
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          {loadingSaved ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            </div>
          ) : savedFlights.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground">
                {savedFlights.length} {savedFlights.length === 1 ? "voo salvo" : "voos salvos"}
              </p>
              {savedFlights.map((saved) => (
                <Card
                  key={saved.id}
                  className="hover:shadow-md transition-all border-l-4 border-l-blue-500"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex items-center gap-3 lg:w-48">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center shrink-0">
                          <Plane className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold">{saved.flight.airline}</p>
                          <p className="text-xs text-muted-foreground">
                            {saved.flight.flightNumber}
                          </p>
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-bold">{saved.flight.origin}</span>
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          <span className="font-bold">{saved.flight.destination}</span>
                          <span className="text-sm text-muted-foreground">
                            | {saved.flight.departureTime} - {saved.flight.arrivalTime}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Salvo em{" "}
                          {new Date(saved.savedAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-violet-600">
                            {formatCurrency(saved.flight.price)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatNumber(saved.flight.miles)} milhas
                          </p>
                        </div>
                        <Badge className={cn("text-xs", getVpmColor(saved.flight.vpm))}>
                          VPM: R$ {saved.flight.vpm.toFixed(2)}
                        </Badge>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteSaved(saved.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <Card className="p-12 text-center">
              <Bookmark className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="font-semibold text-lg mb-2">Nenhum voo salvo</h3>
              <p className="text-muted-foreground">
                Salve voos da busca para acompanhar depois.
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
