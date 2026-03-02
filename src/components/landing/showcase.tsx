"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Bell,
  Store,
  Calculator,
  ArrowRight,
  TrendingDown,
  Smartphone,
  Mail,
  MessageSquare,
  Shield,
  Map,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

const showcaseItems = [
  {
    title: "Busca Inteligente de Voos",
    subtitle: "Compare preços em reais e milhas lado a lado",
    description:
      "Nosso buscador exclusivo compara simultaneamente preços em dinheiro e milhas de todos os programas de fidelidade. Veja instantaneamente qual opção oferece o melhor custo-benefício para cada trecho.",
    icon: Search,
    gradient: "from-violet-500 to-indigo-600",
    features: ["Comparação BRL vs Milhas", "Todos os programas", "Melhor custo-benefício automático"],
    badge: "Ferramenta Premium",
  },
  {
    title: "Alertas de Preço Multicanal",
    subtitle: "Seja notificado onde preferir",
    description:
      "Configure alertas para as rotas que você monitora e receba notificações por e-mail, push no app ou WhatsApp quando os preços caírem. Nunca mais perca uma promoção de passagem.",
    icon: Bell,
    gradient: "from-rose-500 to-pink-600",
    features: ["E-mail, Push e WhatsApp", "Rotas personalizadas", "Histórico de preços"],
    badge: "Notificações Inteligentes",
    icons: [Smartphone, Mail, MessageSquare],
  },
  {
    title: "Marketplace de Milhas",
    subtitle: "Compre e venda milhas com segurança",
    description:
      "Nosso marketplace conecta compradores e vendedores de milhas com total segurança. Taxa de apenas 5%, sistema de escrow para proteção de ambas as partes e transações verificadas.",
    icon: Store,
    gradient: "from-fuchsia-500 to-purple-600",
    features: ["Taxa de apenas 5%", "Sistema de escrow", "Transações verificadas"],
    badge: "Marketplace Seguro",
    icons: [Shield, TrendingDown],
  },
  {
    title: "Calculadora VPM e Planejador",
    subtitle: "Saiba exatamente o valor das suas milhas",
    description:
      "Nossa calculadora de Valor Por Milha analisa cada oportunidade e diz se vale a pena usar milhas ou pagar em dinheiro. O planejador de viagem ajuda a otimizar o uso das suas milhas.",
    icon: Calculator,
    gradient: "from-teal-500 to-cyan-600",
    features: ["Valor por milha em tempo real", "Planejador de viagem", "Recomendações inteligentes"],
    badge: "Análise Avançada",
    icons: [BarChart3, Map],
  },
];

export function Showcase() {
  return (
    <section id="produtos" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ferramentas <span className="text-gradient">Premium</span> para viajantes inteligentes
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Conheça as ferramentas exclusivas que vão transformar a forma como você usa suas milhas e planeja suas viagens.
          </p>
        </motion.div>

        <div className="space-y-8">
          {showcaseItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 shadow-md">
                <CardContent className="p-0">
                  <div className={`grid grid-cols-1 lg:grid-cols-2 gap-0 ${index % 2 === 1 ? "lg:direction-rtl" : ""}`}>
                    {/* Visual side */}
                    <div className={`relative p-8 lg:p-12 bg-gradient-to-br ${item.gradient} flex flex-col justify-center items-center min-h-[280px] ${index % 2 === 1 ? "lg:order-2" : ""}`}>
                      <div className="absolute inset-0 bg-black/5" />
                      <motion.div
                        whileHover={{ scale: 1.05, rotate: 2 }}
                        className="relative z-10 flex flex-col items-center gap-4"
                      >
                        <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <item.icon className="w-10 h-10 text-white" />
                        </div>
                        <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                          {item.badge}
                        </Badge>
                        {item.icons && (
                          <div className="flex gap-3 mt-2">
                            {item.icons.map((Icon, i) => (
                              <div key={i} className="w-10 h-10 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center">
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    </div>

                    {/* Content side */}
                    <div className={`p-8 lg:p-12 flex flex-col justify-center ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                      <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                      <p className="text-violet-600 dark:text-violet-400 font-medium mb-4">{item.subtitle}</p>
                      <p className="text-muted-foreground mb-6">{item.description}</p>
                      <ul className="space-y-2 mb-6">
                        {item.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-sm">
                            <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${item.gradient}`} />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Link href="/register">
                        <Button variant="outline" className="group/btn">
                          Explorar ferramenta
                          <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/register">
            <Button size="lg" className="gradient-primary text-white rounded-full">
              Começar Gratuitamente
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
