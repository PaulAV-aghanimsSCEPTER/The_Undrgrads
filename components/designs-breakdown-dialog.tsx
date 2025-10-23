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

interface DesignsBreakdownDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orders: Order[]
}

export default function DesignsBreakdownDialog({ open, onOpenChange, orders }: DesignsBreakdownDialogProps) {
  // Group orders by color, size, and design
  const breakdown = orders.reduce(
    (acc, order) => {
      const key = `${order.color}-${order.size}-${order.design}`
      if (!acc[key]) {
        acc[key] = { color: order.color, size: order.size, design: order.design, quantity: 0 }
      }
      acc[key].quantity += 1
      return acc
    },
    {} as Record<string, { color: string; size: string; design: string; quantity: number }>,
  )

  // Sort by color, then size, then design
  const sizeOrder = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"]
  const sorted = Object.values(breakdown).sort((a, b) => {
    if (a.color !== b.color) return a.color.localeCompare(b.color)
    const sizeCompare = sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size)
    if (sizeCompare !== 0) return sizeCompare
    return a.design.localeCompare(b.design)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Designs Needed to Print</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-96 w-full rounded-md border p-4">
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-4 font-bold text-sm border-b pb-2 mb-2">
              <div>COLOR</div>
              <div>SIZE</div>
              <div>DESIGN</div>
              <div>QUANTITY</div>
            </div>
            {sorted.map((item, idx) => (
              <div key={idx} className="grid grid-cols-4 gap-4 text-sm py-1 border-b">
                <div>{item.color}</div>
                <div>{item.size}</div>
                <div>{item.design}</div>
                <div>{item.quantity}</div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
