"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Plane, MapPin } from "lucide-react";

interface Trip {
  id: string;
  destination: string;
  description: string;
  images: string[];
  hotel: string | null;
  airline: string | null;
  pointsCost: number;
  spots: number;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<Trip | null>(null);
  const [form, setForm] = useState({
    destination: "", description: "", images: "", hotel: "",
    airline: "", pointsCost: "0", spots: "0", startDate: "", endDate: "",
  });

  const fetchTrips = async () => {
    try {
      const res = await fetch("/api/admin/trips");
      const data = await res.json();
      setTrips(data);
    } catch { setTrips([]); }
  };

  useEffect(() => { fetchTrips(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ destination: "", description: "", images: "", hotel: "", airline: "", pointsCost: "0", spots: "0", startDate: "", endDate: "" });
    setDialog(true);
  };

  const openEdit = (trip: Trip) => {
    setEditing(trip);
    setForm({
      destination: trip.destination, description: trip.description,
      images: trip.images.join("\n"), hotel: trip.hotel || "",
      airline: trip.airline || "", pointsCost: String(trip.pointsCost),
      spots: String(trip.spots),
      startDate: trip.startDate ? trip.startDate.split("T")[0] : "",
      endDate: trip.endDate ? trip.endDate.split("T")[0] : "",
    });
    setDialog(true);
  };

  const handleSubmit = async () => {
    const url = editing ? `/api/admin/trips/${editing.id}` : "/api/admin/trips";
    const method = editing ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        images: form.images.split("\n").filter(Boolean),
        pointsCost: parseInt(form.pointsCost),
        spots: parseInt(form.spots),
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      }),
    });
    setDialog(false);
    fetchTrips();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza?")) return;
    await fetch(`/api/admin/trips/${id}`, { method: "DELETE" });
    fetchTrips();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Viagens</h1>
          <p className="text-muted-foreground">Cadastre pacotes de viagem</p>
        </div>
        <Button onClick={openNew} className="gradient-primary text-white">
          <Plus className="w-4 h-4 mr-2" /> Nova Viagem
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.map((trip) => (
          <Card key={trip.id} className="overflow-hidden">
            <div className="h-48 bg-muted flex items-center justify-center relative">
              {trip.images[0] ? (
                <img src={trip.images[0]} alt={trip.destination} className="w-full h-full object-cover" />
              ) : (
                <Plane className="w-12 h-12 text-muted-foreground" />
              )}
              <Badge className="absolute top-3 left-3 bg-white/90 text-foreground">
                {trip.spots} vagas
              </Badge>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <MapPin className="w-4 h-4 text-violet-500" /> {trip.destination}
              </h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{trip.description}</p>
              {trip.hotel && <p className="text-xs text-muted-foreground">Hotel: {trip.hotel}</p>}
              {trip.airline && <p className="text-xs text-muted-foreground">Aérea: {trip.airline}</p>}
              <div className="flex items-center justify-between mt-3 mb-4">
                <span className="font-bold text-violet-600">{trip.pointsCost.toLocaleString("pt-BR")} pts</span>
                <Badge variant={trip.isActive ? "default" : "secondary"}>
                  {trip.isActive ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(trip)}>
                  <Edit className="w-3 h-3 mr-1" /> Editar
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(trip.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {trips.length === 0 && (
        <Card className="p-12 text-center">
          <Plane className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">Nenhuma viagem cadastrada</h3>
          <Button onClick={openNew}>Criar Primeira Viagem</Button>
        </Card>
      )}

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Viagem" : "Nova Viagem"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div><Label>Destino</Label><Input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} /></div>
            <div><Label>Descrição</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><Label>URLs das imagens (uma por linha)</Label><Textarea value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Hotel</Label><Input value={form.hotel} onChange={(e) => setForm({ ...form, hotel: e.target.value })} /></div>
              <div><Label>Companhia Aérea</Label><Input value={form.airline} onChange={(e) => setForm({ ...form, airline: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Custo em Pontos</Label><Input type="number" value={form.pointsCost} onChange={(e) => setForm({ ...form, pointsCost: e.target.value })} /></div>
              <div><Label>Vagas</Label><Input type="number" value={form.spots} onChange={(e) => setForm({ ...form, spots: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Data Início</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
              <div><Label>Data Fim</Label><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(false)}>Cancelar</Button>
            <Button onClick={handleSubmit}>{editing ? "Salvar" : "Criar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
