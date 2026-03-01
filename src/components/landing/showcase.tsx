"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plane, Hotel, ShoppingBag, Sparkles } from "lucide-react";
import Link from "next/link";

const products = [
  {
    title: "iPhone 15 Pro",
    category: "Eletrônicos",
    points: 45000,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=300&fit=crop",
    icon: ShoppingBag,
  },
  {
    title: "Paris - 7 noites",
    category: "Viagem",
    points: 85000,
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop",
    icon: Plane,
  },
  {
    title: "Resort Maldivas",
    category: "Hospedagem",
    points: 120000,
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&h=300&fit=crop",
    icon: Hotel,
  },
  {
    title: "MacBook Air M3",
    category: "Eletrônicos",
    points: 65000,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop",
    icon: ShoppingBag,
  },
  {
    title: "Tóquio - 10 noites",
    category: "Viagem",
    points: 95000,
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop",
    icon: Plane,
  },
  {
    title: "Experiência Gourmet",
    category: "Experiência",
    points: 15000,
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop",
    icon: Sparkles,
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
            Descubra o que você pode <span className="text-gradient">resgatar</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            De eletrônicos a viagens internacionais, temos as melhores recompensas esperando por você.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="relative h-48 bg-muted overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <Badge className="absolute top-3 left-3 bg-white/90 text-foreground hover:bg-white">
                    {product.category}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-violet-500" />
                      <span className="font-bold text-violet-600">
                        {new Intl.NumberFormat("pt-BR").format(product.points)} pts
                      </span>
                    </div>
                    <Button size="sm" variant="outline">Ver mais</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/register">
            <Button size="lg" className="gradient-primary text-white rounded-full">
              Ver Catálogo Completo
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
