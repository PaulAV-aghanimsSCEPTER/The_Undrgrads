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

interface TShirtsBreakdownDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orders: Order[]
  type: "total" | "designs"
}

export default function TShirtsBreakdownDialog({ open, onOpenChange, orders, type }: TShirtsBreakdownDialogProps) {
  const [expandedColors, setExpandedColors] = useState<Set<string>>(new Set())

  const colorGroups = orders.reduce(
    (acc, order) => {
      if (!acc[order.color]) {
        acc[order.color] = {}
      }
      const sizeKey = order.size
      if (!acc[order.color][sizeKey]) {
        acc[order.color][sizeKey] = 0
      }
      acc[order.color][sizeKey] += 1
      return acc
    },
    {} as Record<string, Record<string, number>>,
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

  const title = type === "total" ? "Total T-Shirts Breakdown" : "Designs Per Size/Color"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-96 w-full rounded-md border p-4">
          <div className="space-y-2">
            {sortedColors.map((color) => {
              const isExpanded = expandedColors.has(color)
              const sizes = colorGroups[color]
              const totalQuantity = Object.values(sizes).reduce((sum, qty) => sum + qty, 0)

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
                      <div className="grid grid-cols-2 gap-2 p-3">
                        {sizeOrder.map((size) => {
                          const quantity = sizes[size] || 0
                          return quantity > 0 ? (
                            <div key={size} className="flex justify-between text-sm p-2 bg-white rounded border">
                              <span className="font-medium">{size}</span>
                              <span className="text-gray-600">{quantity}</span>
                            </div>
                          ) : null
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
