"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Ana Silva",
    role: "Empresária",
    content: "Já resgatei 3 viagens internacionais com meus pontos. A plataforma é incrível e o atendimento é excepcional!",
    rating: 5,
    initials: "AS",
  },
  {
    name: "Carlos Mendes",
    role: "Desenvolvedor",
    content: "Os cursos disponíveis mudaram minha carreira. Consegui uma promoção depois de completar o curso de liderança.",
    rating: 5,
    initials: "CM",
  },
  {
    name: "Maria Santos",
    role: "Médica",
    content: "Melhor programa de pontos que já participei. Os produtos premium são de altíssima qualidade.",
    rating: 5,
    initials: "MS",
  },
  {
    name: "Pedro Oliveira",
    role: "Advogado",
    content: "O sistema de tiers é muito motivador. Já alcancei o nível Diamante e as recompensas exclusivas valem muito a pena!",
    rating: 5,
    initials: "PO",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 px-4 bg-muted/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            O que nossos <span className="text-gradient">membros</span> dizem
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Histórias reais de pessoas que transformaram seus pontos em experiências inesquecíveis.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-6 italic">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="gradient-primary text-white text-sm">
                        {testimonial.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-sm">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    </div>
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
