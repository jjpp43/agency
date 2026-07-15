import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Engines } from "./components/Engines";
import { Stats } from "./components/Stats";
import { Services } from "./components/Services";
import { WorkGallery } from "./components/WorkGallery";
// import { Process } from "./components/Process";
import { FAQ } from "./components/FAQ";
import { CTASection } from "./components/CTASection";
import { Footer } from "./components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="w-full min-w-0 flex-1 overflow-x-clip">
        <Hero />
        <Engines />
        <Stats />
        <Services />
        <WorkGallery />
        {/* <Process /> */}
        <FAQ />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
