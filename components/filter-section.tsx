"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

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
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Filter</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4">
          {/* Name Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium">Name</label>
            <Input
              placeholder="Search..."
              value={filterName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFilterName(e.target.value)
              }
            />
          </div>

          {/* Color Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium">Color</label>
            <Select value={filterColor} onValueChange={setFilterColor}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                {colors.map((color) => (
                  <SelectItem key={color} value={color}>
                    {color}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Size Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium">Size</label>
            <Select value={filterSize} onValueChange={setFilterSize}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                {sizes.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Design Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium">Design</label>
            <Select value={filterDesign} onValueChange={setFilterDesign}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                {designs.map((design) => (
                  <SelectItem key={design} value={design}>
                    {design}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onReset}>
            Reset
          </Button>
          <Button onClick={onFilter} className="bg-blue-600 hover:bg-blue-700">
            Filter
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
