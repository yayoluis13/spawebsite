"use client";

import { useCallback, useState } from "react";
import type { Package } from "@/db/schema";
import Navbar from "./Navbar";
import Hero from "./Hero";
import Manifesto from "./Manifesto";
import HorizontalPackages from "./HorizontalPackages";
import PromoCalculator from "./PromoCalculator";
import Journey from "./Journey";
import BookingSection from "./BookingSection";
import Footer from "./Footer";

export default function SpaExperience({ packages }: { packages: Package[] }) {
  const [selectedId, setSelectedId] = useState<number | null>(packages[0]?.id ?? null);
  const [people, setPeople] = useState(2);

  const selectAndGo = useCallback((id: number) => {
    setSelectedId(id);
    document.getElementById("reservar")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <Manifesto />
      <HorizontalPackages packages={packages} selectedId={selectedId} onSelect={selectAndGo} />
      <PromoCalculator packages={packages} selectedId={selectedId} people={people} onSelect={setSelectedId} onPeople={setPeople} />
      <Journey />
      <BookingSection packages={packages} selectedId={selectedId} people={people} onSelect={setSelectedId} onPeople={setPeople} />
      <Footer />
    </main>
  );
}
