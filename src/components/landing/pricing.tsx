"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Gratuito",
    price: 0,
    popular: false,
    cta: "Começar Grátis",
    features: [
      "Busca de voos limitada (5/dia)",
      "Comparação básica de preços",
      "Calculadora VPM simplificada",
      "1 alerta de preço ativo",
      "Suporte por email",
    ],
  },
  {
    name: "Pro",
    price: 9.90,
    popular: true,
    cta: "Assinar Pro",
    features: [
      "Buscas de voos ilimitadas",
      "Comparação completa BRL vs Milhas",
      "Calculadora VPM avançada",
      "Alertas de preço ilimitados",
      "Notificações por e-mail e push",
      "Histórico de preços de rotas",
      "Suporte prioritário",
    ],
  },
  {
    name: "Premium",
    price: 19.90,
    popular: false,
    cta: "Assinar Premium",
    features: [
      "Tudo do plano Pro",
      "Acesso ao Marketplace de Milhas",
      "Planejador de viagem inteligente",
      "Alertas prioritários (WhatsApp)",
      "Monitor de saldos de milhas",
      "Relatórios avançados",
      "Suporte VIP 24/7",
    ],
  },
  {
    name: "Enterprise",
    price: 99,
    popular: false,
    cta: "Falar com Vendas",
    features: [
      "Tudo do plano Premium",
      "Acesso à API completa",
      "Solução white-label",
      "Suporte dedicado",
      "Integrações customizadas",
      "SLA garantido de 99,9%",
      "Gerente de conta exclusivo",
    ],
  },
];

export function Pricing() {
  return (
    <section id="planos" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Escolha seu <span className="text-gradient">Plano</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Planos flexíveis que se adaptam às suas necessidades. Comece grátis e evolua conforme sua demanda.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={plan.popular ? "md:-mt-4 md:mb-4" : ""}
            >
              <Card className={`relative h-full ${plan.popular ? "border-violet-500 shadow-xl shadow-violet-500/10" : ""}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary text-white px-4">
                    Mais Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    {plan.price === 0 ? (
                      <span className="text-4xl font-bold">Grátis</span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold">
                          R$ {plan.price.toFixed(2).replace(".", ",")}
                        </span>
                        <span className="text-muted-foreground">/mês</span>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className="block">
                    <Button
                      className={`w-full ${plan.popular ? "gradient-primary text-white" : ""}`}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
