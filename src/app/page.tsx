"use client";

import { useState, useEffect, useMemo } from "react";
import HeroSearch from "@/components/home/HeroSearch";
import FilterBar from "@/components/home/FilterBar";
import LocationGrid from "@/components/home/LocationGrid";
import { NoiseLevel, Purpose, Location } from "@/types";

export default function HomePage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [activeKeyword, setActiveKeyword] = useState("");
  const [activeLocation, setActiveLocation] = useState("");
  const [selectedNoise, setSelectedNoise] = useState<NoiseLevel | null>(null);
  const [selectedPurpose, setSelectedPurpose] = useState<Purpose | null>(null);
  const [availableNow, setAvailableNow] = useState(false);

  // Fetch locations from backend API on mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch("/api/locations");
        console.log("DEBUG FETCH: res.status =", res.status, "res.ok =", res.ok);
        if (res.ok) {
          const data = await res.json();
          console.log("DEBUG FETCH: data =", data);
          setLocations(data);
        } else {
          console.log("DEBUG FETCH: failed with status", res.status);
        }
      } catch (err: any) {
        console.log("DEBUG FETCH CATCH ERROR:", err.message || err);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  const handleSearch = () => {
    setActiveKeyword(keyword.toLowerCase());
    setActiveLocation(searchLocation.toLowerCase());
  };

  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      // 1. Lọc theo từ khóa (Keyword)
      const matchKeyword = activeKeyword
        ? loc.name.toLowerCase().includes(activeKeyword) ||
          loc.tags.some((t) => t.toLowerCase().includes(activeKeyword)) ||
          loc.amenities.some((a) => a.toLowerCase().includes(activeKeyword)) ||
          loc.description.toLowerCase().includes(activeKeyword)
        : true;

      // 2. Lọc theo vị trí (Location)
      const matchLocation = activeLocation
        ? loc.address.toLowerCase().includes(activeLocation)
        : true;

      // 3. Lọc theo độ ồn (Noise Level)
      const matchNoise = selectedNoise
        ? loc.noiseLevel === selectedNoise
        : true;

      // 4. Lọc theo mục đích (Purpose)
      const matchPurpose = selectedPurpose
        ? loc.purposes.includes(selectedPurpose)
        : true;

      // 5. Lọc theo tình trạng còn chỗ (Available Now)
      const matchAvailable = availableNow
        ? loc.availableSeats > 0
        : true;

      const isMatch = matchKeyword && matchLocation && matchNoise && matchPurpose && matchAvailable;

      console.log(`DEBUG FILTER [${loc.name}]:`, {
        matchKeyword,
        matchLocation,
        matchNoise,
        matchPurpose,
        matchAvailable,
        isMatch
      });

      return isMatch;
    });
  }, [locations, activeKeyword, activeLocation, selectedNoise, selectedPurpose, availableNow]);

  console.log("DEBUG FRONTEND:", {
    rawLocationsLength: locations.length,
    filteredLocationsLength: filteredLocations.length,
    activeKeyword,
    activeLocation,
    selectedNoise,
    selectedPurpose,
    availableNow
  });

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
                ? `Kết quả cho "${activeKeyword || activeLocation}"`
                : "Tất cả không gian học tập"}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {loading
                ? "Đang tải..."
                : `Có ${filteredLocations.length} không gian khả dụng gần bạn`}
            </p>
          </div>
        </div>

        <LocationGrid locations={filteredLocations} loading={loading} />
      </section>
    </>
  );
}
