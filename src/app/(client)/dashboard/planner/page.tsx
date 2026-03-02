"use client";

import { useState } from "react";
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
  MapPinned,
  Plane,
  Hotel,
  Calculator,
  Loader2,
  DollarSign,
  Calendar,
  Sparkles,
  TrendingDown,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Target,
  AlertCircle,
  Coins,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DESTINATIONS = [
  { value: "sao-paulo", label: "Sao Paulo", avgFlight: 450, avgHotel: 280, avgMiles: 15000 },
  { value: "rio-de-janeiro", label: "Rio de Janeiro", avgFlight: 500, avgHotel: 320, avgMiles: 18000 },
  { value: "salvador", label: "Salvador", avgFlight: 600, avgHotel: 250, avgMiles: 20000 },
  { value: "florianopolis", label: "Florianopolis", avgFlight: 480, avgHotel: 300, avgMiles: 16000 },
  { value: "fortaleza", label: "Fortaleza", avgFlight: 650, avgHotel: 220, avgMiles: 22000 },
  { value: "recife", label: "Recife", avgFlight: 620, avgHotel: 240, avgMiles: 21000 },
  { value: "porto-seguro", label: "Porto Seguro", avgFlight: 550, avgHotel: 200, avgMiles: 18000 },
  { value: "gramado", label: "Gramado", avgFlight: 420, avgHotel: 350, avgMiles: 14000 },
  { value: "buenos-aires", label: "Buenos Aires", avgFlight: 1200, avgHotel: 180, avgMiles: 30000 },
  { value: "santiago", label: "Santiago", avgFlight: 1400, avgHotel: 200, avgMiles: 35000 },
  { value: "lisboa", label: "Lisboa", avgFlight: 3500, avgHotel: 400, avgMiles: 80000 },
  { value: "paris", label: "Paris", avgFlight: 4200, avgHotel: 500, avgMiles: 90000 },
  { value: "orlando", label: "Orlando", avgFlight: 2800, avgHotel: 350, avgMiles: 55000 },
  { value: "miami", label: "Miami", avgFlight: 2600, avgHotel: 400, avgMiles: 50000 },
];

const AIRLINES = [
  { value: "any", label: "Qualquer companhia" },
  { value: "latam", label: "LATAM" },
  { value: "gol", label: "GOL" },
  { value: "azul", label: "Azul" },
];

interface PlanResult {
  destination: string;
  destinationLabel: string;
  days: number;
  flightCostBRL: number;
  hotelCostBRL: number;
  totalBRL: number;
  flightMiles: number;
  hotelTaxesBRL: number;
  totalMilesRoute: number;
  vpmEstimate: number;
  savingsPercent: number;
  withinBudget: boolean;
  tips: string[];
}

export default function PlannerPage() {
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [airline, setAirline] = useState("any");
  const [travelers, setTravelers] = useState("1");
  const [result, setResult] = useState<PlanResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState("");

  const handlePlan = () => {
    if (!destination || !startDate || !endDate || !budget) {
      setError("Preencha todos os campos obrigatorios.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      setError("A data de volta deve ser posterior a data de ida.");
      return;
    }

    setError("");
    setCalculating(true);

    // Client-side simulation
    setTimeout(() => {
      const dest = DESTINATIONS.find((d) => d.value === destination);
      if (!dest) {
        setError("Destino nao encontrado.");
        setCalculating(false);
        return;
      }

      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const travelersNum = parseInt(travelers);
      const budgetNum = parseFloat(budget);

      // Simulate price variation based on airline
      const airlineMultiplier =
        airline === "latam" ? 1.05 : airline === "gol" ? 0.95 : airline === "azul" ? 0.98 : 1.0;

      // Simulate seasonal variation
      const month = start.getMonth();
      const seasonMultiplier =
        month >= 11 || month <= 1 ? 1.3 : month >= 6 && month <= 7 ? 1.15 : 1.0;

      const flightCostBRL =
        Math.round(dest.avgFlight * airlineMultiplier * seasonMultiplier * travelersNum);
      const hotelCostBRL = Math.round(dest.avgHotel * days * seasonMultiplier);
      const totalBRL = flightCostBRL + hotelCostBRL;

      const flightMiles = Math.round(dest.avgMiles * travelersNum * seasonMultiplier);
      const hotelTaxesBRL = Math.round(flightCostBRL * 0.15);
      const totalMilesRoute = flightMiles;

      const vpmEstimate =
        flightMiles > 0 ? flightCostBRL / (flightMiles / 1000) : 0;

      const savingsPercent =
        totalBRL > 0
          ? Math.round(((totalBRL - hotelTaxesBRL - hotelCostBRL) / totalBRL) * 100)
          : 0;

      const tips: string[] = [];

      if (vpmEstimate < 20) {
        tips.push(
          "O VPM estimado esta excelente! Usar milhas para o voo e uma otima opcao."
        );
      } else if (vpmEstimate < 30) {
        tips.push(
          "VPM razoavel. Considere buscar promocoes de milhas antes de emitir."
        );
      } else {
        tips.push(
          "VPM alto. Pode ser mais vantajoso pagar o voo em dinheiro e guardar as milhas."
        );
      }

      if (seasonMultiplier > 1.1) {
        tips.push(
          "Voce esta viajando em alta temporada. Precos e milhas necessarias sao maiores."
        );
      }

      if (days > 7) {
        tips.push(
          "Para estadias longas, considere alugar um apartamento por temporada para economizar."
        );
      }

      tips.push(
        "Acumule milhas no cartao de credito pagando a hospedagem para maximizar seus pontos."
      );

      if (travelersNum > 2) {
        tips.push(
          "Para grupos maiores, verifique se existem tarifas de grupo ou quartos familiares."
        );
      }

      setResult({
        destination: destination,
        destinationLabel: dest.label,
        days,
        flightCostBRL,
        hotelCostBRL,
        totalBRL,
        flightMiles,
        hotelTaxesBRL,
        totalMilesRoute,
        vpmEstimate,
        savingsPercent,
        withinBudget: totalBRL <= budgetNum,
        tips,
      });
      setCalculating(false);
    }, 1200);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("pt-BR").format(value);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600">
          <MapPinned className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Planejador de Viagem</h1>
          <p className="text-muted-foreground">
            Planeje sua viagem e compare opcoes com milhas e dinheiro
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Planning Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-violet-500" />
                Dados da Viagem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Destino *</Label>
                <Select value={destination} onValueChange={setDestination}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o destino" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__domestic" disabled>
                      -- Nacional --
                    </SelectItem>
                    {DESTINATIONS.filter((d) =>
                      ["sao-paulo", "rio-de-janeiro", "salvador", "florianopolis", "fortaleza", "recife", "porto-seguro", "gramado"].includes(d.value)
                    ).map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="__international" disabled>
                      -- Internacional --
                    </SelectItem>
                    {DESTINATIONS.filter((d) =>
                      ["buenos-aires", "santiago", "lisboa", "paris", "orlando", "miami"].includes(d.value)
                    ).map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Data de Ida *</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data de Volta *</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Orcamento Total (R$) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="5.000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="pl-10"
                    min="0"
                    step="100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Viajantes</Label>
                <Select value={travelers} onValueChange={setTravelers}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} {n === 1 ? "pessoa" : "pessoas"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Companhia Preferida</Label>
                <Select value={airline} onValueChange={setAirline}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AIRLINES.map((a) => (
                      <SelectItem key={a.value} value={a.value}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <Button
                onClick={handlePlan}
                disabled={calculating}
                className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white"
              >
                {calculating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Calculando...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    Planejar Viagem
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {result ? (
            <>
              {/* Destination Header */}
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-violet-600 to-blue-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-80">Sua viagem para</p>
                      <h2 className="text-3xl font-bold">{result.destinationLabel}</h2>
                      <p className="text-sm opacity-80 mt-1">
                        {result.days} {result.days === 1 ? "dia" : "dias"} | {travelers}{" "}
                        {parseInt(travelers) === 1 ? "viajante" : "viajantes"}
                      </p>
                    </div>
                    <Badge
                      className={cn(
                        "text-sm px-3 py-1",
                        result.withinBudget
                          ? "bg-green-500/20 text-green-100 border-green-400/30"
                          : "bg-red-500/20 text-red-100 border-red-400/30"
                      )}
                    >
                      {result.withinBudget ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Dentro do orcamento
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Acima do orcamento
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Cost Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-violet-100">
                        <Plane className="w-5 h-5 text-violet-600" />
                      </div>
                      <span className="text-sm text-muted-foreground">Voo (estimativa)</span>
                    </div>
                    <p className="text-2xl font-bold text-violet-600">
                      {formatCurrency(result.flightCostBRL)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ou {formatNumber(result.flightMiles)} milhas + taxas
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <Hotel className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Hotel ({result.days} noites)
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(result.hotelCostBRL)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ~{formatCurrency(result.hotelCostBRL / result.days)} por noite
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-violet-50 to-blue-50 border-violet-200">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-violet-200">
                        <DollarSign className="w-5 h-5 text-violet-700" />
                      </div>
                      <span className="text-sm font-medium text-violet-700">Total Estimado</span>
                    </div>
                    <p className="text-2xl font-bold text-violet-700">
                      {formatCurrency(result.totalBRL)}
                    </p>
                    {budget && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Orcamento</span>
                          <span className="text-muted-foreground">
                            {Math.round((result.totalBRL / parseFloat(budget)) * 100)}%
                          </span>
                        </div>
                        <Progress
                          value={Math.min(
                            (result.totalBRL / parseFloat(budget)) * 100,
                            100
                          )}
                          className="h-1.5"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Comparison: BRL vs Miles */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-violet-500" />
                    Comparativo: Dinheiro vs Milhas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* BRL Route */}
                    <div className="p-5 rounded-xl border-2 border-gray-200 bg-gray-50">
                      <div className="flex items-center gap-2 mb-4">
                        <CreditCard className="w-5 h-5 text-gray-600" />
                        <h3 className="font-semibold text-gray-700">Pagando em R$</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Voo</span>
                          <span className="font-medium">{formatCurrency(result.flightCostBRL)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Hotel</span>
                          <span className="font-medium">{formatCurrency(result.hotelCostBRL)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="font-semibold">Total</span>
                          <span className="text-xl font-bold">{formatCurrency(result.totalBRL)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Miles Route */}
                    <div className="p-5 rounded-xl border-2 border-violet-200 bg-violet-50">
                      <div className="flex items-center gap-2 mb-4">
                        <Coins className="w-5 h-5 text-violet-600" />
                        <h3 className="font-semibold text-violet-700">Usando Milhas</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Voo (milhas)</span>
                          <span className="font-medium">
                            {formatNumber(result.flightMiles)} mi
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Taxas do voo</span>
                          <span className="font-medium">
                            {formatCurrency(result.hotelTaxesBRL)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Hotel (R$)</span>
                          <span className="font-medium">{formatCurrency(result.hotelCostBRL)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="font-semibold">Custo em R$</span>
                          <span className="text-xl font-bold text-violet-700">
                            {formatCurrency(result.hotelTaxesBRL + result.hotelCostBRL)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">+ Milhas</span>
                          <Badge className="bg-violet-100 text-violet-700 border-violet-200">
                            {formatNumber(result.flightMiles)} milhas
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* VPM Info */}
                  <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">VPM Estimado:</span>
                        <Badge
                          className={cn(
                            "text-xs",
                            result.vpmEstimate < 15
                              ? "bg-green-100 text-green-700"
                              : result.vpmEstimate < 25
                              ? "bg-yellow-100 text-yellow-700"
                              : result.vpmEstimate < 35
                              ? "bg-orange-100 text-orange-700"
                              : "bg-red-100 text-red-700"
                          )}
                        >
                          R$ {result.vpmEstimate.toFixed(2)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingDown className="w-4 h-4 text-green-600" />
                        <span className="text-green-600 font-medium">
                          Economia de ~{result.savingsPercent}% usando milhas
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    Dicas para sua Viagem
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.tips.map((tip, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100"
                      >
                        <CheckCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-800">{tip}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="p-12 text-center h-full flex flex-col items-center justify-center min-h-[400px]">
              <div className="p-4 rounded-full bg-violet-100 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <MapPinned className="w-10 h-10 text-violet-600" />
              </div>
              <h3 className="font-semibold text-xl mb-2">Planeje sua Viagem</h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                Preencha os dados da sua viagem e veja estimativas de custos, comparacoes
                entre milhas e dinheiro, e dicas uteis.
              </p>
              <div className="grid grid-cols-3 gap-4 max-w-sm">
                <div className="text-center">
                  <div className="p-2 rounded-lg bg-violet-50 w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-violet-500" />
                  </div>
                  <p className="text-xs text-muted-foreground">Estimativas de custo</p>
                </div>
                <div className="text-center">
                  <div className="p-2 rounded-lg bg-blue-50 w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-xs text-muted-foreground">Comparativo R$ vs Milhas</p>
                </div>
                <div className="text-center">
                  <div className="p-2 rounded-lg bg-amber-50 w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                  </div>
                  <p className="text-xs text-muted-foreground">Dicas personalizadas</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
