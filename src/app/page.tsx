"use client";

import { useState, useEffect, useMemo } from "react";
import HeroSearch from "@/components/home/HeroSearch";
import FilterBar from "@/components/home/FilterBar";
import LocationGrid from "@/components/home/LocationGrid";
import { mockLocations } from "@/lib/mock-data";
import { NoiseLevel, Purpose } from "@/types";

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [activeKeyword, setActiveKeyword] = useState("");
  const [activeLocation, setActiveLocation] = useState("");
  const [selectedNoise, setSelectedNoise] = useState<NoiseLevel | null>(null);
  const [selectedPurpose, setSelectedPurpose] = useState<Purpose | null>(null);
  const [availableNow, setAvailableNow] = useState(false);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = () => {
    setActiveKeyword(keyword.toLowerCase());
    setActiveLocation(searchLocation.toLowerCase());
  };

  const filteredLocations = useMemo(() => {
    return mockLocations.filter((loc) => {
      if (
        activeKeyword &&
        !loc.name.toLowerCase().includes(activeKeyword) &&
        !loc.tags.some((t) => t.toLowerCase().includes(activeKeyword)) &&
        !loc.amenities.some((a) => a.toLowerCase().includes(activeKeyword)) &&
        !loc.description.toLowerCase().includes(activeKeyword)
      ) {
        return false;
      }

      if (
        activeLocation &&
        !loc.address.toLowerCase().includes(activeLocation)
      ) {
        return false;
      }

      if (selectedNoise && loc.noiseLevel !== selectedNoise) return false;

      if (
        selectedPurpose &&
        !loc.purposes.includes(selectedPurpose)
      )
        return false;

      if (availableNow && loc.availableSeats === 0) return false;

      return true;
    });
  }, [activeKeyword, activeLocation, selectedNoise, selectedPurpose, availableNow]);

  return (
    <>
      <HeroSearch
        keyword={keyword}
        location={searchLocation}
        onKeywordChange={setKeyword}
        onLocationChange={setSearchLocation}
        onSearch={handleSearch}
      />

      <FilterBar
        selectedNoise={selectedNoise}
        selectedPurpose={selectedPurpose}
        availableNow={availableNow}
        onNoiseChange={setSelectedNoise}
        onPurposeChange={setSelectedPurpose}
        onAvailableChange={setAvailableNow}
        resultCount={loading ? 0 : filteredLocations.length}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {activeKeyword || activeLocation
                ? `Results for "${activeKeyword || activeLocation}"`
                : "All Study Spaces"}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {loading
                ? "Loading..."
                : `${filteredLocations.length} space${filteredLocations.length !== 1 ? "s" : ""} available near you`}
            </p>
          </div>
        </div>

        <LocationGrid locations={filteredLocations} loading={loading} />
      </section>
    </>
  );
}
