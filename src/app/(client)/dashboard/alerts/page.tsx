"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
  Bell,
  BellRing,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  MapPin,
  ArrowRight,
  Calendar,
  DollarSign,
  Plane,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingDown,
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

const AIRLINES = [
  { value: "all", label: "Todas as companhias" },
  { value: "LATAM", label: "LATAM" },
  { value: "GOL", label: "GOL" },
  { value: "AZUL", label: "Azul" },
];

const FREQUENCIES = [
  { value: "realtime", label: "Tempo real" },
  { value: "daily", label: "Diario" },
  { value: "weekly", label: "Semanal" },
];

interface Alert {
  id: string;
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  maxPrice: number;
  airline: string;
  frequency: string;
  active: boolean;
  createdAt: string;
}

interface AlertNotification {
  id: string;
  alertId: string;
  message: string;
  price: number;
  previousPrice: number;
  airline: string;
  createdAt: string;
  read: boolean;
}

const emptyForm = {
  origin: "",
  destination: "",
  startDate: "",
  endDate: "",
  maxPrice: "",
  airline: "all",
  frequency: "daily",
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/flights/alerts");
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
        setNotifications(data.notifications || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingAlert(null);
    setForm(emptyForm);
    setError("");
    setDialogOpen(true);
  };

  const openEditDialog = (alert: Alert) => {
    setEditingAlert(alert);
    setForm({
      origin: alert.origin,
      destination: alert.destination,
      startDate: alert.startDate,
      endDate: alert.endDate,
      maxPrice: String(alert.maxPrice),
      airline: alert.airline,
      frequency: alert.frequency,
    });
    setError("");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.origin || !form.destination || !form.startDate || !form.maxPrice) {
      setError("Preencha todos os campos obrigatorios.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        maxPrice: parseFloat(form.maxPrice),
      };

      if (editingAlert) {
        const res = await fetch(`/api/flights/alerts/${editingAlert.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
      } else {
        const res = await fetch("/api/flights/alerts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
      }
      setDialogOpen(false);
      await loadAlerts();
    } catch {
      setError("Erro ao salvar alerta. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await fetch(`/api/flights/alerts/${id}`, { method: "DELETE" });
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch {
      // silently fail
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (alert: Alert) => {
    setTogglingId(alert.id);
    try {
      const res = await fetch(`/api/flights/alerts/${alert.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !alert.active }),
      });
      if (res.ok) {
        setAlerts((prev) =>
          prev.map((a) => (a.id === alert.id ? { ...a, active: !a.active } : a))
        );
      }
    } catch {
      // silently fail
    } finally {
      setTogglingId(null);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const getFrequencyLabel = (freq: string) =>
    FREQUENCIES.find((f) => f.value === freq)?.label || freq;

  const getAirportCity = (code: string) =>
    AIRPORTS.find((a) => a.code === code)?.city || code;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600">
            <BellRing className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Alertas de Preco</h1>
            <p className="text-muted-foreground">
              Receba notificacoes quando os precos caem
            </p>
          </div>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Alerta
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-100 to-violet-200">
              <Bell className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{alerts.length}</p>
              <p className="text-sm text-muted-foreground">Alertas criados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-green-200">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {alerts.filter((a) => a.active).length}
              </p>
              <p className="text-sm text-muted-foreground">Alertas ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200">
              <TrendingDown className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{notifications.length}</p>
              <p className="text-sm text-muted-foreground">Notificacoes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Seus Alertas</h2>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          </div>
        ) : alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card
                key={alert.id}
                className={cn(
                  "hover:shadow-md transition-all border-l-4",
                  alert.active ? "border-l-green-500" : "border-l-gray-300"
                )}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Route */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-violet-500" />
                          <span className="font-bold text-lg">{alert.origin}</span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-500" />
                          <span className="font-bold text-lg">{alert.destination}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(alert.startDate).toLocaleDateString("pt-BR")}
                          {alert.endDate && (
                            <>
                              {" - "}
                              {new Date(alert.endDate).toLocaleDateString("pt-BR")}
                            </>
                          )}
                        </div>
                        <span className="text-muted-foreground/40">|</span>
                        <div className="flex items-center gap-1">
                          <Plane className="w-3.5 h-3.5" />
                          {alert.airline === "all"
                            ? "Todas as companhias"
                            : alert.airline}
                        </div>
                      </div>
                    </div>

                    {/* Price Limit */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Preco maximo</p>
                        <p className="text-xl font-bold text-violet-600">
                          {formatCurrency(alert.maxPrice)}
                        </p>
                      </div>
                    </div>

                    {/* Badges & Actions */}
                    <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap">
                      <Badge
                        variant="outline"
                        className={cn(
                          "whitespace-nowrap",
                          alert.frequency === "realtime"
                            ? "border-violet-200 bg-violet-50 text-violet-700"
                            : alert.frequency === "daily"
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : "border-gray-200 bg-gray-50 text-gray-700"
                        )}
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        {getFrequencyLabel(alert.frequency)}
                      </Badge>

                      <Button
                        size="sm"
                        variant="ghost"
                        className={cn(
                          "gap-1",
                          alert.active
                            ? "text-green-600 hover:text-green-700"
                            : "text-gray-400 hover:text-gray-500"
                        )}
                        disabled={togglingId === alert.id}
                        onClick={() => handleToggle(alert)}
                      >
                        {togglingId === alert.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : alert.active ? (
                          <ToggleRight className="w-5 h-5" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                        {alert.active ? "Ativo" : "Inativo"}
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-muted-foreground hover:text-violet-600"
                        onClick={() => openEditDialog(alert)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-muted-foreground hover:text-red-600"
                        disabled={deletingId === alert.id}
                        onClick={() => handleDelete(alert.id)}
                      >
                        {deletingId === alert.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="font-semibold text-lg mb-2">Nenhum alerta criado</h3>
            <p className="text-muted-foreground mb-4">
              Crie um alerta para ser notificado quando os precos caem.
            </p>
            <Button
              onClick={openCreateDialog}
              className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Alerta
            </Button>
          </Card>
        )}
      </div>

      {/* Notifications History */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Historico de Notificacoes</h2>
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <Card
                key={notif.id}
                className={cn(
                  "hover:shadow-sm transition-all",
                  !notif.read && "bg-violet-50/50 border-violet-200"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg mt-0.5 shrink-0",
                        notif.price < notif.previousPrice
                          ? "bg-green-100"
                          : "bg-orange-100"
                      )}
                    >
                      {notif.price < notif.previousPrice ? (
                        <TrendingDown className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-orange-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notif.message}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-green-600 font-semibold">
                          {formatCurrency(notif.price)}
                        </span>
                        {notif.previousPrice > 0 && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatCurrency(notif.previousPrice)}
                          </span>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {notif.airline}
                        </Badge>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(notif.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <BellRing className="w-10 h-10 mx-auto text-muted-foreground mb-3 opacity-50" />
            <p className="text-muted-foreground">
              Nenhuma notificacao ainda. Crie alertas para comecar a receber.
            </p>
          </Card>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingAlert ? "Editar Alerta" : "Novo Alerta de Preco"}
            </DialogTitle>
            <DialogDescription>
              {editingAlert
                ? "Altere as configuracoes do seu alerta."
                : "Configure um alerta para monitorar precos de voos."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Origem *</Label>
                <Select
                  value={form.origin}
                  onValueChange={(v) => setForm({ ...form, origin: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Origem" />
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
                <Label>Destino *</Label>
                <Select
                  value={form.destination}
                  onValueChange={(v) => setForm({ ...form, destination: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Destino" />
                  </SelectTrigger>
                  <SelectContent>
                    {AIRPORTS.filter((a) => a.code !== form.origin).map((a) => (
                      <SelectItem key={a.code} value={a.code}>
                        {a.code} - {a.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data inicio *</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <Label>Data fim</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  min={form.startDate || new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preco maximo (R$) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="1500.00"
                  value={form.maxPrice}
                  onChange={(e) => setForm({ ...form, maxPrice: e.target.value })}
                  className="pl-10"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Companhia aerea</Label>
                <Select
                  value={form.airline}
                  onValueChange={(v) => setForm({ ...form, airline: v })}
                >
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
              <div className="space-y-2">
                <Label>Frequencia</Label>
                <Select
                  value={form.frequency}
                  onValueChange={(v) => setForm({ ...form, frequency: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
              ) : editingAlert ? (
                "Salvar Alteracoes"
              ) : (
                "Criar Alerta"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
