"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  HelpCircle,
  Loader2,
  History,
  Trash2,
  DollarSign,
  Sparkles,
  Lightbulb,
  ArrowRight,
  Info,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VpmResult {
  vpm: number;
  rating: "excelente" | "bom" | "regular" | "ruim";
  price: number;
  miles: number;
}

interface HistoryEntry extends VpmResult {
  id: string;
  calculatedAt: string;
}

function getVpmRating(vpm: number): VpmResult["rating"] {
  if (vpm < 15) return "excelente";
  if (vpm < 25) return "bom";
  if (vpm < 35) return "regular";
  return "ruim";
}

function getRatingConfig(rating: VpmResult["rating"]) {
  switch (rating) {
    case "excelente":
      return {
        label: "Excelente",
        color: "bg-green-100 text-green-700 border-green-200",
        gradient: "from-green-500 to-emerald-500",
        textColor: "text-green-600",
        description:
          "Otimo custo-beneficio! Voce esta obtendo um excelente valor por milha. Esta e uma oferta que vale a pena aproveitar.",
      };
    case "bom":
      return {
        label: "Bom",
        color: "bg-yellow-100 text-yellow-700 border-yellow-200",
        gradient: "from-yellow-500 to-amber-500",
        textColor: "text-yellow-600",
        description:
          "Bom custo-beneficio. O valor por milha esta dentro de uma faixa aceitavel para a maioria dos programas.",
      };
    case "regular":
      return {
        label: "Regular",
        color: "bg-orange-100 text-orange-700 border-orange-200",
        gradient: "from-orange-500 to-red-400",
        textColor: "text-orange-600",
        description:
          "Valor mediano. Considere buscar promocoes ou usar outro programa de milhas para obter melhor valor.",
      };
    case "ruim":
      return {
        label: "Ruim",
        color: "bg-red-100 text-red-700 border-red-200",
        gradient: "from-red-500 to-red-600",
        textColor: "text-red-600",
        description:
          "Custo-beneficio baixo. Recomendamos pagar em dinheiro ou esperar uma promocao melhor de milhas.",
      };
  }
}

export default function VpmPage() {
  const [price, setPrice] = useState("");
  const [miles, setMiles] = useState("");
  const [result, setResult] = useState<VpmResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [error, setError] = useState("");

  const handleCalculate = async () => {
    const priceNum = parseFloat(price);
    const milesNum = parseFloat(miles);

    if (!priceNum || priceNum <= 0) {
      setError("Informe um preco valido.");
      return;
    }
    if (!milesNum || milesNum <= 0) {
      setError("Informe a quantidade de milhas.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/vpm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: priceNum, miles: milesNum }),
      });

      if (res.ok) {
        const data = await res.json();
        const vpmResult: VpmResult = {
          vpm: data.vpm ?? priceNum / (milesNum / 1000),
          rating: data.rating ?? getVpmRating(priceNum / (milesNum / 1000)),
          price: priceNum,
          miles: milesNum,
        };
        setResult(vpmResult);

        const entry: HistoryEntry = {
          ...vpmResult,
          id: crypto.randomUUID(),
          calculatedAt: new Date().toISOString(),
        };
        setHistory((prev) => [entry, ...prev].slice(0, 20));
      } else {
        // Fallback: calculate client-side
        const vpm = priceNum / (milesNum / 1000);
        const vpmResult: VpmResult = {
          vpm,
          rating: getVpmRating(vpm),
          price: priceNum,
          miles: milesNum,
        };
        setResult(vpmResult);

        const entry: HistoryEntry = {
          ...vpmResult,
          id: crypto.randomUUID(),
          calculatedAt: new Date().toISOString(),
        };
        setHistory((prev) => [entry, ...prev].slice(0, 20));
      }
    } catch {
      // Fallback: calculate client-side
      const vpm = priceNum / (milesNum / 1000);
      const vpmResult: VpmResult = {
        vpm,
        rating: getVpmRating(vpm),
        price: priceNum,
        miles: milesNum,
      };
      setResult(vpmResult);

      const entry: HistoryEntry = {
        ...vpmResult,
        id: crypto.randomUUID(),
        calculatedAt: new Date().toISOString(),
      };
      setHistory((prev) => [entry, ...prev].slice(0, 20));
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => setHistory([]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("pt-BR").format(value);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Calculadora VPM</h1>
            <p className="text-muted-foreground">
              Calcule o Valor por Milha e descubra se a oferta vale a pena
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calculator */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-violet-500" />
                  Calcular VPM
                </CardTitle>
                <CardDescription>
                  O VPM (Valor por Mil milhas) indica quanto voce esta pagando para cada 1.000 milhas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-violet-500" />
                      Preco da Passagem (R$)
                    </Label>
                    <Input
                      type="number"
                      placeholder="1.500,00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      min="0"
                      step="0.01"
                      className="text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      Quantidade de Milhas
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Quantidade de milhas necessarias para emitir a passagem</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Input
                      type="number"
                      placeholder="50.000"
                      value={miles}
                      onChange={(e) => setMiles(e.target.value)}
                      min="0"
                      className="text-lg"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                    <Info className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleCalculate}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white h-12 text-base"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Calculando...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-5 h-5 mr-2" />
                      Calcular VPM
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Result */}
            {result && (
              <Card className="overflow-hidden">
                <div
                  className={cn(
                    "bg-gradient-to-r p-6 text-white",
                    `${getRatingConfig(result.rating).gradient}`
                  )}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold opacity-90">Resultado</h3>
                    <Badge className="bg-white/20 text-white border-0 text-sm">
                      {getRatingConfig(result.rating).label}
                    </Badge>
                  </div>
                  <div className="text-center py-4">
                    <p className="text-sm opacity-80 mb-1">Valor por Mil Milhas</p>
                    <p className="text-6xl font-bold mb-1">
                      R$ {result.vpm.toFixed(2)}
                    </p>
                    <p className="text-sm opacity-80">
                      {formatCurrency(result.price)} / {formatNumber(result.miles)} milhas
                    </p>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg shrink-0",
                        result.rating === "excelente" || result.rating === "bom"
                          ? "bg-green-100"
                          : "bg-orange-100"
                      )}
                    >
                      {result.rating === "excelente" || result.rating === "bom" ? (
                        <TrendingDown className="w-5 h-5 text-green-600" />
                      ) : (
                        <TrendingUp className="w-5 h-5 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium mb-1">Analise</p>
                      <p className="text-sm text-muted-foreground">
                        {getRatingConfig(result.rating).description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  Dicas sobre VPM
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-100">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-green-700">&lt;15</span>
                    </div>
                    <div>
                      <p className="font-medium text-green-700">Excelente</p>
                      <p className="text-xs text-green-600">
                        Otima oportunidade! Compre milhas ou emita passagens nessa faixa sempre que possivel.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-50 border border-yellow-100">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-yellow-700">15-25</span>
                    </div>
                    <div>
                      <p className="font-medium text-yellow-700">Bom</p>
                      <p className="text-xs text-yellow-600">
                        Valor aceitavel para programas como LATAM Pass e Smiles em voos domesticos.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg bg-orange-50 border border-orange-100">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-orange-700">25-35</span>
                    </div>
                    <div>
                      <p className="font-medium text-orange-700">Regular</p>
                      <p className="text-xs text-orange-600">
                        Valor mediano. Considere pagar em dinheiro ou buscar outra disponibilidade.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-100">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-red-700">&gt;35</span>
                    </div>
                    <div>
                      <p className="font-medium text-red-700">Ruim</p>
                      <p className="text-xs text-red-600">
                        Evite usar milhas nesse VPM. Pagar em dinheiro sera mais vantajoso.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* History Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <History className="w-5 h-5 text-violet-500" />
                    Historico
                  </CardTitle>
                  {history.length > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-red-500 h-8"
                      onClick={clearHistory}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Limpar
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {history.length > 0 ? (
                  <div className="space-y-3">
                    {history.map((entry) => {
                      const config = getRatingConfig(entry.rating);
                      return (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => {
                            setPrice(String(entry.price));
                            setMiles(String(entry.miles));
                            setResult(entry);
                          }}
                        >
                          <div>
                            <p className="font-semibold text-sm">
                              R$ {entry.vpm.toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(entry.price)} / {formatNumber(entry.miles)}mi
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge className={cn("text-xs", config.color)}>
                              {config.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(entry.calculatedAt).toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <History className="w-10 h-10 mx-auto text-muted-foreground mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground">
                      Seus calculos aparecerão aqui
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Formula Card */}
            <Card className="bg-gradient-to-br from-violet-50 to-blue-50 border-violet-200">
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm text-violet-700 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Como calculamos?
                </h4>
                <div className="bg-white/80 p-3 rounded-lg border border-violet-100">
                  <p className="text-center font-mono text-sm">
                    VPM = Preco / (Milhas / 1.000)
                  </p>
                </div>
                <p className="text-xs text-violet-600 mt-2">
                  O VPM indica quanto voce paga a cada 1.000 milhas. Quanto menor, melhor o
                  custo-beneficio da emissao.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
