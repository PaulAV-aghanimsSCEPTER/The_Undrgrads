"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, ChevronUp } from "lucide-react"

interface Order {
  id?: number
  name: string
  color: string
  size: string
  design: string
}

interface DesignsBreakdownDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orders: Order[]
}

export default function DesignsBreakdownDialog({ open, onOpenChange, orders }: DesignsBreakdownDialogProps) {
  const [expandedDesigns, setExpandedDesigns] = useState<Set<string>>(new Set())

  // Group by Design > Color > Size
  const designGroups = orders.reduce(
    (acc, order) => {
      if (!acc[order.design]) {
        acc[order.design] = {}
      }
      if (!acc[order.design][order.color]) {
        acc[order.design][order.color] = {}
      }
      if (!acc[order.design][order.color][order.size]) {
        acc[order.design][order.color][order.size] = 0
      }
      acc[order.design][order.color][order.size] += 1
      return acc
    },
    {} as Record<string, Record<string, Record<string, number>>>,
  )

  const sizeOrder = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"]
  const sortedDesigns = Object.keys(designGroups).sort((a, b) => a.localeCompare(b))

  const toggleDesign = (design: string) => {
    const newExpanded = new Set(expandedDesigns)
    if (newExpanded.has(design)) {
      newExpanded.delete(design)
    } else {
      newExpanded.add(design)
    }
    setExpandedDesigns(newExpanded)
  }

  // Calculate total for a design
  const getDesignTotal = (design: string) => {
    const colors = designGroups[design]
    return Object.values(colors).reduce(
      (sum, sizes) => sum + Object.values(sizes).reduce((s, q) => s + q, 0),
      0
    )
  }

  // Calculate total for a color within a design
  const getColorTotal = (colors: Record<string, number>) => {
    return Object.values(colors).reduce((sum, qty) => sum + qty, 0)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Designs Needed to Print</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-96 w-full rounded-md border p-4">
          <div className="space-y-2">
            {sortedDesigns.map((design) => {
              const isExpanded = expandedDesigns.has(design)
              const colors = designGroups[design]
              const sortedColors = Object.keys(colors).sort((a, b) => a.localeCompare(b))
              const totalQuantity = getDesignTotal(design)

              return (
                <div key={design} className="border rounded">
                  {/* Design Header */}
                  <button
                    onClick={() => toggleDesign(design)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{design}</span>
                      <span className="text-sm text-gray-600">({totalQuantity} total)</span>
                    </div>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>

                  {/* Expanded Content: Colors > Sizes */}
                  {isExpanded && (
                    <div className="bg-gray-50 border-t">
                      <div className="p-3 space-y-3">
                        {sortedColors.map((color) => {
                          const sizes = colors[color]
                          const colorTotal = getColorTotal(sizes)

                          return (
                            <div key={color} className="bg-white rounded border p-3">
                              {/* Color Header */}
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-4 h-4 rounded border"
                                    style={{ backgroundColor: color.toLowerCase() }}
                                  ></div>
                                  <span className="font-medium text-sm">{color}</span>
                                </div>
                                <span className="text-sm text-gray-600">{colorTotal} pcs</span>
                              </div>

                              {/* Sizes */}
                              <div className="flex flex-wrap gap-2 ml-6">
                                {sizeOrder.map((size) => {
                                  const quantity = sizes[size]
                                  if (!quantity) return null

                                  return (
                                    <div
                                      key={size}
                                      className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm"
                                    >
                                      <span className="text-gray-600">{size}:</span>
                                      <span className="font-medium">{quantity}</span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
