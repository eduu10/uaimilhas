import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { Benefits } from "@/components/landing/benefits";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Showcase } from "@/components/landing/showcase";
import { CoursesPreview } from "@/components/landing/courses-preview";
import { Pricing } from "@/components/landing/pricing";
import { Testimonials } from "@/components/landing/testimonials";
import { FAQ } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Benefits />
      <HowItWorks />
      <Showcase />
      <CoursesPreview />
      <Pricing />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  );
}
