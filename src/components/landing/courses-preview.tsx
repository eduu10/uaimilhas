"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, BookOpen, Sparkles, Play } from "lucide-react";
import Link from "next/link";

const courses = [
  {
    title: "Investimentos para Iniciantes",
    level: "Iniciante",
    duration: "4h 30min",
    modules: 8,
    points: 5000,
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop",
  },
  {
    title: "Marketing Digital Avançado",
    level: "Avançado",
    duration: "12h",
    modules: 15,
    points: 12000,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
  },
  {
    title: "Empreendedorismo Digital",
    level: "Intermediário",
    duration: "8h",
    modules: 10,
    points: 8000,
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=250&fit=crop",
  },
];

export function CoursesPreview() {
  return (
    <section id="cursos" className="py-24 px-4 bg-muted/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Aprenda com <span className="text-gradient">Cursos Exclusivos</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Desbloqueie cursos premium com seus pontos e invista no seu desenvolvimento pessoal e profissional.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <motion.div
              key={course.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="relative h-48 bg-muted overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="w-6 h-6 text-violet-600 ml-1" />
                    </div>
                  </div>
                  <Badge className="absolute top-3 left-3">{course.level}</Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-3">{course.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" /> {course.modules} módulos
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-violet-500" />
                      <span className="font-bold text-violet-600">
                        {new Intl.NumberFormat("pt-BR").format(course.points)} pts
                      </span>
                    </div>
                    <Button size="sm">Desbloquear</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
