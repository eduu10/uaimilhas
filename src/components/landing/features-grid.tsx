"use client";

import { motion } from "framer-motion";
import {
  Search,
  Bell,
  Calculator,
  Store,
  BarChart3,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Busca de Voos",
    description: "Compare preços em BRL e milhas de todos os programas de fidelidade em uma única busca.",
    gradient: "from-violet-500 to-indigo-600",
    bgGlow: "bg-violet-500/10",
  },
  {
    icon: Bell,
    title: "Alertas de Preço",
    description: "Monitore rotas e seja notificado por e-mail, push ou WhatsApp quando os preços caírem.",
    gradient: "from-rose-500 to-pink-600",
    bgGlow: "bg-rose-500/10",
  },
  {
    icon: Calculator,
    title: "Calculadora VPM",
    description: "Saiba o valor real das suas milhas e descubra se vale a pena usar pontos ou pagar em dinheiro.",
    gradient: "from-teal-500 to-cyan-600",
    bgGlow: "bg-teal-500/10",
  },
  {
    icon: Store,
    title: "Marketplace",
    description: "Compre e venda milhas com segurança no nosso marketplace com taxa de apenas 5%.",
    gradient: "from-fuchsia-500 to-purple-600",
    bgGlow: "bg-fuchsia-500/10",
  },
  {
    icon: BarChart3,
    title: "Monitor de Milhas",
    description: "Acompanhe seus saldos em todos os programas de fidelidade em um único painel centralizado.",
    gradient: "from-blue-500 to-sky-600",
    bgGlow: "bg-blue-500/10",
  },
  {
    icon: Users,
    title: "Programa de Afiliados",
    description: "Ganhe comissões indicando produtos e serviços para sua rede de contatos.",
    gradient: "from-amber-500 to-orange-600",
    bgGlow: "bg-amber-500/10",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function FeaturesGrid() {
  return (
    <section id="funcionalidades" className="py-24 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tudo o que você precisa em uma{" "}
            <span className="text-gradient">única plataforma</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Ferramentas poderosas para maximizar o valor das suas milhas e
            transformar a forma como você viaja.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative p-8 rounded-2xl border bg-card hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Background glow effect */}
              <div
                className={`absolute -top-12 -right-12 w-32 h-32 rounded-full ${feature.bgGlow} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              <div className="relative z-10">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                {/* Gradient bottom accent line */}
                <div
                  className={`mt-6 h-1 w-0 group-hover:w-full rounded-full bg-gradient-to-r ${feature.gradient} transition-all duration-500`}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
