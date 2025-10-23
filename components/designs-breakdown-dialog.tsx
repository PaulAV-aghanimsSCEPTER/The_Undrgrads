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
  const [expandedColors, setExpandedColors] = useState<Set<string>>(new Set())

  const colorGroups = orders.reduce(
    (acc, order) => {
      if (!acc[order.color]) {
        acc[order.color] = {}
      }
      const sizeKey = order.size
      if (!acc[order.color][sizeKey]) {
        acc[order.color][sizeKey] = {}
      }
      if (!acc[order.color][sizeKey][order.design]) {
        acc[order.color][sizeKey][order.design] = 0
      }
      acc[order.color][sizeKey][order.design] += 1
      return acc
    },
    {} as Record<string, Record<string, Record<string, number>>>,
  )

  const sizeOrder = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"]
  const sortedColors = Object.keys(colorGroups).sort()

  const toggleColor = (color: string) => {
    const newExpanded = new Set(expandedColors)
    if (newExpanded.has(color)) {
      newExpanded.delete(color)
    } else {
      newExpanded.add(color)
    }
    setExpandedColors(newExpanded)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Designs Needed to Print</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-96 w-full rounded-md border p-4">
          <div className="space-y-2">
            {sortedColors.map((color) => {
              const isExpanded = expandedColors.has(color)
              const sizes = colorGroups[color]
              const totalQuantity = Object.values(sizes).reduce(
                (sum, sizeData) => sum + Object.values(sizeData).reduce((s, q) => s + q, 0),
                0,
              )

              return (
                <div key={color} className="border rounded">
                  <button
                    onClick={() => toggleColor(color)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded border" style={{ backgroundColor: color.toLowerCase() }}></div>
                      <span className="font-semibold">{color}</span>
                      <span className="text-sm text-gray-600">({totalQuantity} total)</span>
                    </div>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>

                  {isExpanded && (
                    <div className="bg-gray-50 border-t">
                      <div className="p-3 space-y-2">
                        {sizeOrder.map((size) => {
                          const designs = sizes[size]
                          if (!designs || Object.keys(designs).length === 0) return null

                          return (
                            <div key={size} className="bg-white rounded border p-2">
                              <div className="font-medium text-sm mb-2">{size}</div>
                              <div className="space-y-1 ml-2">
                                {Object.entries(designs).map(([design, quantity]) => (
                                  <div key={design} className="flex justify-between text-sm">
                                    <span className="text-gray-700">{design}</span>
                                    <span className="font-medium">{quantity}</span>
                                  </div>
                                ))}
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
