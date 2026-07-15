import Hero from "@/components/Hero";
import About from "@/components/About";
import CurrentWork from "@/components/CurrentWork";
import Experience from "@/components/Experience";
import Education from "@/components/Education";
import Projects from "@/components/Projects";
import Footer from "@/components/Footer";
import SectionCounter from "@/components/SectionCounter";
import RobotWalkerLazy from "@/components/RobotWalkerLazy";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col">
      <RobotWalkerLazy />
      <div className="relative z-10 flex flex-1 flex-col">
        <SectionCounter />
        <main className="mx-auto w-full max-w-3xl px-6 sm:px-8">
          <Hero />
          <About />
          <CurrentWork />
          <Experience />
          <Education />
          <Projects />
        </main>
        <div className="mx-auto w-full max-w-3xl px-6 sm:px-8">
          <Footer />
        </div>
      </div>
    </div>
  );
}
