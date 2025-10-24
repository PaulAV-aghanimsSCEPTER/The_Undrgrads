"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface FilterSectionProps {
  filterName: string
  setFilterName: (value: string) => void
  filterColor: string
  setFilterColor: (value: string) => void
  filterSize: string
  setFilterSize: (value: string) => void
  filterDesign: string
  setFilterDesign: (value: string) => void
  colors: string[]
  designs: string[]
  sizes: string[]
  onReset: () => void
  onFilter: () => void
}

export default function FilterSection({
  filterName,
  setFilterName,
  filterColor,
  setFilterColor,
  filterSize,
  setFilterSize,
  filterDesign,
  setFilterDesign,
  colors,
  designs,
  sizes,
  onReset,
  onFilter,
}: FilterSectionProps) {
  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 mb-6">
      <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Filters</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1">Customer Name</label>
          <Input
            placeholder="Search..."
            value={filterName}
            onChange={(e) => {
              setFilterName(e.target.value)
              onFilter()
            }}
            className="text-xs sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1">Color</label>
          <select
            value={filterColor}
            onChange={(e) => {
              setFilterColor(e.target.value)
              onFilter()
            }}
            className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
          >
            <option>All</option>
            {colors.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1">Size</label>
          <select
            value={filterSize}
            onChange={(e) => {
              setFilterSize(e.target.value)
              onFilter()
            }}
            className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
          >
            <option>All</option>
            {sizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1">Design</label>
          <select
            value={filterDesign}
            onChange={(e) => {
              setFilterDesign(e.target.value)
              onFilter()
            }}
            className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
          >
            <option>All</option>
            {designs.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <Button onClick={onReset} variant="outline" className="w-full bg-transparent text-xs sm:text-sm">
            Reset
          </Button>
        </div>
      </div>
    </div>
  )
}
