"use client";

import { motion } from "framer-motion";
import { GraduationCap, ShoppingBag, Plane, Clock } from "lucide-react";

const benefits = [
  {
    icon: GraduationCap,
    title: "Cursos Exclusivos",
    description: "Acesse cursos premium sobre investimentos, empreendedorismo e muito mais usando seus pontos.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: ShoppingBag,
    title: "Produtos Premium",
    description: "Resgate eletrônicos, vouchers e produtos de marcas renomadas direto do nosso catálogo.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Plane,
    title: "Viagens dos Sonhos",
    description: "Troque seus pontos por passagens aéreas, hospedagens e pacotes de viagem incríveis.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Clock,
    title: "Pontos que Não Expiram",
    description: "Seus pontos são seus para sempre. Acumule no seu ritmo sem se preocupar com prazos.",
    gradient: "from-emerald-500 to-green-600",
  },
];

export function Benefits() {
  return (
    <section id="beneficios" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Por que escolher a <span className="text-gradient">UAI Milhas</span>?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Descubra as vantagens exclusivas que fazem da nossa plataforma a melhor escolha para você.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative p-6 rounded-2xl border bg-card hover:shadow-lg transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <benefit.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground text-sm">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
