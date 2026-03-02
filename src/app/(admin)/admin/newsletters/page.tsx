"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Edit,
  Trash2,
  Mail,
  Send,
  Crown,
  Users,
  RefreshCw,
  Search,
  Calendar,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Newsletter {
  id: string;
  title: string;
  content: string;
  isPremium: boolean;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface NewsletterStats {
  totalNewsletters: number;
  sentNewsletters: number;
  draftNewsletters: number;
  totalSubscribers: number;
  premiumSubscribers: number;
}

export default function NewslettersPage() {
  const [stats, setStats] = useState<NewsletterStats>({
    totalNewsletters: 0,
    sentNewsletters: 0,
    draftNewsletters: 0,
    totalSubscribers: 0,
    premiumSubscribers: 0,
  });
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<Newsletter | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; newsletter: Newsletter | null }>({
    open: false,
    newsletter: null,
  });
  const [form, setForm] = useState({
    title: "",
    content: "",
    isPremium: false,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, newslettersRes] = await Promise.all([
        fetch("/api/admin/newsletters/stats"),
        fetch("/api/admin/newsletters"),
      ]);

      const statsData = await statsRes.json();
      const newslettersData = await newslettersRes.json();

      setStats(statsData);
      setNewsletters(Array.isArray(newslettersData) ? newslettersData : []);
    } catch {
      setStats({
        totalNewsletters: 0,
        sentNewsletters: 0,
        draftNewsletters: 0,
        totalSubscribers: 0,
        premiumSubscribers: 0,
      });
      setNewsletters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ title: "", content: "", isPremium: false });
    setDialog(true);
  };

  const openEdit = (newsletter: Newsletter) => {
    setEditing(newsletter);
    setForm({
      title: newsletter.title,
      content: newsletter.content,
      isPremium: newsletter.isPremium,
    });
    setDialog(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) return;

    const url = editing
      ? `/api/admin/newsletters/${editing.id}`
      : "/api/admin/newsletters";
    const method = editing ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setDialog(false);
    setEditing(null);
    setForm({ title: "", content: "", isPremium: false });
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteDialog.newsletter) return;
    await fetch(`/api/admin/newsletters/${deleteDialog.newsletter.id}`, {
      method: "DELETE",
    });
    setDeleteDialog({ open: false, newsletter: null });
    fetchData();
  };

  const handleSend = async (newsletterId: string) => {
    if (!confirm("Tem certeza que deseja enviar esta newsletter? Esta acao nao pode ser desfeita.")) return;
    await fetch(`/api/admin/newsletters/${newsletterId}/send`, {
      method: "POST",
    });
    fetchData();
  };

  const filteredNewsletters = newsletters.filter(
    (n) =>
      !search ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
  );

  const statCards = [
    {
      title: "Total de Newsletters",
      value: stats.totalNewsletters.toLocaleString("pt-BR"),
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Enviadas",
      value: stats.sentNewsletters.toLocaleString("pt-BR"),
      icon: Send,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Rascunhos",
      value: stats.draftNewsletters.toLocaleString("pt-BR"),
      icon: Edit,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      title: "Inscritos",
      value: stats.totalSubscribers.toLocaleString("pt-BR"),
      icon: Users,
      color: "text-violet-600",
      bg: "bg-violet-100",
      subtitle: `${stats.premiumSubscribers} premium`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Newsletters</h1>
          <p className="text-muted-foreground">
            Crie e gerencie newsletters para seus assinantes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Atualizar
          </Button>
          <Button onClick={openNew} className="gradient-primary text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nova Newsletter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                  {card.subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {card.subtitle}
                    </p>
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

      {/* Newsletter List */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Todas as Newsletters
            </CardTitle>
            <div className="relative flex-1 max-w-sm ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por titulo ou conteudo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
                    Titulo
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                    Tipo
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                    Enviada em
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                    Criada em
                  </th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                    Acoes
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredNewsletters.map((newsletter) => (
                  <tr
                    key={newsletter.id}
                    className="border-b last:border-0 hover:bg-muted/50"
                  >
                    <td className="py-3 px-2">
                      <div>
                        <p className="font-medium text-sm">{newsletter.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-[300px]">
                          {newsletter.content}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      {newsletter.isPremium ? (
                        <Badge className="bg-amber-100 text-amber-700" variant="secondary">
                          <Crown className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Gratuita</Badge>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      {newsletter.sentAt ? (
                        <Badge className="bg-green-100 text-green-700" variant="secondary">
                          Enviada
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-700" variant="secondary">
                          Rascunho
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-2 text-sm text-muted-foreground">
                      {newsletter.sentAt
                        ? new Date(newsletter.sentAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </td>
                    <td className="py-3 px-2 text-sm text-muted-foreground">
                      {new Date(newsletter.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center justify-end gap-1">
                        {!newsletter.sentAt && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600"
                              onClick={() => handleSend(newsletter.id)}
                              title="Enviar newsletter"
                            >
                              <Send className="w-3 h-3 mr-1" />
                              Enviar
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEdit(newsletter)}
                              title="Editar newsletter"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() =>
                            setDeleteDialog({ open: true, newsletter })
                          }
                          title="Excluir newsletter"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredNewsletters.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-muted-foreground"
                    >
                      {search
                        ? "Nenhuma newsletter encontrada para esta busca"
                        : "Nenhuma newsletter cadastrada"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {newsletters.length === 0 && !loading && !search && (
        <Card className="p-12 text-center">
          <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">Nenhuma newsletter cadastrada</h3>
          <p className="text-muted-foreground mb-4">
            Comece criando sua primeira newsletter
          </p>
          <Button onClick={openNew}>Criar Primeira Newsletter</Button>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar Newsletter" : "Nova Newsletter"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titulo</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Titulo da newsletter..."
              />
            </div>
            <div>
              <Label>Conteudo</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Escreva o conteudo da newsletter..."
                className="min-h-[200px]"
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Newsletter Premium</Label>
                <p className="text-xs text-muted-foreground">
                  Disponivel apenas para assinantes premium
                </p>
              </div>
              <Button
                type="button"
                variant={form.isPremium ? "default" : "outline"}
                size="sm"
                onClick={() => setForm({ ...form, isPremium: !form.isPremium })}
                className={cn(
                  form.isPremium && "bg-amber-500 hover:bg-amber-600 text-white"
                )}
              >
                <Crown className="w-4 h-4 mr-1" />
                {form.isPremium ? "Premium" : "Gratuita"}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialog(false);
                setEditing(null);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!form.title.trim() || !form.content.trim()}>
              {editing ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusao</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir a newsletter{" "}
            <span className="font-medium text-foreground">
              &quot;{deleteDialog.newsletter?.title}&quot;
            </span>
            ? Esta acao nao pode ser desfeita.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, newsletter: null })}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
