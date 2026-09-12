import Navbar from "@/components/Navbar";
import ScrollVideoHero from "@/components/ScrollVideoHero";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-black text-white relative select-none">
      {/* Floating Top Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-auto">
        <Navbar />
      </div>

      {/* Standalone Smooth Scroll Video Hero */}
      <ScrollVideoHero
        videoSrc="/videos/tcg_demo_transparent.webm"
        scrollDistance="1000vh"
      />
    </main>
  );
}
