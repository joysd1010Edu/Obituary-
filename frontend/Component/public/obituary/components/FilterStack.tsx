"use client";

import AdvertisementCard from "./AdvertisementCard";
import FilterGroup from "./FilterGroup";
import type { FilterGroupKey, FilterOption } from "../types";

const publishDateFilters: FilterOption[] = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last7Days", label: "Last 7 Days" },
  { id: "last12Months", label: "Last 12 Months" },
];

const countryFilters: FilterOption[] = [
  { id: "all", label: "All" },
  { id: "ireland", label: "Rep. Of Ireland" },
  { id: "uk", label: "UK" },
];

export default function FilterStack({
  publishDateFiltersSelected,
  countryFiltersSelected,
  onToggle,
}: {
  publishDateFiltersSelected: Set<string>;
  countryFiltersSelected: Set<string>;
  onToggle: (group: FilterGroupKey, filterId: string) => void;
}) {
  return (
    <div className="space-y-4">
      <FilterGroup
        title="Obituary Publish Date"
        options={publishDateFilters}
        selectedFilters={publishDateFiltersSelected}
        onToggle={(filterId) => onToggle("publishDate", filterId)}
      />
      <FilterGroup
        title="Country"
        options={countryFilters}
        selectedFilters={countryFiltersSelected}
        onToggle={(filterId) => onToggle("country", filterId)}
      />
    </div>
  );
}
