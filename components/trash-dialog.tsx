"use client"

import { Button } from "@/components/ui/button"

export interface Order {
  id: number
  name: string
  phone?: string
  facebook?: string
  chapter?: string
  address?: string
  color: string
  size: string
  design: string
  qty?: number
  price: number
 payment_status: "pending" | "partially paid" | "fully paid" // add this
  created_at?: string
  isDefective?: boolean
  defectiveNote?: string
}


interface TrashDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trashOrders: Order[]
  onRetrieveOrder: (orderId: number) => void
  onDeleteOrderPermanently: (orderId: number) => void
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
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-gray-200/40 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-2xl w-full mx-4 my-8 border border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Trash ({trashOrders.length})
          </h2>
          <div className="flex gap-2">
            <Button
              onClick={onRetrieveAll}
              disabled={trashOrders.length === 0}
              className="bg-green-600 hover:bg-green-700"
              size="sm"
            >
              Retrieve All
            </Button>
            <Button
              onClick={onDeleteAllPermanently}
              disabled={trashOrders.length === 0}
              variant="destructive"
              size="sm"
            >
              Delete All
            </Button>
          </div>
        </div>

        {/* Trash List */}
        <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
          {trashOrders.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Trash is empty
            </div>
          ) : (
            trashOrders.map((order) => (
              <div
                key={order.id}
                className="p-3 border border-gray-200 rounded-lg flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <div className="text-sm">
                  <div className="font-medium text-gray-800">{order.name}</div>
                  <div className="text-gray-600">
                    {order.color} - {order.size} - {order.design}
                  </div>

                  {/* If defective note exists, show it */}
                  {order.defectiveNote && (
                    <div className="text-xs text-red-500 mt-1 italic">
                      Note: {order.defectiveNote}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => order.id && onRetrieveOrder(order.id)}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    Retrieve
                  </Button>
                  <Button
                    onClick={() =>
                      order.id && onDeleteOrderPermanently(order.id)
                    }
                    variant="destructive"
                    size="sm"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Close Button */}
        <Button
          onClick={() => onOpenChange(false)}
          variant="outline"
          className="w-full"
        >
          Close
        </Button>
      </div>
    </div>
  )
}
