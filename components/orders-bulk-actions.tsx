"use client"

import { Button } from "@/components/ui/button"

interface OrdersBulkActionsProps {
  totalOrders: number
  onDeleteAll: () => void
  onRetrieveAll?: () => void
  showRetrieve?: boolean
}

export default function OrdersBulkActions({
  totalOrders,
  onDeleteAll,
  onRetrieveAll,
  showRetrieve = false,
}: OrdersBulkActionsProps) {
  return (
    <div className="flex gap-2">
      {showRetrieve && onRetrieveAll && (
        <Button
          className="bg-green-600 text-white hover:bg-green-700"
          size="sm"
          onClick={onRetrieveAll}
          disabled={totalOrders === 0}
        >
          Retrieve All ({totalOrders})
        </Button>
      )}
      <Button
        className="bg-red-600 text-white hover:bg-red-700"
        size="sm"
        onClick={onDeleteAll}
        disabled={totalOrders === 0}
      >
        Delete All ({totalOrders})
      </Button>
    </div>
  )
}
