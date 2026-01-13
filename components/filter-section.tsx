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
  filterPaymentStatus: string
  setFilterPaymentStatus: (value: string) => void
  paymentStatusOptions: string[]
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
  filterPaymentStatus,
  setFilterPaymentStatus,
  paymentStatusOptions,
  colors,
  designs,
  sizes,
  onReset,
  onFilter,
}: FilterSectionProps) {
  // Format payment status for display
  const formatPaymentStatus = (status: string) => {
    if (status === "All") return "All"
    if (status === "pending") return "No Confirmation"
    if (status === "partially paid") return "Partially Paid"
    if (status === "fully paid") return "Fully Paid"
    return status
  }

  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 mb-6">
      <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Filters</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 sm:gap-4">
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
            {[...new Set(colors)].map((c) => (
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
        {/* Payment Status Filter */}
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1">Payment</label>
          <select
            value={filterPaymentStatus}
            onChange={(e) => {
              setFilterPaymentStatus(e.target.value)
              onFilter()
            }}
            className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
          >
            {paymentStatusOptions.map((status) => (
              <option key={status} value={status}>
                {formatPaymentStatus(status)}
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