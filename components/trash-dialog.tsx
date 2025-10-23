"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export interface Order {
  id: number
  name: string
  facebook: string
  phone: string
  chapter: string
  address?: string
  orderDate: string
  color: string
  size: string
  design: string
  isDefective?: boolean
  defectiveNote?: string
}

interface TrashDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trashOrders: Order[]
  onRetrieveOrder: (id: number) => void
  onDeleteOrderPermanently: (id: number) => void
  onRetrieveAll: () => void
  onDeleteAllPermanently: () => void
}

export default function TrashDialog({
  open,
  onOpenChange,
  trashOrders,
  onRetrieveOrder,
  onDeleteOrderPermanently,
  onRetrieveAll,
  onDeleteAllPermanently,
}: TrashDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Trash Bin</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 max-h-80 overflow-y-auto mt-4">
          {trashOrders.length === 0 && <p>No deleted orders.</p>}
          {trashOrders.map((order) => (
            <div
              key={order.id}
              className="flex justify-between items-center border p-2 rounded"
            >
              <span>
                {order.name} - {order.design} - {order.color} - {order.size}
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (confirm("Retrieve this order?")) onRetrieveOrder(order.id)
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                  size="sm"
                >
                  Retrieve
                </Button>
                <Button
                  onClick={() => {
                    if (confirm("Delete permanently?")) onDeleteOrderPermanently(order.id)
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                  size="sm"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>

        {trashOrders.length > 0 && (
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button
              onClick={() => {
                if (confirm("Retrieve ALL orders?")) onRetrieveAll()
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Retrieve All
            </Button>
            <Button
              onClick={() => {
                if (confirm("Delete ALL permanently?")) onDeleteAllPermanently()
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Delete All
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
