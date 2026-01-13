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
  payment_status: "pending" | "partially paid" | "fully paid" | string
  created_at?: string
  deleted_at?: string
  is_deleted?: boolean
  is_trashed?: boolean
  is_defective?: boolean
  isDefective?: boolean
  defective_note?: string
  defectiveNote?: string
  batch?: string
  batch_folder?: string
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-card text-card-foreground rounded-2xl shadow-xl p-6 max-w-2xl w-full mx-4 my-8 border border-border">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            🗑️ Trash ({trashOrders.length})
          </h2>
          <div className="flex gap-2">
            <Button
              onClick={onRetrieveAll}
              disabled={trashOrders.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white"
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
            <div className="text-center text-muted-foreground py-8">
              <span className="text-4xl block mb-2">🎉</span>
              Trash is empty
            </div>
          ) : (
            trashOrders.map((order) => (
              <div
                key={order.id}
                className="p-3 border border-border rounded-lg flex justify-between items-center hover:bg-accent transition-colors"
              >
                <div className="text-sm">
                  <div className="font-medium flex items-center gap-2 flex-wrap">
                    {order.name}
                    {order.batch && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                        Batch: {order.batch}
                      </span>
                    )}
                    {order.batch_folder && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                        📁 {order.batch_folder}
                      </span>
                    )}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {order.design} • {order.color} • {order.size}
                  </div>

                  {/* Defective Note */}
                  {(order.defectiveNote || order.defective_note) && (
                    <div className="text-xs text-red-500 mt-1 italic">
                      Note: {order.defectiveNote || order.defective_note}
                    </div>
                  )}

                  {/* Deleted Date */}
                  {order.deleted_at && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Deleted: {new Date(order.deleted_at).toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => order.id && onRetrieveOrder(order.id)}
                    className="bg-green-600 hover:bg-green-700 text-white"
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