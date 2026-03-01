"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plane, MapPin, Hotel, Sparkles, Users, Calendar, CheckCircle } from "lucide-react";
import { formatPoints } from "@/lib/utils";

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
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [bookDialog, setBookDialog] = useState<{ open: boolean; trip: Trip | null }>({ open: false, trip: null });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/client/trips")
      .then((r) => r.json())
      .then(setTrips)
      .catch(() => setTrips([]));
  }, []);

  const handleBook = async () => {
    if (!bookDialog.trip) return;
    const res = await fetch("/api/client/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tripId: bookDialog.trip.id }),
    });

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setBookDialog({ open: false, trip: null });
      }, 2000);
    } else {
      const err = await res.json();
      alert(err.error || "Erro ao reservar");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Viagens & Experiências</h1>
        <p className="text-muted-foreground">Descubra destinos incríveis para resgatar com pontos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {trips.map((trip) => (
          <Card key={trip.id} className="overflow-hidden group hover:shadow-xl transition-all">
            <div className="h-56 bg-muted flex items-center justify-center relative">
              {trip.images[0] ? (
                <img src={trip.images[0]} alt={trip.destination} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <Plane className="w-16 h-16 text-muted-foreground" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <MapPin className="w-5 h-5" /> {trip.destination}
                </h3>
              </div>
              <Badge className="absolute top-3 right-3 bg-white/90 text-foreground">
                <Users className="w-3 h-3 mr-1" /> {trip.spots} vagas
              </Badge>
            </div>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{trip.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {trip.hotel && (
                  <Badge variant="outline">
                    <Hotel className="w-3 h-3 mr-1" /> {trip.hotel}
                  </Badge>
                )}
                {trip.airline && (
                  <Badge variant="outline">
                    <Plane className="w-3 h-3 mr-1" /> {trip.airline}
                  </Badge>
                )}
                {trip.startDate && (
                  <Badge variant="outline">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(trip.startDate).toLocaleDateString("pt-BR")}
                    {trip.endDate && ` - ${new Date(trip.endDate).toLocaleDateString("pt-BR")}`}
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Sparkles className="w-5 h-5 text-violet-500" />
                  <span className="font-bold text-violet-600 text-xl">{formatPoints(trip.pointsCost)} pts</span>
                </div>
                <Button
                  onClick={() => setBookDialog({ open: true, trip })}
                  className="gradient-primary text-white"
                  disabled={trip.spots <= 0}
                >
                  {trip.spots > 0 ? "Reservar" : "Esgotado"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {trips.length === 0 && (
        <Card className="p-12 text-center">
          <Plane className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">Nenhuma viagem disponível no momento</h3>
          <p className="text-muted-foreground">Volte em breve para novos destinos!</p>
        </Card>
      )}

      <Dialog open={bookDialog.open} onOpenChange={(open) => setBookDialog({ ...bookDialog, open })}>
        <DialogContent>
          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Viagem reservada!</h3>
              <p className="text-muted-foreground">Você receberá os detalhes por email.</p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Confirmar Reserva</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="mb-2">Deseja reservar a viagem para <strong>{bookDialog.trip?.destination}</strong>?</p>
                <p className="text-muted-foreground">
                  Serão debitados{" "}
                  <span className="font-bold text-violet-600">
                    {formatPoints(bookDialog.trip?.pointsCost || 0)} pontos
                  </span>.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setBookDialog({ open: false, trip: null })}>Cancelar</Button>
                <Button onClick={handleBook} className="gradient-primary text-white">Confirmar</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
