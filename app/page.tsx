import { Hero } from "@/components/home/hero";
import { Services } from "@/components/home/services";
import { Process } from "@/components/home/process";
import { Work } from "@/components/home/work";
import { Trust } from "@/components/home/trust";
import { FinalCta } from "@/components/home/final-cta";

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <Process />
      <Work featured />
      <Trust />
      <FinalCta />
    </>
  );
}
