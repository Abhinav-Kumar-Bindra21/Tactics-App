import AboutSection from "./components/AboutSection";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import TacticsSection from "./components/TacticsSection";

function App() {
  return (
    <div className="min-h-screen bg-[#111714]">
      <Navbar />
      <main>
        <Hero />
        <TacticsSection />
        <AboutSection />
      </main>

      <Footer />
    </div>
  );
}

export default App;
