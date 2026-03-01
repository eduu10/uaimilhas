"use client";

import { motion } from "framer-motion";
import { UserPlus, Coins, Gift } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Cadastre-se",
    description: "Crie sua conta gratuitamente em menos de 2 minutos e escolha seu plano ideal.",
  },
  {
    icon: Coins,
    step: "02",
    title: "Acumule Pontos",
    description: "Ganhe pontos através da sua assinatura, compras e participação em campanhas de bônus.",
  },
  {
    icon: Gift,
    step: "03",
    title: "Troque por Recompensas",
    description: "Resgate seus pontos por viagens, produtos, cursos e experiências exclusivas.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-24 px-4 bg-muted/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Como <span className="text-gradient">Funciona</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Em apenas 3 passos simples, você começa a transformar pontos em experiências.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 via-blue-500 to-amber-500 -translate-y-1/2" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative z-10 w-20 h-20 rounded-full gradient-primary flex items-center justify-center mb-6 shadow-lg shadow-violet-500/25">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <span className="text-5xl font-bold text-muted-foreground/20 absolute -top-4 right-1/4">
                  {step.step}
                </span>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm max-w-xs">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
