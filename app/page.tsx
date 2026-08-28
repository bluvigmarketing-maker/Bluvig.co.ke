import { Hero } from "@/components/home/hero";
import { DiscoveryEngine } from "@/components/home/discovery-engine";
import { Services } from "@/components/home/services";
import { CaseStudies } from "@/components/home/case-studies";
import { Trust } from "@/components/home/trust";
import { FinalCta } from "@/components/home/final-cta";

export default function Home() {
  return (
    <>
      <Hero />
      <DiscoveryEngine />
      <Services />
      <CaseStudies />
      <Trust />
      <FinalCta />
    </>
  );
}
