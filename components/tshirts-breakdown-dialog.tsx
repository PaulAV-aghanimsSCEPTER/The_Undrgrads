"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

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
  // Group orders by color and size
  const breakdown = orders.reduce(
    (acc, order) => {
      const key = `${order.color}-${order.size}`
      if (!acc[key]) {
        acc[key] = { color: order.color, size: order.size, quantity: 0, designs: new Set() }
      }
      acc[key].quantity += 1
      acc[key].designs.add(order.design)
      return acc
    },
    {} as Record<string, { color: string; size: string; quantity: number; designs: Set<string> }>,
  )

  // Sort by color then by size
  const sizeOrder = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"]
  const sorted = Object.values(breakdown).sort((a, b) => {
    if (a.color !== b.color) return a.color.localeCompare(b.color)
    return sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size)
  })

  const title = type === "total" ? "Total T-Shirts Breakdown" : "Designs Per Size/Color"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-96 w-full rounded-md border p-4">
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-4 font-bold text-sm border-b pb-2 mb-2">
              <div>COLOR</div>
              <div>SIZE</div>
              <div>QUANTITY</div>
            </div>
            {sorted.map((item, idx) => (
              <div key={idx} className="grid grid-cols-3 gap-4 text-sm py-1 border-b">
                <div>{item.color}</div>
                <div>{item.size}</div>
                <div>{item.quantity}</div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
