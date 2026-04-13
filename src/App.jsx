import Intro from "./components/Intro";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import TechStack from "./components/TechStack";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

export default function App() {
  return (
    <>
      <Intro />
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <TechStack />
      <CTA />
      <Footer />
    </>
  );
}