import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@uaimilhas.com" },
    update: {},
    create: {
      name: "Admin UAI Milhas",
      email: "admin@uaimilhas.com",
      password: adminPassword,
      role: "ADMIN",
      points: 0,
    },
  });
  console.log("Admin created:", admin.email);

  // Create test client
  const clientPassword = await bcrypt.hash("cliente123", 12);
  const client = await prisma.user.upsert({
    where: { email: "cliente@teste.com" },
    update: {},
    create: {
      name: "Cliente Teste",
      email: "cliente@teste.com",
      password: clientPassword,
      role: "CLIENTE",
      points: 5500,
      tier: "OURO",
    },
  });
  console.log("Client created:", client.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: "eletronicos" }, update: {}, create: { name: "Eletrônicos", slug: "eletronicos" } }),
    prisma.category.upsert({ where: { slug: "viagens" }, update: {}, create: { name: "Viagens", slug: "viagens" } }),
    prisma.category.upsert({ where: { slug: "experiencias" }, update: {}, create: { name: "Experiências", slug: "experiencias" } }),
    prisma.category.upsert({ where: { slug: "vouchers" }, update: {}, create: { name: "Vouchers", slug: "vouchers" } }),
  ]);
  console.log("Categories created:", categories.length);

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "iPhone 15 Pro",
        description: "O iPhone mais avançado da Apple com chip A17 Pro, câmera de 48MP e design em titânio.",
        images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=300&fit=crop"],
        pointsCost: 45000,
        stock: 5,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "MacBook Air M3",
        description: "Notebook ultrafino com chip M3, 15 horas de bateria e tela Liquid Retina.",
        images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop"],
        pointsCost: 65000,
        stock: 3,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "AirPods Pro 2",
        description: "Fones de ouvido com cancelamento de ruído ativo e áudio espacial personalizado.",
        images: ["https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=300&fit=crop"],
        pointsCost: 12000,
        stock: 10,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Voucher iFood R$200",
        description: "Vale-presente de R$200 para usar no iFood em restaurantes e mercados.",
        images: [],
        pointsCost: 5000,
        stock: 50,
        categoryId: categories[3].id,
      },
    }),
  ]);
  console.log("Products created:", products.length);

  // Create trips
  const trips = await Promise.all([
    prisma.trip.create({
      data: {
        destination: "Paris, França",
        description: "7 noites em Paris com hotel 5 estrelas, passagem aérea e tour pela Torre Eiffel e Louvre.",
        images: ["https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop"],
        hotel: "Le Grand Hotel Paris",
        airline: "Air France",
        pointsCost: 85000,
        spots: 10,
        startDate: new Date("2026-06-15"),
        endDate: new Date("2026-06-22"),
      },
    }),
    prisma.trip.create({
      data: {
        destination: "Maldivas",
        description: "5 noites em resort all-inclusive nas Maldivas com bangalô sobre a água.",
        images: ["https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&h=300&fit=crop"],
        hotel: "Soneva Fushi Resort",
        airline: "Emirates",
        pointsCost: 120000,
        spots: 5,
        startDate: new Date("2026-07-01"),
        endDate: new Date("2026-07-06"),
      },
    }),
    prisma.trip.create({
      data: {
        destination: "Tóquio, Japão",
        description: "10 noites em Tóquio com hotel no centro, passagem e guia em português.",
        images: ["https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop"],
        hotel: "Park Hyatt Tokyo",
        airline: "ANA",
        pointsCost: 95000,
        spots: 8,
        startDate: new Date("2026-09-10"),
        endDate: new Date("2026-09-20"),
      },
    }),
  ]);
  console.log("Trips created:", trips.length);

  // Create courses
  const courses = await Promise.all([
    prisma.course.create({
      data: {
        title: "Investimentos para Iniciantes",
        description: "Aprenda do zero como investir em renda fixa, ações, fundos imobiliários e criptomoedas. Curso completo com exemplos práticos.",
        thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop",
        accessType: "PONTOS",
        pointsCost: 5000,
        level: "Iniciante",
        duration: "4h 30min",
        isPublished: true,
      },
    }),
    prisma.course.create({
      data: {
        title: "Marketing Digital Avançado",
        description: "Domine as estratégias avançadas de marketing digital incluindo SEO, tráfego pago, copywriting e funis de vendas.",
        thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
        accessType: "PONTOS",
        pointsCost: 12000,
        level: "Avançado",
        duration: "12h",
        isPublished: true,
      },
    }),
    prisma.course.create({
      data: {
        title: "Empreendedorismo Digital",
        description: "Monte seu negócio digital do zero. Da ideia ao primeiro faturamento, passando por validação, MVP e crescimento.",
        thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=250&fit=crop",
        accessType: "PONTOS",
        pointsCost: 8000,
        level: "Intermediário",
        duration: "8h",
        isPublished: true,
      },
    }),
  ]);
  console.log("Courses created:", courses.length);

  // Create plans
  const plans = await Promise.all([
    prisma.plan.create({
      data: {
        name: "Basic",
        description: "Plano básico para começar a acumular pontos",
        price: 29.90,
        pointsPerMonth: 500,
        features: ["500 pontos/mês", "Acesso ao catálogo básico", "1 curso gratuito/mês", "Suporte por email"],
      },
    }),
    prisma.plan.create({
      data: {
        name: "Pro",
        description: "O melhor custo-benefício para maximizar seus pontos",
        price: 79.90,
        pointsPerMonth: 2000,
        isPopular: true,
        features: ["2.000 pontos/mês", "Acesso ao catálogo completo", "5 cursos gratuitos/mês", "Suporte prioritário", "Bônus de 10% nos pontos", "Acesso antecipado a ofertas"],
      },
    }),
    prisma.plan.create({
      data: {
        name: "Premium",
        description: "Experiência VIP com benefícios exclusivos",
        price: 149.90,
        pointsPerMonth: 5000,
        features: ["5.000 pontos/mês", "Acesso ilimitado a tudo", "Todos os cursos inclusos", "Suporte VIP 24/7", "Bônus de 25% nos pontos", "Experiências exclusivas", "Concierge pessoal"],
      },
    }),
  ]);
  console.log("Plans created:", plans.length);

  // Create welcome bonus transaction for test client
  await prisma.pointTransaction.create({
    data: {
      userId: client.id,
      type: "BONUS",
      amount: 5500,
      description: "Pontos iniciais da conta de teste",
    },
  });

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
