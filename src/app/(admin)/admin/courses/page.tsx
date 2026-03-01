"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Eye, GraduationCap } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  accessType: string;
  pointsCost: number;
  price: number;
  level: string;
  duration: string | null;
  isPublished: boolean;
  _count?: { enrollments: number; modules: number };
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", accessType: "PONTOS", pointsCost: "0",
    price: "0", level: "Iniciante", duration: "", thumbnail: "",
  });

  const fetchCourses = async () => {
    const res = await fetch("/api/admin/courses");
    const data = await res.json();
    setCourses(data);
  };

  useEffect(() => { fetchCourses(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ title: "", description: "", accessType: "PONTOS", pointsCost: "0", price: "0", level: "Iniciante", duration: "", thumbnail: "" });
    setDialog(true);
  };

  const openEdit = (course: Course) => {
    setEditing(course);
    setForm({
      title: course.title, description: course.description, accessType: course.accessType,
      pointsCost: String(course.pointsCost), price: String(course.price), level: course.level,
      duration: course.duration || "", thumbnail: course.thumbnail || "",
    });
    setDialog(true);
  };

  const handleSubmit = async () => {
    const url = editing ? `/api/admin/courses/${editing.id}` : "/api/admin/courses";
    const method = editing ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        pointsCost: parseInt(form.pointsCost),
        price: parseFloat(form.price),
      }),
    });

    setDialog(false);
    fetchCourses();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este curso?")) return;
    await fetch(`/api/admin/courses/${id}`, { method: "DELETE" });
    fetchCourses();
  };

  const handlePublish = async (id: string, publish: boolean) => {
    await fetch(`/api/admin/courses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: publish }),
    });
    fetchCourses();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Cursos</h1>
          <p className="text-muted-foreground">Crie e gerencie cursos da plataforma</p>
        </div>
        <Button onClick={openNew} className="gradient-primary text-white">
          <Plus className="w-4 h-4 mr-2" /> Novo Curso
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="overflow-hidden">
            <div className="h-40 bg-muted flex items-center justify-center">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <GraduationCap className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold">{course.title}</h3>
                <Badge variant={course.isPublished ? "default" : "secondary"}>
                  {course.isPublished ? "Publicado" : "Rascunho"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{course.description}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Badge variant="outline">{course.level}</Badge>
                <Badge variant="outline">{course.accessType}</Badge>
                {course.accessType === "PONTOS" && (
                  <span className="font-semibold text-violet-600">{course.pointsCost.toLocaleString("pt-BR")} pts</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(course)}>
                  <Edit className="w-3 h-3 mr-1" /> Editar
                </Button>
                <Button size="sm" variant="outline" onClick={() => handlePublish(course.id, !course.isPublished)}>
                  <Eye className="w-3 h-3 mr-1" /> {course.isPublished ? "Despublicar" : "Publicar"}
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(course.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <Card className="p-12 text-center">
          <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">Nenhum curso cadastrado</h3>
          <p className="text-muted-foreground mb-4">Comece criando seu primeiro curso</p>
          <Button onClick={openNew}>Criar Primeiro Curso</Button>
        </Card>
      )}

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Curso" : "Novo Curso"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div>
              <Label>Título</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <Label>URL da Thumbnail</Label>
              <Input value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} placeholder="https://..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Acesso</Label>
                <Select value={form.accessType} onValueChange={(v) => setForm({ ...form, accessType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GRATUITO">Gratuito</SelectItem>
                    <SelectItem value="PAGO">Pago</SelectItem>
                    <SelectItem value="PONTOS">Pontos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Nível</Label>
                <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Iniciante">Iniciante</SelectItem>
                    <SelectItem value="Intermediário">Intermediário</SelectItem>
                    <SelectItem value="Avançado">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Custo em Pontos</Label>
                <Input type="number" value={form.pointsCost} onChange={(e) => setForm({ ...form, pointsCost: e.target.value })} />
              </div>
              <div>
                <Label>Preço (R$)</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Duração</Label>
              <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="Ex: 8h 30min" />
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
