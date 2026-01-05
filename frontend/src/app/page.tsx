import {
  Header,
  Hero,
  Features,
  HowItWorks,
  Pricing,
  Footer,
} from "@/components/landing";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-dark-950">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <Footer />
    </main>
  );
}
