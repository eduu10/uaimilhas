"use client";

import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    question: "Como funciona o acúmulo de pontos?",
    answer: "Você acumula pontos automaticamente através da sua assinatura mensal. Cada plano oferece uma quantidade diferente de pontos. Além disso, campanhas especiais de bônus podem multiplicar seus ganhos.",
  },
  {
    question: "Os pontos expiram?",
    answer: "Não! Na UAI Milhas seus pontos nunca expiram. Você pode acumular no seu ritmo e resgatar quando quiser, sem nenhuma pressão de prazo.",
  },
  {
    question: "Como funciona o sistema de tiers?",
    answer: "Nosso sistema de tiers tem 4 níveis: Bronze (0-999 pts), Prata (1.000-4.999 pts), Ouro (5.000-9.999 pts) e Diamante (10.000+ pts). Cada nível oferece benefícios exclusivos e multiplicadores de pontos maiores.",
  },
  {
    question: "Posso trocar pontos por viagens reais?",
    answer: "Sim! Oferecemos pacotes de viagens completos que incluem passagens aéreas, hospedagem e experiências. Basta ter os pontos necessários e solicitar o resgate no catálogo de viagens.",
  },
  {
    question: "Como acesso os cursos da plataforma?",
    answer: "Os cursos podem ser desbloqueados usando seus pontos. Após o desbloqueio, você tem acesso vitalício ao conteúdo, incluindo videoaulas, materiais complementares e certificado de conclusão.",
  },
  {
    question: "Posso cancelar minha assinatura a qualquer momento?",
    answer: "Sim, você pode cancelar sua assinatura a qualquer momento sem multa. Seus pontos acumulados permanecem na sua conta mesmo após o cancelamento.",
  },
  {
    question: "Qual a diferença entre os planos?",
    answer: "Os planos diferem na quantidade de pontos mensais, acesso a cursos, suporte e benefícios exclusivos. O plano Pro é o mais popular por oferecer o melhor custo-benefício.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Perguntas <span className="text-gradient">Frequentes</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Tire suas dúvidas sobre a plataforma UAI Milhas.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
