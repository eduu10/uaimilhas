"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Clock, BookOpen, Sparkles, Lock, Play } from "lucide-react";
import { formatPoints } from "@/lib/utils";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  accessType: string;
  pointsCost: number;
  level: string;
  duration: string | null;
  isPublished: boolean;
}

interface Enrollment {
  id: string;
  progress: number;
  course: Course;
}

export default function CoursesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/client/courses")
      .then((r) => r.json())
      .then((data) => {
        setEnrollments(data.enrollments || []);
        setCourses(data.available || []);
      })
      .catch(() => null);
  }, []);

  const handleEnroll = async (courseId: string) => {
    setLoading(true);
    const res = await fetch("/api/client/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });

    if (res.ok) {
      const data = await res.json();
      window.location.reload();
    } else {
      const err = await res.json();
      alert(err.error || "Erro ao desbloquear curso");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Meus Cursos</h1>
        <p className="text-muted-foreground">Gerencie seus cursos e descubra novos</p>
      </div>

      <Tabs defaultValue="enrolled">
        <TabsList>
          <TabsTrigger value="enrolled">Meus Cursos ({enrollments.length})</TabsTrigger>
          <TabsTrigger value="available">Disponíveis ({courses.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="enrolled" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => (
              <Card key={enrollment.id} className="overflow-hidden">
                <div className="h-40 bg-muted flex items-center justify-center">
                  {enrollment.course.thumbnail ? (
                    <img src={enrollment.course.thumbnail} alt={enrollment.course.title} className="w-full h-full object-cover" />
                  ) : (
                    <GraduationCap className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{enrollment.course.title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">{enrollment.course.level}</Badge>
                    {enrollment.course.duration && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {enrollment.course.duration}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progresso</span>
                      <span>{Math.round(enrollment.progress)}%</span>
                    </div>
                    <Progress value={enrollment.progress} />
                  </div>
                  <Button className="w-full mt-4" size="sm">
                    <Play className="w-4 h-4 mr-2" /> Continuar
                  </Button>
                </CardContent>
              </Card>
            ))}
            {enrollments.length === 0 && (
              <Card className="col-span-full p-8 text-center">
                <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Nenhum curso desbloqueado</h3>
                <p className="text-muted-foreground">Explore os cursos disponíveis e use seus pontos!</p>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="available" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="overflow-hidden group">
                <div className="h-40 bg-muted flex items-center justify-center relative">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <GraduationCap className="w-12 h-12 text-muted-foreground" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{course.description}</p>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline">{course.level}</Badge>
                    {course.duration && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {course.duration}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-violet-500" />
                      <span className="font-bold text-violet-600">{formatPoints(course.pointsCost)} pts</span>
                    </div>
                    <Button size="sm" onClick={() => handleEnroll(course.id)} disabled={loading}>
                      Desbloquear
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
