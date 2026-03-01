"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Basic",
    price: 29.90,
    points: 500,
    popular: false,
    features: [
      "500 pontos/mês",
      "Acesso ao catálogo básico",
      "1 curso gratuito/mês",
      "Suporte por email",
    ],
  },
  {
    name: "Pro",
    price: 79.90,
    points: 2000,
    popular: true,
    features: [
      "2.000 pontos/mês",
      "Acesso ao catálogo completo",
      "5 cursos gratuitos/mês",
      "Suporte prioritário",
      "Bônus de 10% nos pontos",
      "Acesso antecipado a ofertas",
    ],
  },
  {
    name: "Premium",
    price: 149.90,
    points: 5000,
    popular: false,
    features: [
      "5.000 pontos/mês",
      "Acesso ilimitado a tudo",
      "Todos os cursos inclusos",
      "Suporte VIP 24/7",
      "Bônus de 25% nos pontos",
      "Experiências exclusivas",
      "Concierge pessoal",
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
            Planos flexíveis que se adaptam às suas necessidades. Quanto maior o plano, mais pontos e benefícios.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
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
                    <span className="text-4xl font-bold">R$ {plan.price.toFixed(2).replace(".", ",")}</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Sparkles className="w-4 h-4 text-violet-500" />
                    <span className="text-sm font-medium text-violet-600">
                      {new Intl.NumberFormat("pt-BR").format(plan.points)} pontos/mês
                    </span>
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
                      Assinar Agora
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
